# Production Roadmap — Clavium.ro

Stadiul după v0.4.0: fluxurile de produs și securitatea sunt implementate; rămân integrările
externe reale (plăți, QES, email/SMS în producție), migrarea infrastructurii și auditurile finale.

---

## Milestone 0.4 — Fluxurile de bază ale marketplace-ului ✅

- [x] **Browsing public de proprietăți** — `/proprietati` cu filtre (căutare, chirie min/max), pagini de detaliu, metadata SEO
- [x] **CRUD proprietăți pentru owneri** — adăugare/dezactivare/reactivare din dashboard *(upload de fotografii încă nu — necesită storage extern)*
- [x] **Salvare proprietăți** — toggle pe pagina proprietății, vizibile în dashboard
- [x] **Flux de oferte** — trimitere de pe pagina proprietății; acceptare/respingere din dashboard; la acceptare se creează contractul și se resping ofertele concurente
- [x] **Generare contract** — automat la acceptarea ofertei, cu chiria din ofertă *(PDF descărcabil încă nu)*
- [x] **Flux de semnare** — ambele părți semnează, contract ACTIV + proprietate ÎNCHIRIATĂ + prima scadență automat
- [x] **Notificări funcționale** — generate de evenimente reale, cu marcare ca citite
- [x] **Editare profil** — nume/telefon, schimbare parolă, export GDPR, dezactivare cont
- [x] **Panou de administrare** — statistici, schimbare roluri (inclusiv ADMIN), dezactivare conturi
- [ ] **Buton de deconectare în dashboard** — sidebar + meniul mobil (azi logout există doar în navbar-ul paginii publice)
- [ ] **Listări de proprietăți pentru clienți în dashboard** — secțiune de browsing în dashboardul clientului (azi doar pagina publică `/proprietati`), cu filtre extinse: localitate, chirie min/max, număr de camere, suprafață, sortare după preț/dată; salvare și trimitere ofertă direct din listă
- [ ] **Fix design pe paginile de login/register** — revizuire vizuală a paginilor de autentificare
- [ ] **Fotografii pentru proprietăți** — upload la creare/editare (owner), galerie pe pagina de detaliu, thumbnail în listări și dashboard; necesită storage (local în dev, S3/R2 în producție) + `next/image` pentru optimizare

## Milestone 0.5 — Bani și semnătură calificată (parțial)

- [x] **Flux de plăți** — plata chiriei, comision 5%, încheierea automată a contractului la final
- [ ] **Procesator de plăți real** — integrare Stripe sau Netopia în `src/lib/payments.ts` (azi: simulat în dev prin `PAYMENTS_API_KEY` absent)
- [x] **Programare chirii recurente** — scadență lunară automată după fiecare plată, alerte la scadențe în overview
- [ ] **QES real** — integrare furnizor eIDAS (certSIGN/Namirial) în `src/lib/qes.ts` (azi: simulat în dev)
- [ ] **Facturare comisioane** — generare facturi + e-Factura

## Securitate ✅ (rămâne doar operaționalul)

- [x] **Serviciu de email pluggable** — `src/lib/email.ts`; consolă în dev, `EMAIL_API_URL/KEY` în producție *(de ales și configurat furnizorul real: Resend/SendGrid/SES)*
- [x] **Verificare email** — link cu token (24h), banner + retrimitere din profil
- [x] **Resetare parolă prin email** — `/auth/reset-parola`, token 30 min, revocă sesiunile
- [x] **Rate limiting** — login, înregistrare, OTP email/SMS, resetare *(în memorie; la scalare orizontală → Redis)*
- [x] **Fix conturi-fantomă** — OTP email autentifică doar conturi existente
- [x] **Hash-uirea codurilor OTP și a token-urilor de email** (SHA-256)
- [x] **JWT_SECRET obligatoriu în producție** — aplicația refuză pornirea cu secret slab
- [x] **Revocare sesiuni** — sesiuni în DB; logout/schimbare parolă/acțiuni admin le invalidează
- [x] **Security headers** — X-Frame-Options, nosniff, Referrer-Policy, HSTS (prod)
- [x] **Verificări de rol pe toate API-urile de mutație** — `requireUser(roles)` peste tot
- [ ] **Rotirea cheii SMSO** expusă în timpul dezvoltării *(acțiune manuală în contul SMSO)*

## Infrastructură și operare

- [ ] **SQLite → PostgreSQL** (Neon/Supabase/RDS) — schema Prisma e pregătită, doar provider + migrare
- [ ] **Storage fișiere** — S3/R2 pentru fotografii proprietăți și PDF-uri contracte
- [ ] **Medii separate** — dev/staging/producție cu secrets manager
- [x] **CI** — GitHub Actions: lint + typecheck + teste + build pe push/PR
- [ ] **CD** — deploy automat (Vercel sau container)
- [x] **ESLint** — flat config `eslint-config-next`, zero erori
- [ ] **Monitoring** — Sentry, logging structurat, uptime, analytics
- [ ] **Backup-uri DB** automate + plan de restore testat

## Calitate

- [x] **Teste unitare** — vitest pe validări, rate limiting, hashing (`npm test`)
- [ ] **Teste de integrare pe API** + **E2E Playwright** pe fluxurile critice
- [x] **Pagini de eroare** — 404/500 personalizate, loading skeleton pe dashboard
- [ ] **Audit accesibilitate** — axe/Lighthouse complet *(aria pe OtpInput făcut)*
- [x] **SEO** — sitemap.xml dinamic, robots.txt, metadata per pagină
- [x] **Font local** — Inter prin next/font, fără Google Fonts CDN
- [ ] **Audit performanță** — Lighthouse + next/image când apar fotografiile

## Legal și conformitate ✅ (texte de validat cu un avocat)

- [x] **GDPR** — politică de confidențialitate, consimțământ la înregistrare, cookie banner, export date (JSON), dezactivare cont
- [x] **Termeni și condiții** + linkuri ANPC/SOL în footer
- [ ] **Verificarea identității ownerilor** (KYC) — la primul contract

---

### Checklist final de lansare

- [ ] Procesator de plăți + QES + email reale conectate și testate
- [ ] PostgreSQL + backup-uri + monitoring live
- [ ] Cheia SMSO rotită; secrets în manager, nu în `.env`
- [ ] Teste E2E verzi pe: înregistrare, login, ofertă → contract → plată
- [ ] Texte legale validate juridic
- [ ] Load test de bază pe API-urile de auth
- [ ] Domeniu, TLS, email tranzacțional cu domeniu propriu (SPF/DKIM)
