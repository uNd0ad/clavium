# Changelog

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
