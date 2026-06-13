# Changelog

## 0.5.0 — 2026-06-13

Pas major de UX: feedback modern, interacțiuni instant și un dashboard în limbajul vizual al homepage-ului. Vezi [UX-REVIEW.md](UX-REVIEW.md) pentru analiza completă care a stat la baza acestor schimbări.

### Limbajul vizual al homepage-ului în dashboard
- Antet comun de pagină (`DashboardHeader`): eyebrow `section-label` cu liniuța brand, titlu mare cu tracking strâns și accent colorat — aplicat pe toate cele 8 pagini de dashboard. Layout-ul a rămas neschimbat.
- Fundalul dashboardului trece pe gri (`--bg`, ca homepage), iar cardurile secțiunilor plutesc deasupra cu umbra `surface-card`; etichetele de statistici devin uppercase cu tracking.

### Feedback și interacțiuni (UX batch 1–3)
- **Toast-uri (sonner)** înlocuiesc casetele de status gri în toate formularele și acțiunile (login, register, resetare parolă, profil, proprietăți, oferte, contracte, plăți, admin, fotografii). Succes și eroare sunt distincte și se auto-închid.
- **Dialog de confirmare stilizat** (`ConfirmDialog`) în locul `window.confirm` la dezactivarea contului — backdrop, Escape, focus pe acțiune.
- **Buton cu stare de încărcare** (`Button` + `Spinner`) consistent peste tot, fără salt de lățime.
- **Actualizări optimiste**: salvarea proprietăților comută instant (revine la eroare); „marchează tot ca citit” golește badge-ul imediat.
- **OTP**: lipirea unui cod întreg completează toate căsuțele; `autocomplete="one-time-code"` pentru autofill; cooldown de 30s la retrimitere.
- **Formulare**: toggle arată/ascunde parola pe toate câmpurile de parolă; validare inline la înregistrare (parole care nu se potrivesc / prea scurte); pașii completați din wizard sunt clicabili.
- **Stări goale cu acțiune** (`EmptyState`): căutarea fără rezultate oferă „Resetează filtrele”, listele goale trimit la „Caută proprietăți”.
- **Accesibilitate/polish**: inel de focus vizibil la tastatură, stare `:active` la butoane, contoare de rezultate pe paginile de căutare.

### Notificări
- Tab de notificări în dashboard (sidebar + clopoțel pe mobil) care apare doar când există notificări necitite și dispare după citire. Numărătoarea necitite vine din `/api/notifications/unread`, cu sondaj unic partajat (60s, pauză când tab-ul nu e vizibil).

### Navigație și acces
- Tab-ul „Caută” este disponibil pentru toate rolurile (client, proprietar, admin); buton de deconectare în dashboard (sidebar + meniu mobil).

### Performanță
- Fontul Inter încarcă doar greutățile folosite (400/500/600), reducând fișierele procesate la build/dev.

## 0.4.0 — 2026-06-13

### Fotografii, căutare pentru clienți și UX (follow-up 0.4)
- Fotografii pentru proprietăți: upload la creare/editare de către owner (max 8, JPEG/PNG/WebP, 5 MB), galerie pe pagina de detaliu, thumbnail în listări și dashboard, optimizate cu `next/image`. Storage local pluggable (`src/lib/storage.ts`, `public/uploads`), gata de înlocuit cu S3/R2 în producție.
- Pagină de căutare pentru clienți în dashboard (`/dashboard/cauta`) cu filtre extinse (localitate, chirie min/max, camere, sortare după preț/dată) și salvare + trimitere ofertă direct din listă.
- Buton de deconectare în dashboard (sidebar + meniul mobil).
- Redesign al paginilor de login/register: layout nou cu beneficii reale, titluri și cross-link per pagină, stepper de înregistrare cu numerotare și bife.

### Marketplace funcțional (milestone 0.4)
- Browsing public `/proprietati` cu filtre (căutare, chirie min/max) și pagini de detaliu cu descriere, caracteristici și proprietar.
- CRUD proprietăți pentru owneri din dashboard (adăugare cu descriere/camere/suprafață, dezactivare/reactivare listare).
- Salvare proprietăți (toggle) pentru utilizatori autentificați.
- Flux complet de oferte: clientul trimite oferta de pe pagina proprietății, ownerul acceptă/respinge din dashboard; la acceptare se creează automat contractul și se resping celelalte oferte în curs.
- Flux de semnare contract: fiecare parte semnează (QES prin furnizor pluggable, simulat în dev); la ambele semnături contractul devine ACTIV, proprietatea ÎNCHIRIATĂ și prima chirie devine scadentă.
- Notificări generate de evenimente reale (ofertă primită/acceptată/respinsă, semnătură necesară, contract activ, chirie încasată), cu marcare ca citite.
- Editare profil (nume, telefon cu re-verificare OTP), schimbare parolă (revocă celelalte sesiuni), export GDPR (JSON) și dezactivare cont.
- Panou de administrare: statistici platformă, schimbare roluri, dezactivare/reactivare conturi (cu revocarea sesiunilor).

### Plăți și chirii recurente (milestone 0.5)
- Plata chiriei de către chiriaș (procesator pluggable prin `PAYMENTS_API_KEY`, simulat în dev): chiria devine FINALIZATĂ, se înregistrează comisionul platformei (5%) și se programează următoarea scadență lunară.
- La ultima chirie din contract, contractul se încheie automat și proprietatea redevine disponibilă.

### Securitate
- Sesiuni în baza de date cu revocare: logout, schimbarea/resetarea parolei și acțiunile de admin invalidează token-urile active.
- Fix conturi-fantomă: OTP-ul de email autentifică doar conturi existente (nu mai creează utilizatori automat).
- Codurile OTP (email + SMS) sunt stocate hash-uit (SHA-256); token-urile de email la fel.
- Rate limiting pe login, înregistrare, OTP email/SMS și resetare parolă.
- Verificare email cu link (24h) și resetare parolă prin email (30 min) — serviciu de email pluggable, consolă în dev.
- `JWT_SECRET` puternic obligatoriu în producție (aplicația refuză pornirea cu secretul de dev).
- Security headers (X-Frame-Options, nosniff, Referrer-Policy, HSTS în producție).
- Conturile dezactivate nu se mai pot autentifica pe nicio cale.

### Calitate, SEO, legal
- Pagini de eroare 404/500, loading skeleton pentru dashboard.
- `sitemap.xml` (include proprietățile disponibile) și `robots.txt`.
- Font Inter servit local prin `next/font` (fără Google Fonts CDN).
- Pagini legale `/termeni` și `/confidentialitate`, cookie banner, consimțământ GDPR obligatoriu la înregistrare, linkuri ANPC/SOL în footer.

### Infrastructură
- ESLint (flat config, `eslint-config-next`) — `npm run lint`, zero erori.
- Vitest cu teste unitare pe validări, rate limiting și hashing — `npm test`.
- Workflow GitHub Actions (lint + typecheck + teste + build) la fiecare push/PR.

## 0.3.0 — 2026-06-12

### Dashboard pe date reale
- Modele Prisma noi: `Property`, `SavedProperty`, `Offer`, `Contract`, `Payment`, `Notification`, `PhoneOtp` (migrația `add_dashboard_models`).
- Toate paginile de dashboard (overview, oferte, contracte, proprietăți, plăți, profil) citesc acum din baza de date, cu date filtrate pe rol (ADMIN vede tot, OWNER doar proprietățile/contractele/încasările proprii, CLIENT doar ofertele/contractele/plățile proprii) și stări goale pentru conturile noi.
- Overview cu statistici calculate (venit lunar, contracte active, oferte noi) și alerte generate din starea reală (semnături lipsă, plăți eșuate).
- Clienții sunt redirecționați de la `/dashboard/plati` și `/dashboard/proprietati`, conform regulilor de rol din navigație.
- Script de seed (`npm run db:seed`) cu conturi demo: `admin@clavium.ro`, `owner@clavium.ro`, `client@clavium.ro` (parola `parola123`).

### Înregistrare
- Alegerea rolului (Client / Proprietar) la primul pas; rolul ADMIN este respins server-side la înregistrarea publică.
- Verificare obligatorie a numărului de telefon prin OTP SMS (pas dedicat); înregistrarea este refuzată dacă numărul nu a fost verificat.
- Integrare SMS prin SMSO.ro (`X-Authorization`, sender ID, format E.164, tip `otp`, mesaje de eroare clare); fallback pe consola serverului în dev fără credențiale. Config prin `SMS_API_URL`, `SMS_API_KEY`, `SMS_SENDER_ID`.
- Ecran de succes cu redirecționare automată către dashboard după 5 secunde.

### Autentificare și securitate
- `/dashboard` protejat: redirect la login fără sesiune; token-ul este verificat și contra bazei de date (cookie falsificat = respins).
- Migrare de la convenția `middleware.ts` (deprecat în Next 16) la `proxy.ts`.
- Erorile de validare Zod sunt returnate ca mesaje lizibile, nu ca JSON brut.
- Utilizatorul autentificat real (din DB) este afișat în sidebar, top bar și profil — eliminat utilizatorul mock.
- Codul OTP de email este afișat în consola serverului în dev (nu există încă serviciu de email).

### Platformă
- Upgrade React 18 → 19 (+ `@types/react` 19, `lucide-react` 1.x).
- Tranziții fluide între pagini (`template.tsx` + animație CSS) și între pașii formularului de înregistrare, cu respectarea `prefers-reduced-motion`.
- Curățenie: fișiere duplicate rămase în afara proiectului eliminate.
