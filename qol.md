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

- [ ] **Confirmare la ștergerea unei fotografii** — momentan ștergerea e instantanee; un `ConfirmDialog`
  scurt ar preveni greșelile.
- [ ] **Număr de oferte primite pe cardul proprietății** (owner) — „3 oferte în așteptare" direct pe
  listare, ca scurtătură către `/dashboard/oferte`.
- [ ] **Duplică o listare** — buton care pre-completează formularul de adăugare cu valorile unei
  proprietăți existente (util pentru apartamente similare).
- [ ] **Alege coperta** — reordonarea fotografiilor (drag) sau un buton „setează ca și copertă" pe
  fiecare miniatură, în loc ca prima încărcată să fie mereu coperta.
- [ ] **„Copiază linkul"** către o proprietate, de pe pagina de detaliu și din dashboard.
- [ ] **Breadcrumbs / „Înapoi la căutare"** pe pagina de detaliu a proprietății.
- [ ] **Submit cu Enter / Cmd+Enter** în formularele cu `textarea` (descrieri).
- [ ] **Sortare în lista proprietarului** — după status (disponibile întâi) sau după chirie.
- [ ] **Format cu separatori de mii în timp ce scrii** la câmpurile de sumă (chirie, ofertă).
- [ ] **Indicator „necitit" pe rândurile de notificări** și marcare individuală (acum doar „tot ca citit").
- [ ] **Stare „se încarcă" pe filtrele de căutare** — momentan o interogare lentă pare blocată.
- [ ] **Memorează ultimul tab** (Parolă/OTP) la login, pentru reveniri rapide.

> Acestea sunt opționale și se pot lua pe rând, independent. Articolele mai mari (plăți reale, QES,
> Postgres) trăiesc în [TODO.md](TODO.md) și [UX-REVIEW.md](UX-REVIEW.md).
