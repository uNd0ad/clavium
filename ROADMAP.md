# Clavium — Road to Paid Public Launch

Working tracker. Target: **real paid public launch**. Phases 1–2 are mandatory for a
real deploy; Phase 3 is compliance; Phase 4 is post-launch differentiation. Add new
items freely under the relevant phase or in the Backlog.

Status legend: `[ ]` todo · `[~]` in progress · `[x]` done.

---

## Done (v0.9.10 — branch `refactor/stability-perf-pass`)

- [x] Stability/perf pass: atomic contract signing, hardened Stripe webhook, external-call
  timeouts, Stripe startup warning, `addMonths` no overflow, rate-limit bucket sweep.
- [x] DB indexes migration (`add_indexes`); aggregated payment summaries; `select` over
  `include`; parallelized photo/save queries; lightbox `sizes` fix.
- [x] Hygiene: removed dead hero property-type selector; gated dev `console.log`s.
- [x] Regenerated QES test fixtures (CA `basicConstraints CA:TRUE`) — suite 64/64 green.

---

## Housekeeping

- [ ] Merge/land the v0.9.10 stability+perf branch into `main` when ready.

## Phase 1 — Make a real deploy work (BLOCKERS)

- [x] **Persistent object storage (S3/R2)** behind `src/lib/storage.ts` seams — public
  photos + private KYC docs. New `src/lib/storageBackend.ts` (local FS default, S3/R2 when
  `STORAGE_DRIVER=s3`, SDK lazy-loaded); `storage.ts` signatures + sharp pipeline unchanged.
  `env.ts` warns when storage isn't persistent / S3 config incomplete; `.env.example` documented.
- [x] Add bucket host to `images.remotePatterns` in `next.config.js` (derived from
  `STORAGE_S3_PUBLIC_BASE_URL`). _Still TODO: presigned short-TTL reads for KYC docs —
  KYC `ref` is currently write-only (only the content hash is consumed), so no read route yet._
- [x] **Contract PDF** generation (`pdf-lib`) from existing `ContractDocument` —
  `src/lib/contractPdf.ts` (on-demand, deterministic; unsigned preview + signed final).
  Embeds Noto Sans (OFL, `src/assets/fonts/`) for Romanian diacritics; QES audit block
  (signer, provider, timestamp, ref + SHA-256 doc hash). Download route
  `GET /api/contracte/[id]/pdf` (Node runtime, authorized via `getContractDetail`) + page
  button. `outputFileTracingIncludes` ships the fonts in the serverless bundle. Tests added.
- [ ] _(optional follow-up)_ Persist the **final signed** PDF to storage + add
  `Contract.documentUrl` (immutable archived copy). Currently regenerated on demand —
  deterministic, so functionally equivalent, but not a frozen artifact.
- [ ] **Stripe live** — live keys + production webhook endpoint + verified end-to-end
  test charge (code already idempotent/hardened).
- [ ] **Landlord payouts (Stripe Connect / escrow)** — platform collects rent + 5% but
  must route funds **to the owner**. Decide Connect (express connected accounts) vs.
  payment-facilitator; handling third-party funds may trigger payment-institution rules.
  Structural + regulatory — treat as launch-critical, not a feature.

## Phase 2 — Launch confidence & ops

- [ ] Wire **Sentry** via existing `logger.captureException` seam; alert on
  auth/payment/webhook errors.
- [ ] **Playwright E2E** on the critical path (register → verify → offer → sign → pay)
  + webhook smoke.
- [ ] Secrets/deploy hygiene — rotate the exposed SMSO key, move secrets to Vercel env,
  confirm `CSP_DISABLED` unset in prod, set up SPF/DKIM, deploy from `main`.
- [x] **Background jobs / scheduler (Vercel Cron)** — `src/lib/cron.ts` (Bearer-secret auth),
  `src/lib/jobs.ts` (testable job fns), routes `/api/cron/{cleanup,dunning}`, schedules in
  `vercel.json`, `CRON_SECRET` documented + env warning. Cleanup purges expired/used
  OTP·email-token·session rows. _(KYC retention purge rides on this once SEC item lands.)_

## Phase 3 — Compliance for binding contracts

- [ ] **Signing for users without a qualified cert ("bank model")** — build a self-hosted
  **AES** (Advanced Electronic Signature) ceremony reusing existing **KYC** (`src/lib/kyc.ts`)
  + **OTP** (sole-control factor) + `contractDocumentHash` (tamper-evidence) + `Signature`
  audit trail; platform creates the signature server-side, embedded in the PDF (PAdES).
  Removes the ~€80/yr personal-cert barrier. Legally sufficient for rentals + antecontracts.
  Hybrid: AES default, keep uploaded-cert QES for power users, add on-demand QES (per-signature
  via QTSP) later as a premium tier. **Needs legal posture confirmed first.**
- [ ] QES provider decision — keep uploaded-cert verification (`src/lib/qesVerify.ts`)
  vs. integrate a QTSP (certSIGN/Namirial/DocuSign EU Qualified) for on-demand QES.
- [ ] Legal sign-off on T&C + rental/sale contract templates (Legea 214/2024 / Civil Code).

## Phase 4 — Post-launch differentiators

- [x] Degressive sale commission — pure `saleCommission(price)` in `src/lib/commission.ts`
  (marginal brackets 3%→1%, min 1.500 RON, no cliffs). Wired into `paymentSettle.ts`
  (sale + rent); live estimate shown in `SaleTermsForm`. Unit + lifecycle tests updated.
- [ ] Google Maps pins for exclusive listings — `lat`/`lng` on `Property` + exclusivity gating.
- [ ] Listing import from OLX/Storia/Imobiliare — `src/lib/import/`, parser per source,
  pre-fill `PropertyForm`.
- [ ] e-Factura commission invoicing + company KYC (legal-rep authority).

## Domain gaps — real-use logic (currently happy-path only)

Money flowing backward (all in `src/lib/contractClose.ts`, tested, with `Contract.depositStatus`
/`cancelledAt`/`cancelReason` + payment-type `DAUNE`; UI in `ContractCloseActions.tsx`):
- [x] **Deposit / garanție lifecycle** — `returnRentalDeposit`: held → returned/partial/forfeited
  at contract end, with damage deductions; records `REFUND` (to tenant) + `DAUNE` (to owner);
  owner UI form. Idempotent via `depositStatus`.
- [x] **Arvună (AVANS) forfeit rules** — `cancelSaleContract`: buyer backs out → forfeits arvună;
  seller backs out → owes double (Civil Code art. 1544); admin/no-arvună → simple cancel.
- [x] **Refunds / cancellations** — `REFUND` payment rows wired into both flows; cancel voids
  unpaid tranches + releases the listing. _Actual Stripe refund call is a scaffold pending
  escrow/payouts (today funds aren't held by the platform), hooking the same points._

Contract lifecycle beyond signing:
- [x] **Early termination / renewal / amendment** — `terminateRentalContract` (void future
  rent, end early, release listing, deposit stays HELD for return) + `renewRentalContract`
  (clone with updated terms → new `IN_ASTEPTARE` contract requiring fresh signatures;
  renew-with-new-terms = amendment, so every change is re-signed). Actions + UI + tests.

Operations:
- [x] **Late / missed payment handling (dunning)** — `processDunning` (in `jobs.ts`, daily
  cron) sends upcoming-due reminders + escalating overdue notices (tenant in-app+email,
  owner in-app), idempotent via `Payment.lastReminderAt`; overdue rent shows as "Restant"
  in the dashboard. _Penalty/late-fee auto-charge deferred — needs a contractual clause basis._
- [x] **Pre-contract messaging** — `Inquiry`/`InquiryMessage` models (one thread per
  listing+user), `inquiries.ts` actions (send/reply/close, owner-notified), "Întreabă
  proprietarul" on the listing page + `/dashboard/mesaje` list & thread view + nav item. Tested.
- [x] **Immutable legal audit log** — `AuditLog` (hash-chained, advisory-lock-serialized
  `seq`/`prevHash`) + `src/lib/audit.ts` (`recordAuditSafe`, `verifyAuditChain`, `getAuditTrail`).
  Wired into signing, activation, settlement, terms changes, termination/renewal/cancel/deposit.
  Trail shown on the contract page; tamper detection tested.
- [x] **Admin support tooling** — `admin.ts` actions: manual KYC override, listing
  moderation (hide/restore), payment refund (idempotent), audit-chain verification — all
  audited. Admin dashboard gets an audit-verify card + per-user support page
  (`/dashboard/admin/utilizatori/[id]`: KYC, listings, payments). Tested.
  _Note: "impersonation" implemented as a read-only support view rather than act-as
  (acting as a user is a security footgun); revisit if a true act-as is ever needed._
- [x] **T&C versioning + re-consent** — `TermsConsent` model + `src/lib/terms.ts`
  (`TERMS_VERSION`, `hasAcceptedCurrentTerms`, `recordTermsConsent`). Consent recorded at
  registration; dashboard shows a blocking re-consent banner when `TERMS_VERSION` bumps. Tested.

## Trust & safety (two-sided marketplace)

- [x] **Reviews / reputation** for landlords and tenants — `Review` model (one per
  contract+author, after `INCHEIAT`/`ANULAT`), `reviews.ts` (`getUserReputation`,
  `canReview`, `getContractReviews`) + action. Star UI on the contract page; owner rating
  on the listing page. Tested.
- [ ] **Listing-fraud detection** — duplicate/fake listings, reverse/perceptual image
  hashing for stolen photos, duplicate-account detection.
- [ ] **Report / flag** a listing or user (abuse reporting + admin queue).

## Security & privacy

- [ ] **KYC retention + biometric consent** — face data is GDPR special-category: explicit
  consent at capture + auto-purge policy (ties to the scheduler).
- [ ] **Account 2FA (TOTP)** — authenticator-app second factor for accounts.
- [ ] **Session / device management** — UI to view & revoke active sessions; new-device
  login alerts.

## Growth & reach

- [ ] **English / i18n** — UI is Romanian-only; add EN for investors/expats.
- [ ] **Public listing ISR + structured data** — static/ISR rendering + schema.org
  `RealEstateListing` + per-listing OG images (SEO + speed for organic discovery).
- [ ] **Auto-pay / saved card** for recurring rent (reliability + UX vs. paying manually monthly).
- [ ] **Saved searches + email alerts** on new matching listings; **referral program**.
- [ ] **PDF receipts / invoices** per payment (rides on the contract-PDF work).
- [ ] **Multi-currency (RON/EUR)** — sales are priced in EUR.

## Polish (expand — not at this stage yet)

- [ ] UI/UX consistency pass — empty states, loading, error toasts, mobile (gather specifics).
- [ ] Accessibility audit (axe/Lighthouse) + performance audit (Lighthouse, `next/image`).

## Backlog — room for more

- [ ] _(add ideas / rough edges here as they come up)_
