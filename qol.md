# Life Improvements — îmbunătățiri mici de UX

Un backlog de „quality of life" — schimbări mici, bine delimitate, care fac aplicația mai
plăcută fără a fi feature-uri mari. Bifează pe măsură ce se implementează.

## Implementate

- [x] **Mod întunecat (dark mode)** — comutator soare/lună în navbar, sidebar, bara mobilă și paginile
  de auth. Tema se aplică prin redefinirea tokenilor CSS sub `html.dark`, se persistă în `localStorage`
  și respectă preferința sistemului la prima vizită. Un script no-flash o aplică înainte de paint.
  Suprafețele `bg-white` au fost mutate pe tokenul `--card`. — `src/components/ui/ThemeToggle.tsx`,
  `src/app/globals.css`
- [x] **Editarea proprietăților de către proprietar** — buton „Editează" pe proprietățile
  **disponibile** ale proprietarului, în dashboard (`/dashboard/proprietati`). Deschide un formular
  inline pre-completat (titlu, locație, chirie, camere, suprafață, descriere) și salvează prin
  `updatePropertyAction`. Apare doar pe listările disponibile (nu pe cele închiriate, care au contract
  activ). — `src/components/dashboard/PropertyEditForm.tsx`

## Idei (mici, de făcut)

- [x] **Confirmare la ștergerea unei fotografii** — `ConfirmDialog` înainte de ștergere. —
  `src/components/dashboard/PhotoManager.tsx`
- [x] **Număr de oferte primite pe cardul proprietății** (owner) — link către `/dashboard/oferte`. —
  `src/lib/dashboardData.ts`, `src/app/dashboard/proprietati/page.tsx`
- [ ] **Duplică o listare** — buton care pre-completează formularul de adăugare cu valorile unei
  proprietăți existente (util pentru apartamente similare).
- [ ] **Alege coperta** — reordonarea fotografiilor (drag) sau un buton „setează ca și copertă" pe
  fiecare miniatură, în loc ca prima încărcată să fie mereu coperta.
- [x] **„Copiază linkul"** către o proprietate, de pe pagina de detaliu. —
  `src/components/ui/CopyLinkButton.tsx`, `src/app/proprietati/[id]/page.tsx`
- [x] **Breadcrumbs / „Înapoi la căutare"** pe pagina de detaliu a proprietății.
- [ ] **Submit cu Enter / Cmd+Enter** în formularele cu `textarea` (descrieri).
- [ ] **Sortare în lista proprietarului** — după status (disponibile întâi) sau după chirie.
- [ ] **Format cu separatori de mii în timp ce scrii** la câmpurile de sumă (chirie, ofertă).
- [ ] **Indicator „necitit" pe rândurile de notificări** și marcare individuală (acum doar „tot ca citit").
- [ ] **Stare „se încarcă" pe filtrele de căutare** — momentan o interogare lentă pare blocată.
- [x] **Memorează ultimul tab** (Parolă/OTP) la login, pentru reveniri rapide. —
  `src/app/auth/login/page.tsx`

## Tichete (review pe flux)

Observații din parcurgerea fluxului de tichete (`/dashboard/tichete`) — toate cele de mai jos au fost
implementate.

- [x] **Validare live pe „Subiect" și „Descriere"** — `minLength`/`maxLength` pe câmpuri + indicator de
  caractere care arată câte mai trebuie până la minim, în loc ca eroarea să apară abia după trimitere. —
  `src/components/dashboard/NewTicketForm.tsx`
- [x] **Autofocus pe „Subiect"** la deschiderea formularului de tichet nou. —
  `src/components/dashboard/NewTicketForm.tsx`
- [x] **Submit cu Cmd/Ctrl+Enter** în `textarea` de răspuns (`TicketCard`) și în descrierea tichetului
  nou (`NewTicketForm`), prin `form.requestSubmit()`. —
  `src/components/dashboard/TicketCard.tsx`, `src/components/dashboard/NewTicketForm.tsx`
- [x] **Confirmare la „Închide tichetul"** — `ConfirmDialog` înainte de închidere (închiderea blochează
  conversația până la redeschidere). — `src/components/dashboard/TicketCard.tsx`
- [x] **Indicator „răspuns nou" pe rândul de tichet** — punct brand lângă subiect + badge „Răspuns nou"
  când ultimul mesaj e de la cealaltă parte și a sosit după ultima vizualizare. Citirea e urmărită real
  printr-un model `TicketRead` (readAt per tichet/utilizator), actualizat de `markTicketReadAction` la
  deschiderea tichetului — așa indicatorul se golește când *citești*, nu doar când răspunzi. —
  `prisma/schema.prisma`, `src/app/actions/tickets.ts`, `src/lib/dashboardData.ts`,
  `src/components/dashboard/TicketCard.tsx`
- [x] **Pe rândul colapsat: număr de mesaje + „ultima activitate"** — „N mesaje · activ {timeAgo}" lângă
  data deschiderii, derivat din `messageCount`/`lastActivity`. —
  `src/components/dashboard/TicketCard.tsx`, `src/lib/dashboardData.ts`
- [x] **Filtru/sortare după status și prioritate** în lista de tichete — control client cu filtru pe
  status și sortare activitate/prioritate (urgente întâi). —
  `src/components/dashboard/TicketList.tsx`, `src/app/dashboard/tichete/page.tsx`

> Acestea sunt opționale și se pot lua pe rând, independent. Articolele mai mari (plăți reale, QES,
> Postgres) trăiesc în [TODO.md](TODO.md) și [UX-REVIEW.md](UX-REVIEW.md).
