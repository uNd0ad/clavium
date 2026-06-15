# Deployment — Clavium

Țintă: **Vercel + Postgres administrat** (Neon/Supabase). Documentul listează ce e gata și ce
trebuie schimbat înainte de producție. Variabilele de mediu sunt descrise în [.env.example](.env.example).

## Gata de producție

- **CI** (`.github/workflows/ci.yml`) — lint, typecheck, teste (55) și build pe fiecare PR și push pe `main`.
- **Migrații Prisma** — schema e descrisă complet de migrațiile din `prisma/migrations` (fără drift).
  Deploy-ul rulează `npx prisma migrate deploy` înainte de `next build`.
- **Antete de securitate** — statice în `next.config.js` (X-Frame-Options, nosniff, HSTS în prod etc.)
  plus **CSP cu nonce per-request** în `src/proxy.ts` (proxy-ul Next 16, fostul middleware).
- **Health check** — `GET /api/health` verifică și conectivitatea la DB (200 ok / 503 down).
- **Logging** — `src/lib/logger.ts`: JSON structurat în prod. `captureException` e hook-ul unic pentru
  erori neașteptate (gata pentru un APM — vezi mai jos).
- **Stub-uri de servicii externe** — payments / QES / email / SMS rulează în „mod dev” (acceptate/afișate
  în consolă) cât timp lipsesc cheile, deci aplicația pornește fără ele.

## De schimbat înainte de producție pe Vercel

### 1. Bază de date: SQLite → Postgres (obligatoriu)
Serverless-ul nu poate folosi fișierul SQLite. Pași:
1. În `prisma/schema.prisma` schimbă `datasource.provider` din `"sqlite"` în `"postgresql"`.
2. Setează `DATABASE_URL` pe stringul Postgres. **Folosește URL-ul cu pooling** (Neon pooled / Supabase
   pgbouncer / Prisma Accelerate) — fără pooling, funcțiile serverless epuizează conexiunile.
3. Migrațiile existente sunt scrise în dialect SQLite (`DATETIME`, `TEXT`) și **nu rulează 1:1 pe
   Postgres**. Regenerează-le pe o bază Postgres curată: șterge `prisma/migrations`, apoi
   `prisma migrate dev --name init`. (Schema logică rămâne identică.)
4. `migration_lock.toml` se va actualiza la `provider = "postgresql"`.

### 2. Storage foto: disc local → S3/R2 (obligatoriu)
`src/lib/storage.ts` scrie în `public/uploads` — pe Vercel filesystemul e efemer și read-only la runtime,
deci fotografiile s-ar pierde. Înlocuiește implementarea cu S3/Cloudflare R2 **păstrând aceleași
semnături** (`savePropertyPhoto`/`deletePropertyPhoto`/`parsePhotos`) — apelanții lucrează doar cu URL-uri.

### 3. Rate limiting: in-memory → Redis (obligatoriu la >1 instanță)
`src/lib/rateLimit.ts` ține bucket-urile în memorie; pe serverless fiecare invocare are propria memorie,
deci limita nu se aplică global. Înlocuiește cu Redis/Upstash păstrând semnătura `rateLimit(key, limit, window)`.

### 4. Secret de sesiune (obligatoriu)
Setează `JWT_SECRET` (min. 32 de caractere, `openssl rand -hex 32`). În prod aplicația **refuză să
pornească** cu secretul de dev (vezi `src/lib/constants.ts`). Setează și `APP_URL` la domeniul real.

## Integrări opționale (gated pe cont/cheie)

| Serviciu | Activare | Fișier |
|---|---|---|
| Plăți (Stripe/Netopia) | `PAYMENTS_API_KEY` + implementare | `src/lib/payments.ts` |
| QES eIDAS (certSIGN/Namirial) | `QES_API_KEY` + implementare | `src/lib/qes.ts` |
| Email (Resend/SendGrid/SES) | `EMAIL_API_URL` + `EMAIL_API_KEY` | `src/lib/email.ts` |
| SMS (SMSO.ro) | `SMS_API_URL` + `SMS_API_KEY` + `SMS_SENDER_ID` | `src/lib/sms.ts` |
| APM / error tracking | `SENTRY_DSN` + forward în `captureException` | `src/lib/logger.ts` |

## Checklist de lansare

- [ ] `DATABASE_URL` Postgres (pooled) setat în Vercel
- [ ] `JWT_SECRET` (≥32 car.) și `APP_URL` setate
- [ ] Schema mutată pe `postgresql` + migrații regenerate
- [ ] `src/lib/storage.ts` mutat pe S3/R2
- [ ] `src/lib/rateLimit.ts` mutat pe Redis (dacă scalezi orizontal)
- [ ] Chei pentru email/SMS (minim verificare cont) configurate
- [ ] Health check `/api/health` legat la uptime monitoring
