# Deployment — Clavium

Țintă: **Vercel + Postgres administrat** (Neon/Supabase). Documentul listează ce e gata și ce
trebuie schimbat înainte de producție. Variabilele de mediu sunt descrise în [.env.example](.env.example).

## Gata de producție

- **Postgres** — `prisma/schema.prisma` folosește `provider = "postgresql"` cu `directUrl` pentru migrații.
  Schema e descrisă complet de migrația din `prisma/migrations` (init pe dialect Postgres, fără drift).
  Local: `docker compose up -d` (vezi `docker-compose.yml`).
- **CI** (`.github/workflows/ci.yml`) — lint, typecheck, teste (55) și build pe fiecare PR și push pe
  `dev`/`prod`, cu un serviciu Postgres efemer. Testele rulează într-o schemă izolată (`clavium_test`).
- **Build Vercel** (`vercel.json`) — rulează `prisma migrate deploy` înainte de `next build`;
  `postinstall` rulează `prisma generate` (Vercel poate servi un client cache-uit altfel).
- **Antete de securitate** — statice în `next.config.js` (X-Frame-Options, nosniff, HSTS în prod etc.)
  plus **CSP cu nonce per-request** în `src/proxy.ts` (proxy-ul Next 16, fostul middleware).
- **Health check** — `GET /api/health` verifică și conectivitatea la DB (200 ok / 503 down).
- **Logging** — `src/lib/logger.ts`: JSON structurat în prod. `captureException` e hook-ul unic pentru
  erori neașteptate (gata pentru un APM — vezi mai jos).
- **Stub-uri de servicii externe** — payments / QES / email / SMS rulează în „mod dev” (acceptate/afișate
  în consolă) cât timp lipsesc cheile, deci aplicația pornește fără ele.

## Variabile de mediu în Vercel (obligatorii)

- `DATABASE_URL` — Postgres cu **pooling** (Neon `-pooler` + `pgbouncer=true`).
- `DIRECT_URL` — Postgres **direct** (fără pooler), pentru `prisma migrate deploy` la build.
- `JWT_SECRET` — min. 32 de caractere (`openssl rand -hex 32`). În prod aplicația **refuză să pornească**
  cu secretul de dev (vezi `src/lib/constants.ts`).
- `APP_URL` — domeniul real (ex. `https://clavium.ro`), folosit în emailuri/sitemap.

## De schimbat înainte de producție pe Vercel

### 1. Storage foto: disc local → S3/R2 (obligatoriu)
`src/lib/storage.ts` scrie în `public/uploads` — pe Vercel filesystemul e efemer și read-only la runtime,
deci fotografiile s-ar pierde. Înlocuiește implementarea cu S3/Cloudflare R2 **păstrând aceleași
semnături** (`savePropertyPhoto`/`deletePropertyPhoto`/`parsePhotos`) — apelanții lucrează doar cu URL-uri.

### 2. Rate limiting: in-memory → Redis (obligatoriu la >1 instanță)
`src/lib/rateLimit.ts` ține bucket-urile în memorie; pe serverless fiecare invocare are propria memorie,
deci limita nu se aplică global. Înlocuiește cu Redis/Upstash păstrând semnătura `rateLimit(key, limit, window)`.

## Integrări opționale (gated pe cont/cheie)

| Serviciu | Activare | Fișier |
|---|---|---|
| Plăți (Stripe/Netopia) | `PAYMENTS_API_KEY` + implementare | `src/lib/payments.ts` |
| QES eIDAS (certSIGN/Namirial) | `QES_API_KEY` + implementare | `src/lib/qes.ts` |
| Email (Resend/SendGrid/SES) | `EMAIL_API_URL` + `EMAIL_API_KEY` | `src/lib/email.ts` |
| SMS (SMSO.ro) | `SMS_API_URL` + `SMS_API_KEY` + `SMS_SENDER_ID` | `src/lib/sms.ts` |
| APM / error tracking | `SENTRY_DSN` + forward în `captureException` | `src/lib/logger.ts` |

## Checklist de lansare

- [ ] `DATABASE_URL` (pooled) + `DIRECT_URL` (direct) setate în Vercel
- [ ] `JWT_SECRET` (≥32 car.) și `APP_URL` setate
- [x] Schema pe `postgresql` + migrație init (gata)
- [ ] `src/lib/storage.ts` mutat pe S3/R2
- [ ] `src/lib/rateLimit.ts` mutat pe Redis (dacă scalezi orizontal)
- [ ] Chei pentru email/SMS (minim verificare cont) configurate
- [ ] Health check `/api/health` legat la uptime monitoring
