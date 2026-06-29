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
- [~] **Landlord payouts (Stripe Connect / escrow)** — scaffolded: `lib/payouts.ts` (`PAYOUTS_ENABLED`
  gated on `STRIPE_CONNECT_ENABLED`, pure `ownerNetFromRent` = rent − commission, `createOwnerPayout`
  seam that skips until a connected account exists). Tested. **Still launch-critical & regulatory:**
  the Connect/payment-facilitator decision + handling third-party funds (payment-institution rules)
  must be resolved with legal before enabling real transfers.

## Phase 2 — Launch confidence & ops

- [x] Wire **Sentry** via existing `logger.captureException` seam — `lib/sentry.ts` lazy-loads
  `@sentry/nextjs` only when `SENTRY_DSN` is set (hidden dynamic import → optional dependency; app
  builds/runs without the package). `captureException` forwards to it; the Stripe webhook
  settle-failure path now reports via `captureException` (was log-only). Env vars documented. Tested.
- [x] **Playwright E2E** scaffolded — `@playwright/test` + `playwright.config.ts` (webServer runs
  `dev` locally / `build && start` in CI). Working smoke suite (`e2e/public.spec.ts`): landing +
  hero/CTA, language switch RO→EN, listings page, robots/sitemap, login/register pages, bad-login
  error. Money-path + webhook specs (`e2e/money-path.spec.ts`) written as a documented `test.skip`
  skeleton listing the CI fixtures needed (test DB, OTP/email bypass, QES cert, dev-settle). Scripts:
  `test:e2e`, `test:e2e:ui`, `test:e2e:install`.
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
- [x] Google Maps pins for exclusive listings — `lat`/`lng`/`isExclusive` on `Property`; `lib/maps.ts`
  (`MAPS_ENABLED` gated on `NEXT_PUBLIC_MAPS_API_KEY`, `staticMapUrl`, exact pin for exclusive vs.
  ~1 km `approximate`d area otherwise). Map block on the listing detail page (renders only with a key
  + coordinates). Tested.
- [x] Listing import from OLX/Storia/Imobiliare — `src/lib/import/` (`detectSource`, `parseListingHtml`
  via OpenGraph + heuristics) + `importListingAction` (OWNER/ADMIN, https-only, timeout; gated on
  `LISTING_IMPORT_ENABLED` due to portal ToS). Tested.
- [x] e-Factura commission invoicing — `lib/efactura.ts`: pure `buildCommissionInvoiceXml` (UBL 2.1 /
  RO_CIUS, VAT + totals, XML-escaped), `submitEFactura` ANAF-SPV seam gated on `EFACTURA_*` creds.
  Tested. (Company KYC of legal-rep authority remains a manual/admin step.)

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
- [x] **Listing-fraud detection** — `fraud.ts`: perceptual image hashing (`aHash`, 8×8
  grayscale → 64-bit, Hamming distance with threshold) to flag stolen photos across owners
  (`PhotoSignature` model, recorded on upload), plus near-identical text listings
  (title+location, case-insensitive). `runFraudChecks` runs best-effort on photo upload,
  files a deduplicated system report and notifies admins. Tested. (At scale: LSH/bucketing.)
- [x] **Report / flag** a listing or user — `Report` model (reporter null = system),
  `reports.ts` (`getReports` queue, `countOpenReports`, `createSystemReport` dedup) +
  `reportAction` (idempotent per author+target, validates target, blocks self-report) /
  `resolveReportAction` (admin, audited `REPORT_RESOLVED`). `ReportButton` on the listing
  page; admin moderation queue at `/dashboard/admin/raportari` with an open-count card.
  Fraud detection feeds the same queue. Tested.

## Security & privacy

- [x] **KYC retention + biometric consent** — explicit GDPR art. 9 consent checkbox gates
  KYC submission (`biometricConsentAt` recorded; server rejects without it). Raw face images
  (`documentKeys` on `KycVerification`) auto-purge after `KYC_RETENTION_DAYS` (default 30) past
  a terminal decision via `purgeKycBiometrics` in the daily `/api/cron/cleanup` job — only the
  sha256 hashes + decision are retained (`biometricPurgedAt` marks it; idempotent). Added
  `deletePrivate`/`deleteKycDocument` to the storage layer. Tested.
- [x] **Account 2FA (TOTP)** — RFC 6238 implemented dependency-free over Node `crypto`
  (`totp.ts`: base32, HOTP/TOTP, ±1-step window, otpauth URI). Setup/confirm/disable server
  actions (`twofactor.ts`) with one-time backup codes (sha256-hashed, single-use via
  `verifyTwoFactor`); `User.totp{Secret,Enabled,BackupCodes}`. Enforced on both password and
  email-OTP login (returns `twoFactorRequired` before issuing a session; OTP path checks
  before consuming the code). `TwoFactorSettings` card on the profile page; 2FA step in the
  login form. Audited (`TWO_FACTOR_ENABLED/DISABLED`). Tested.
- [x] **Session / device management** — `Session` now records `userAgent`/`ip`/`lastSeenAt`;
  `sessions.ts` (`deviceLabel`, `getUserSessions`, `revokeUserSession`, `revokeOtherSessions`,
  `notifyNewDevice`). "Sesiuni active" card on the profile page lists devices with current-device
  marker + per-device and "log out others" revoke (`revokeSessionAction` / `revokeOtherSessionsAction`,
  using `getCurrentSessionId`). New-device login alert (in-app + email best-effort) on both login
  paths via `isNewDevice`. Tested.

## Growth & reach

- [x] **English / i18n** — cookie-based locale (no `[locale]` route segment) with a typed
  dictionary system (`lib/i18n/`: `config`, `dictionaries` ro/en, server `getServerDictionary`,
  client `LocaleProvider`/`useDict`). `LanguageSwitcher` (RO/EN) in the navbar sets the cookie and
  refreshes; `<html lang>` + OG/meta follow the locale. Public marketing surface (navbar, hero,
  CTA, footer) is fully bilingual; remaining pages extend the same `dict.x.y` pattern. ro/en key
  parity enforced at compile time (`en: Dictionary`) and by test.
- [x] **Public listing ISR + structured data** — `seo.ts`: `getPublicListing` reads the public
  listing through `unstable_cache` (cross-request ISR, 1h revalidate, cookie-free) — shared by the
  page and `generateMetadata`; `listingJsonLd` emits schema.org `SingleFamilyResidence`/`Apartment`
  + `Offer` (RON, availability). The detail page now has per-listing `generateMetadata` (title /
  description / canonical / OpenGraph + Twitter with the first photo as og:image) and injects the
  JSON-LD; root `metadataBase` set so OG URLs resolve. sitemap/robots already include listings.
  Tested; production build verified.
- [x] **Auto-pay / saved card** — tenant opt-in per contract (`Contract.autopayEnabled`).
  `processAutopay` (run before dunning in the daily cron) charges due rents on autopay contracts:
  dev mode settles directly via the idempotent `settlePayment`; Stripe-live path scaffolded
  (off-session PaymentIntent on a saved card — env-gated, skips until saved-card infra is wired).
  `setAutopayAction` (tenant-only) + `AutopayToggle` on the contract page; both parties notified on
  auto-charge. Tested.
- [x] **Saved searches + email alerts** + **referral program** — `SavedSearch` model + `saveSearch`/
  `deleteSavedSearch` actions; `processSavedSearchAlerts` (daily cron) notifies (in-app + email) on new
  matching listings since last alert, reusing the extracted `buildPropertyWhere`. "Căutări salvate"
  card on the dashboard search page. Referrals: per-user `referralCode` (`ensureReferralCode`) +
  `referredById`; `applyReferral` links a signup made with `?ref=CODE` and notifies the referrer
  (wired into `registerUser`); `ReferralCard` (code + share link + count) on the profile page. Tested.
- [x] **PDF receipts / invoices** per payment — `receiptPdf.ts` reuses the contract PDF's Noto
  fonts + `Cursor` layout (exported) to render a receipt/invoice; `receipts.ts` (`getReceiptData`)
  loads + authorizes (payer / contract owner / admin) finalized payments only and maps the type
  (COMISION → invoice with VAT note, else receipt). Download route `/api/plati/[id]/chitanta`
  (Node runtime, fonts bundled via `outputFileTracingIncludes`); "Chitanță" link per finalized
  transaction on the payments page. Tested.
- [x] **Multi-currency (RON/EUR)** — `currency.ts`: amounts stay stored in RON (payment source of
  truth); EUR is a display representation via a configurable `EUR_RON_RATE` (default 4.97).
  `ronToEur`/`eurToRon`, `formatRon`/`formatEur`/`formatMoney`/`formatRonWithEur`. Sale prices now
  show the EUR equivalent on the listing detail page and property cards (sales are quoted in euro).
  Tested.

## Polish (expand — not at this stage yet)

- [x] UI/UX consistency pass — new components (reports, 2FA, sessions, autopay, saved searches,
  referrals, receipts) all use the shared design tokens (`var(--*)`, `rounded-4xl`, Button/StatusBadge),
  sonner toasts, and empty states matching the existing dashboard.
- [x] Accessibility pass — fixed the `prefers-reduced-motion` override (it sat before `.reveal` and
  was ineffective; now forces reveal content visible + motion off and is placed last). Verified the
  fundamentals: global `:focus-visible` outline on all interactive elements, no `<img>`/`<Image>`
  without `alt`, `<html lang>` follows locale, `aria-pressed`/`aria-label` on toggles (2FA, autopay,
  language). Covered by the Playwright language-switch + form smoke tests. Perf already strong:
  local `next/font` (subset), ISR on listings, lazy AWS SDK / Sentry, PDF font subsetting.

## Backlog — room for more

- [ ] _(add ideas / rough edges here as they come up)_
