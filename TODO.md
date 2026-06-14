# Production Roadmap — Clavium.ro

Stadiul după v0.4.0: fluxurile de produs și securitatea sunt implementate; rămân integrările
externe reale (plăți, QES, email/SMS în producție), migrarea infrastructurii și auditurile finale.

---

## Milestone 0.4 — Fluxurile de bază ale marketplace-ului ✅

- [x] **Browsing public de proprietăți** — `/proprietati` cu filtre (căutare, chirie min/max), pagini de detaliu, metadata SEO
- [x] **CRUD proprietăți pentru owneri** — adăugare/dezactivare/reactivare din dashboard, cu upload de fotografii
- [x] **Salvare proprietăți** — toggle pe pagina proprietății, vizibile în dashboard
- [x] **Flux de oferte** — trimitere de pe pagina proprietății; acceptare/respingere din dashboard; la acceptare se creează contractul și se resping ofertele concurente
- [x] **Generare contract** — automat la acceptarea ofertei, cu chiria din ofertă *(doar auto-creare — vezi „Generator de contracte")*
- [x] **Flux de semnare** — ambele părți semnează, contract ACTIV + proprietate ÎNCHIRIATĂ + prima scadență automat
- [x] **Notificări funcționale** — generate de evenimente reale, cu marcare ca citite
- [x] **Editare profil** — nume/telefon, schimbare parolă, export GDPR, dezactivare cont
- [x] **Panou de administrare** — statistici, schimbare roluri (inclusiv ADMIN), dezactivare conturi
- [x] **Buton de deconectare în dashboard** — în sidebar și în meniul mobil
- [x] **Listări de proprietăți pentru clienți în dashboard** — `/dashboard/cauta` cu filtre extinse (localitate, chirie min/max, camere, sortare preț/dată) și salvare + trimitere ofertă direct din listă
- [x] **Fix design pe paginile de login/register** — layout nou, titluri per pagină, stepper cu numerotare și bife
- [x] **Fotografii pentru proprietăți** — upload la creare/editare (owner), galerie pe pagina de detaliu, thumbnail în listări și dashboard, optimizate cu `next/image` *(storage local pe disc — S3/R2 pentru producție, vezi secțiunea Infrastructură)*

## Milestone 0.5 — Bani și semnătură calificată (parțial)

- [x] **Flux de plăți** — plata chiriei, comision 5%, încheierea automată a contractului la final
- [ ] **Procesator de plăți real** — integrare Stripe sau Netopia în `src/lib/payments.ts` (azi: simulat în dev prin `PAYMENTS_API_KEY` absent)
- [x] **Programare chirii recurente** — scadență lunară automată după fiecare plată, alerte la scadențe în overview
- [ ] **QES real** — integrare furnizor eIDAS (certSIGN/Namirial) în `src/lib/qes.ts` (azi: simulat în dev)
- [ ] **Facturare comisioane** — generare facturi + e-Factura

## Generator de contracte — flux complet (planificat)

Azi contractul e doar o înregistrare în DB (chirie + durată implicită), creată la acceptarea
ofertei; nu există un document propriu-zis. Acest milestone adaugă fluxul complet de generare:

- [ ] **Termenii contractului** — la acceptarea ofertei, ownerul completează termenii compleți:
  durată (dată început/sfârșit sau nr. luni), garanție (depozit), zi de scadență a chiriei,
  utilități incluse, clauze speciale. *(Extinde modelul `Contract`: `deposit`, `startDate`/`endDate`,
  `dueDay`, `clauses`, `documentUrl`.)*
- [ ] **Generarea documentului** — completarea unui șablon de contract de închiriere (conform
  Legii 214/2024 / Codului civil) cu termenii agreați → HTML → PDF. *(`src/lib/contractTemplate.ts`
  + `src/lib/contractPdf.ts`; librărie `@react-pdf/renderer` sau `pdf-lib`/puppeteer.)*
- [ ] **Previzualizare** — pagină de detaliu contract (`/dashboard/contracte/[id]`) unde ambele
  părți văd documentul generat înainte de a semna.
- [ ] **Stocare PDF** — salvarea documentului prin stratul de storage (`src/lib/storage.ts`),
  legat de „Storage fișiere în producție" din Infrastructură.
- [ ] **Semnare pe document** — fluxul QES existent (`signContractAction` + `src/lib/qes.ts`)
  semnează acest document; aplicarea semnăturilor + timestamp pe PDF-ul final.
- [ ] **Descărcare** — ambele părți descarcă contractul (preview nesemnat / final semnat),
  similar cu exportul GDPR.

## Înregistrare pentru firme (persoane juridice) (parțial)

Înregistrarea (`/auth/register`) suportă acum atât persoane fizice, cât și juridice.

- [x] **Tip cont la înregistrare** — comutator persoană fizică / juridică în wizard, pe lângă rol
  (Client/Proprietar). — `src/app/auth/register/page.tsx`
- [x] **Date firmă** — denumire, CUI/CIF, nr. înregistrare ORC (J…), adresă sediu, plătitor de TVA;
  câmpuri pe `User` (`accountType`, `company*`); firstName/lastName = reprezentant legal. Afișate în profil.
- [x] **Validare fiscală** — checksum CUI + format J-number (`src/lib/fiscalCode.ts`, testate).
  *(verificare la ANAF — opțional, încă nu)*
- [ ] **Folosire în contracte și facturi** — datele firmei apar ca parte în contractul generat
  (vezi „Generator de contracte") și pe facturile de comision / e-Factura.
- [ ] **KYC pentru firme** — verificarea identității și a împuternicirii reprezentantului legal
  (leagă „Verificarea identității ownerilor" din Legal).

## Pin pe hartă (Google Maps) pentru proprietăți exclusive (planificat)

Locația exactă a proprietății afișată pe hartă (pin Google Maps), disponibilă doar pentru
proprietarii care semnează un **acord de exclusivitate** cu platforma. (Homepage-ul promite deja
„hartă clară", dar momentan nu există nicio hartă.)

- [ ] **Acord de exclusivitate** — proprietarul semnează exclusivitatea (poate refolosi fluxul QES din
  „Generator de contracte"); flag pe owner sau pe proprietate (`exclusive: boolean` sau model
  `ExclusivityAgreement`).
- [ ] **Coordonate proprietate** — `lat`/`lng` pe modelul `Property`, completate la adăugare/editare:
  fie geocoding din adresă, fie un selector pe hartă (drag pin). Adresa exactă rămâne ascunsă la
  proprietățile ne-exclusive.
- [ ] **Integrare Google Maps** — `@vis.gl/react-google-maps` sau Maps JS API; `GOOGLE_MAPS_API_KEY`
  în `.env` (cheie restricționată pe domeniu + facturare). Pin pe pagina de detaliu, opțional în listări.
- [ ] **Gating** — pinul exact apare doar pentru proprietățile exclusive; la cele ne-exclusive doar
  zona aproximativă (cartier/oraș) sau fără hartă.

## Import listare din alte platforme (planificat)

Dacă proprietarul are deja proprietatea publicată pe alt site (OLX, Imobiliare.ro, Storia etc.),
o poate importa în loc să reintroducă totul manual.

- [ ] **Import din URL** — proprietarul lipește linkul anunțului; sistemul extrage titlu, descriere,
  preț/chirie, camere, suprafață, localitate și fotografii, apoi pre-completează formularul de adăugare
  (`PropertyForm`) pentru revizuire înainte de publicare.
- [ ] **Parsere per platformă** — adaptoare pentru cele mai folosite site-uri din RO (OLX,
  Imobiliare.ro, Storia, …); strat comun de import cu un parser per sursă. *(`src/lib/import/`.)*
- [ ] **Import fotografii** — descărcarea imaginilor din anunțul sursă și salvarea prin
  `src/lib/storage.ts` (cu limitele existente: max 8, dimensiune, format).
- [ ] **Aspecte legale și robustețe** — verificarea ToS-ului platformelor sursă (scraping-ul poate fi
  interzis) și a drepturilor asupra fotografiilor/descrierii; parserele se strică la schimbarea
  site-urilor → degradare grațioasă (import parțial + completare manuală).

## Comision degresiv pentru vânzări (planificat)

Platforma gestionează azi doar închirieri (comision fix 5% pe chirie — `COMMISSION_PERCENT` în
`src/lib/constants.ts`). Pentru cazurile de **vânzare** (homepage-ul promovează deja „Cumpărare"),
un comision pe scală degresivă: cu cât prețul e mai mare, cu atât procentul e mai mic.

- [ ] **Flux de vânzare** — tip tranzacție „vânzare" pe proprietate/ofertă (azi totul e închiriere):
  ofertă → acceptare → contract de vânzare-cumpărare → comision la finalizare.
- [ ] **Scală de comision** — sub 100.000 € → **2,5%**; peste 1.000.000 € → **0,1%**; între praguri
  interpolare graduală descrescătoare. Implementare ca funcție pură testabilă
  (`saleCommission(price)` în `src/lib/commission.ts`). Variantă de bază (liniară pe procent):
  `rate = 2,5% − (preț − 100k) / (1M − 100k) × (2,5% − 0,1%)` *(ex.: 550.000 € → 1,3%)*.
- [ ] **Curba de interpolare** — de confirmat: liniară (mai sus) vs. logaritmică vs. pe tranșe;
  documentată cu exemple, transparentă pentru utilizatori.
- [ ] **Afișare + valută** — comisionul estimat afișat înainte de acceptare/finalizare; lucrul în EUR
  *(atenție la conversia/cursul RON↔EUR, dacă prețurile sunt afișate și în RON)*.

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
- [ ] **Storage fișiere în producție** — azi fotografiile se salvează local pe disc (`src/lib/storage.ts`, `public/uploads`); de înlocuit cu S3/R2 (păstrând semnăturile din `storage.ts`) + storage pentru PDF-uri contracte
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
