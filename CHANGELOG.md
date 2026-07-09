# Changelog

## 1.3.7 — 2026-07-03

- Fix: `notify()` nu mai poate strica un flux de business deja finalizat. În `settleRent()`/
  `settleSale()` notificarea rula DUPĂ comiterea tranzacției cu bani — un insert eșuat arunca
  eroare după încasare (webhook-ul Stripe dădea 500 și reîncerca, iar claim-ul idempotent sărea
  definitiv peste notificare și audit; utilizatorul vedea eroare la o plată reușită). Acum
  `notify()` urmează modelul `recordAuditSafe`: nu aruncă niciodată, eșecul se loghează prin
  `captureException`. Se aplică tuturor celor ~44 de apeluri (oferte, contracte, KYC, dunning etc.).
- Fix securitate: `errorMessage()` nu mai scurge erori interne către utilizator. Orice excepție
  care nu e o eroare „de business" (aruncată ca `new Error('mesaj în română')`) — erori Prisma cu
  nume de tabele, `TypeError` din fetch, erori de SDK — nu mai ajunge brută în toast: e trimisă la
  `captureException`, iar utilizatorul vede mesajul generic. Mesajele curate trec neschimbate.

## 1.3.6 — 2026-07-03

- Fix: fundalul (gradientul) primului slide se **întinde pe tot ecranul**, nu mai e „încutiat" la
  lățimea conținutului (max-w-[1600px]). Cauza: `.reveal.visible` are `transform`, deci containerul
  de conținut devenea bloc de referință pentru poziționarea absolută, iar fundalul `absolute inset-0`
  era limitat la 1600px pe monitoare late (vizibil doar cu animații active). Fundalul e acum randat
  la nivel de `<section>` (slot nou `background` în SlideShell), în afara containerului `.reveal`.
  Layout-ul conținutului rămâne neschimbat.

## 1.3.5 — 2026-07-03

- Slide 1 (homepage): revenit la dimensiunile anterioare (v1.3.3) pentru secțiunea „caut o locuință"
  și pentru sliderul de proprietăți — fără întinderea pe toată înălțimea slide-ului. Blocul rămâne
  la mărimea lui naturală (simetric), chiar dacă lasă spațiu gol sus/jos.

## 1.3.4 — 2026-07-03

- Slide 1 (homepage): conținutul **umple întreg slide-ul** pe desktop (înălțime = viewport minus
  padding-ul SlideShell), nu mai plutește centrat cu benzi goale sus/jos. Hero-ul distribuie mesajul
  sus și căutarea jos, aliniat cu sliderul de proprietăți (simetrie sus/jos). Layout-ul stivuit
  (sub xl) rămâne neschimbat.

## 1.3.3 — 2026-07-03

- Slide 1 (homepage): sliderul de „proprietăți recente" e acum **simetric** cu blocul hero (aceeași
  înălțime, aliniat sus și jos) pe desktop.
- Cardurile din slider redesenate: **mai multă fotografie** (badge de status peste imagine) și corp
  de exact **3 rânduri** — titlu / detalii (locație · camere · suprafață) / preț cu **echivalent în
  euro** (adăugat și la chirie, nu doar la vânzare).
- Fix: eliminată **dunga de umbră** de sub navbar. Bara transparentă de pe desktop (nesuluită)
  proiecta o umbră (`shadow-sm`) peste primul slide — acum umbra apare doar când bara are fundal
  solid (suluită sau pe mobil).

## 1.3.2 — 2026-07-03

- Slide 1 (homepage): „proprietăți recente" e acum un **slider vertical** — o coloană, ~2 rânduri
  vizibile, cu auto-scroll continuu și lin (buclă fără salt), fade sus/jos, pauză la hover și oprit
  complet la `prefers-reduced-motion`.

## 1.3.1 — 2026-07-02

- Homepage: listările recente arată acum **date proaspete** la fiecare încărcare (eliminat cache-ul
  de ~10 min din `getHomeData`). Fotografiile actualizate ale proprietăților apar imediat, nu cu
  întârziere. Ruta e oricum randată dinamic, iar interogările sunt ieftine.
- Autentificare **fără „flash"** în bara de sus: starea de logat/delogat e rezolvată acum pe server
  (`getNavUser` din cookie) și trimisă Navbar-ului ca `initialUser`, deci pagina se randează corect
  din primul render — fără fetch client-side care întârzia afișarea contului. `getCurrentUser` e
  memoizat pe request (React `cache()`) pentru a evita interogări DB duplicate. Fetch-ul client
  rămâne doar ca fallback pe paginile de eroare client.

## 1.3.0 — 2026-07-02

- Slide 1 (homepage): listările recente sunt acum **alături de hero**, nu sub el. Pe desktop
  (≥1280px) hero-ul (titlu + căutare) stă în stânga, iar listările în dreapta — două carduri
  compacte sus + al treilea pe toată lățimea coloanei, încadrându-se pe înălțimea slide-ului.
  Sub 1280px layout-ul se stivuiește curat: hero pe toată lățimea, apoi cele trei carduri pe un rând.

## 1.2.3 — 2026-07-02

- CSP: pe deployment-urile **Preview** Vercel (nu în producție reală) permitem bara Vercel Live —
  `frame-src`/`script-src`/`style-src`/`img-src`/`font-src`/`connect-src` pentru `vercel.live`
  (+ websocket Pusher). Producția rămâne strict blocată, fără origini terțe. Rezolvă eroarea
  „Refused to load … vercel.live/…/feedback.html".
- `/api/auth/me`: vizitatorii neautentificați primesc acum **200 `{ user: null }`** în loc de 401 —
  „cine sunt?" pentru un vizitator delogat nu e o eroare. Elimină eroarea 401 din consola browserului
  la fiecare încărcare de pagină. Comportamentul din Navbar rămâne identic.
- Footer aliniat cu restul paginii: container lărgit la `max-w-[1600px]` + `lg:px-16` (era
  `max-w-7xl`/`lg:px-12`, mai îngust decât navbar-ul și slide-urile). Adresa și programul sunt acum
  text simplu, nu linkuri moarte `href="#"`.

## 1.2.2 — 2026-07-02

- Slide 1 (homepage): eliminat panoul de valoare din dreapta hero-ului (proprietari verificați ·
  contract QES · plăți securizate + CTA). Hero-ul revine la o singură coloană — mesaj + căutare —
  urmat de rândul de listări recente.

## 1.2.1 — 2026-07-01

- Slide 1 (homepage): container lărgit (`max-w-[1600px]`, aliniat cu navbar) — slide-ul se
  întinde pe lățimea monitorului în loc de o cutie centrată îngustă.
- Listările recente sunt acum pe **un singur rând**, cu carduri **compacte** (~25% mai mici).
- Panoul de valoare (proprietari verificați · contract QES · plăți securizate + CTA) e afișat
  mereu pe coloana dreaptă a hero-ului, echilibrând partea de sus.

## 1.2.0 — 2026-07-01

- Enforcarea strictă a `JWT_SECRET` se aplică acum doar deployment-ului de **producție real**
  (`VERCEL_ENV=production`), nu tuturor deployment-urilor. Astfel, deployment-urile **Preview**
  (ex. branch-ul `dev`) pornesc cu un secret de fallback fără configurare completă, iar producția
  rămâne strictă. Notă de securitate: pe Preview sesiunile sunt semnate cu un secret de dev cunoscut
  — setează `JWT_SECRET` și pe Preview pentru medii cu utilizatori/date reale.

## 1.1.1 — 2026-07-01

- Fix layout pe primul slide al homepage-ului: hero pe **2 coloane** (mesaj + căutare la stânga,
  listări reale la dreapta), care umple pagina în loc să plutească centrat sus-stânga.
- Fallback când nu există listări disponibile: coloana din dreapta arată un panou de valoare
  (proprietari verificați · contract QES · plăți securizate) + CTA, în loc de o secțiune goală.

## 1.1.0 — 2026-07-01

### Homepage regândit — „slide deck" în 4 slide-uri
- Pagina principală restructurată dintr-o listă minimală de funcții într-un deck de 4 slide-uri orientate spre vânzare, fiecare adresat unei audiențe (în ordinea pâlniei):
  - **Slide 1 — chiriași & cumpărători**: titlu pe beneficiu („direct de la proprietar, fără comision"), căutare + listări reale + CTA.
  - **Slide 2 — proprietari**: modelul dual — self-service (listare gratuită, semnătură QES online) vs. administrat de Clavium (de la 8%).
  - **Slide 3 — dezvoltatori & spații comerciale**: ansambluri rezidențiale, spații de birouri pentru companii, spații comerciale; CTA de tip lead (demo).
  - **Slide 4 — cum funcționează**: proces + încredere (QES/eIDAS/Legea 214) + contoare reale.
- Pagină publică nouă **`/servicii`** cu oferta de administrare (până acum doar în dashboard); catalog de servicii partajat (`src/lib/services.ts`), reutilizat pe homepage, `/servicii` și în dashboard.
- Copy bilingv (RO/EN) pentru slide-uri; snap blând între slide-uri (respectă „mișcare redusă"); secțiunile vechi de landing (inclusiv cardurile cu linkuri moarte) retrase. E2E Playwright extins pentru cele 4 slide-uri.

## 1.0.1 — 2026-06-30

- **Curs EUR/RON din feed-ul oficial BNR** (cache ~6h), cu `EUR_RON_RATE` ca override manual și fallback la indisponibilitate.
- **Stocare S3 compatibilă cu Cloudflare R2** — checksum-uri forțate la `WHEN_REQUIRED` (implicitul AWS SDK v3 corupe încărcările pe R2) + `STORAGE_S3_FORCE_PATH_STYLE` opțional.

## 1.0.0 — 2026-06-30

Prima lansare publică plătită — tot roadmap-ul de lansare, peste pasul de stabilitate + performanță.

### Trust & safety
- Recenzii/reputație, detecție de fraudă la listări (perceptual image hashing), raportare abuz + coadă de moderare.

### Securitate & confidențialitate
- Retenție KYC + consimțământ biometric (GDPR art. 9, purjare automată); 2FA TOTP (RFC 6238, coduri de rezervă) aplicat la login prin parolă și prin OTP; management sesiuni/dispozitive + alertă la dispozitiv nou.

### Domeniu
- Dunning (reamintiri/restanțe), ciclu de viață contract (reziliere/reînnoire), garanție + arvună, mesagerie precontract, registru de audit înlănțuit prin hash, unelte de suport admin, versionare T&C.

### Growth
- i18n (RO/EN), ISR + schema.org + OpenGraph pentru listări, plată automată a chiriei, căutări salvate + alerte + program de recomandare, chitanțe/facturi PDF, multi-valută (RON/EUR).

### Ops & integrări (env-gated)
- Sentry (dependență opțională), E2E Playwright, pas de accesibilitate/performanță; scaffold-uri: stocare S3/R2, PDF contract, hărți, import listări, e-Factura (UBL), payouts Stripe Connect. Comision de vânzare degresiv; sarcini programate (Vercel Cron).

## 0.9.10 — 2026-06-27

- Pas de întărire a stabilității și performanței (guard-uri atomice, advisory locks, tuning de interogări).
- Generare PDF a contractelor cu font Noto Sans încorporat (diacritice corecte pe serverless).

## 0.9.6 — 2026-06-20

- Trimitere email tranzacțional prin SMTP (nodemailer).

## 0.9.5 — 2026-06-20

- Rate limiting partajat, sigur pe serverless, prin Upstash Redis.

## 0.9.4 — 2026-06-20

- Întărire pentru producție: integrări externe care eșuează zgomotos + validarea variabilelor de mediu la pornire.

## 0.9.3 — 2026-06-20

- Tab nou „Servicii" pentru proprietari; infrastructură de test pe telefon în LAN.

## 0.9.2 — 2026-06-19

- KYC cu camera pe telefon fără HTTPS; redirect-uri de plată corecte pe gazda reală.

## 0.9.1 — 2026-06-19

- KYC: potrivire facială reală (captură live act de identitate + selfie), fără aprobare automată.

## 0.9.0 — 2026-06-19

- Verificare identitate (KYC) + infrastructură pentru semnătură QES + confirmarea plății la întoarcere.

## 0.8.4 — 2026-06-17

- Integrare Stripe Checkout (hosted) + decontare prin webhook.

## 0.8.3 — 2026-06-16

- Polish UI: iconuri lucide consistente, dark-mode corect, căutarea din hero funcțională.

## 0.8.2 — 2026-06-16

- Corecții CSP / plăți / securitate + sweep de design tokens.

## 0.8.1 — 2026-06-15

- Secțiune de tichete pentru chiriași; pagini custom 404 / eroare.

## 0.8.0 — 2026-06-15

- Flux complet de vânzare-cumpărare: antecontract, avans (arvună) + diferență de preț, transfer de proprietate.

## 0.7.0 — 2026-06-14

### Înregistrare pentru firme (persoane juridice)
- Wizard-ul de înregistrare suportă acum tip cont **persoană fizică / juridică** (pe lângă rol).
- Pentru firme: denumire, CUI/CIF, nr. înregistrare ORC (J…), adresă sediu, plătitor TVA;
  firstName/lastName devin reprezentantul legal. Câmpuri pe `User` (`accountType`, `company*`),
  migrația `company_accounts`.
- Validare fiscală: checksum CUI + format J-number (`src/lib/fiscalCode.ts`).
- Datele firmei afișate în profil (card „Date firmă").
- Teste: validatoare fiscale + schema de înregistrare pentru firme (34 teste în total).

## 0.6.1 — 2026-06-14

### Suită de teste
- Harness de testare cu bază de date izolată (`prisma/test.db`) și mock-uri pentru API-urile Next (`getCurrentUser`, `next/cache`, `next/headers`).
- Test de integrare pentru tot ciclul de viață prin server actions: proprietate → ofertă → contract → semnare → plată (cu comision și următoarea scadență).
- Teste pentru paznicii de autentificare și roluri (auth, rol greșit, auto-ofertă, ofertă dublă, semnare/plată de către persoane neîndreptățite, acțiuni de admin) și operații pe proprietăți (salvare, editare, dezactivare, respingere ofertă). 27 de teste în total.

### Mod întunecat (dark mode)
- Comutator soare/lună în navbar, sidebar, bara mobilă și paginile de auth; tema persistă în `localStorage` și respectă preferința sistemului, cu script no-flash înainte de paint.
- Implementat prin redefinirea tokenilor CSS sub `html.dark`; suprafețele `bg-white` mutate pe tokenul `--card`.

### Editarea proprietăților
- Buton „Editează" pe proprietățile disponibile ale proprietarului — formular inline pre-completat, salvat prin `updatePropertyAction` (cu verificare de proprietar și validare).

### Note
- Backlog nou de îmbunătățiri mici de UX: [qol.md](qol.md).

## 0.6.0 — 2026-06-14

### Migrare la Server Actions
- Mutațiile (proprietăți, oferte, contracte, notificări, profil, admin) au fost mutate din rute API în Server Actions (`src/app/actions/`), abordarea idiomatică Next 16 / React 19.
- Componentele client apelează acțiunile prin `useTransition` în loc de `fetch`; `router.refresh()` a fost înlocuit cu `revalidatePath` în acțiuni. Comportamentul (toast-uri, actualizări optimiste) este identic.
- 12 rute API de mutație au fost eliminate. Rămân pe rute: tot `/api/auth/*` (cookie-uri, redirect, rate limit) și endpoint-urile GET `notifications/unread` și `profile/export`.
- Helper nou `requireActionUser` pentru autentificare/roluri în context de acțiune.

## 0.5.1 — 2026-06-14

### Experiența cu fotografii
- Galerie cu lightbox pe pagina de detaliu a proprietății (`PropertyGallery`): click pentru full-screen, navigare cu săgeți/tastatură, swipe pe mobil, contor și închidere cu Escape/backdrop.
- Indicator „Copertă" pe prima fotografie în managerul de fotografii al proprietarului.

### Flux ghidat (next-steps)
- Alertele din overview sunt acum linkuri către secțiunea relevantă (contracte / plăți).
- Mesaj „Rândul tău să semnezi" pe contractele care îți așteaptă semnătura.
- La acceptarea unei oferte, toast-ul oferă acțiunea „Vezi contractul" către contractul nou creat.

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
