# Graph Report - clavium  (2026-07-16)

## Corpus Check
- 323 files · ~158,348 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1430 nodes · 3524 edges · 144 communities (82 shown, 62 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.59)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c6baa5d9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Property & Offer Actions
- Contract & Payment Flow
- Property Search & Listing UI
- Cron Jobs & Email
- Commission & Sale Terms
- Auth Core & Registration
- Contract Document & Receipts
- KYC Verification
- QES & Env Validation
- i18n & Root Layout
- Dashboard Data Views
- Auth API Routes
- Validation Schemas
- Homepage Slide Deck
- NPM Dependencies
- Admin Dashboard Pages
- Legacy Landing Sections
- TypeScript Config
- Support Tickets
- NPM Scripts
- Auth Pages & Forms
- RBAC Roles & Permissions
- Dev Dependencies
- Listing Reports & Moderation
- Saved Searches & APIs
- Session & Site Meta
- Admin Support Actions
- Admin Users & KYC Pages
- Misc Dashboard Actions
- Reviews & UI Buttons
- Dashboard Navigation
- Project Docs & CI
- constants.ts
- Dashboard Action Helpers
- TOTP Algorithm
- Profile Management
- Login & 2FA Flow
- Theme & Auth Layout
- Legal & Static Pages
- page.tsx
- StatusBadge.tsx
- contracts.ts
- Inquiry Actions
- 2FA Setup
- Profile Page & Referrals
- Package Metadata
- QES Compliance Docs
- Session Revocation
- Button.tsx
- tickets.ts
- Referral System
- Test Harness
- Database Seed
- Offers Page
- Cookie Banner
- JWT Auth Docs
- Next.js Config
- Vercel Config
- Homepage Redesign Docs
- Toast UX Docs
- Ticker Bar
- Currency Rate Docs
- Dark Mode Docs
- Storage Docs
- Stripe Docs
- ESLint Config
- Next Env Types
- Admin Roadmap Items
- Deposit Roadmap Items
- PDF Fonts
- 2FA Changelog
- Graphify Workflow
- E2E Money Path
- Dunning Roadmap
- i18n Roadmap
- eFactura Flag
- Client Role
- Owner Role
- page 2.tsx
- Ancore de încredere QES (certificate root ale furnizorilor calificați)
- FormField.tsx
- 0.5.1 — 2026-06-14
- 0.6.0 — 2026-06-14
- 0.7.0 — 2026-06-14
- 1.1.0 — 2026-07-01
- CLAUDE.md
- QES Contract Signing
- Clavium Release History
- Server Actions Migration (v0.6.0)
- Server-Resolved Navbar Auth State
- SlideShell Background Slot (full-bleed fix)
- QES Trust Anchors Directory
- Romanian Qualified Trust Service Providers
- Clavium Real-Estate Platform
- JWT HTTP-only Cookie Auth
- Four-Step Registration Wizard
- Rental Lifecycle Flow
- Route Protection via proxy.ts
- AES 'Bank-Model' Signing Ceremony
- Rental Deposit (Garantie) Lifecycle
- Listing Fraud Detection (Perceptual Hashing)
- Hash-Chained Immutable Audit Log
- Design Re-Shaped: 4-Slide Homepage Plan
- Road to Paid Public Launch (tracker)
- Multi-Currency Display (RON/EUR)
- Persistent Object Storage (S3/R2) Seam
- QES Provider Decision
- Landlord Payouts (Stripe Connect / escrow)
- Noto Sans (OFL 1.1) Vendored Fonts
- ADMIN Role
- RBAC System
- Styled Confirm Dialog Recommendation
- Design Token System (radius/type/spacing)
- Optimistic UI (useOptimistic) Recommendation
- Single Mutable Status-String Anti-Pattern
- Toast System (sonner) Recommendation
- UX Review & Ideas
- hash.ts
- SaleTermsForm.tsx
- FormField.tsx
- page.tsx
- SaleTermsForm.tsx
- ThemeToggle.tsx
- requireActionUser
- sessions.ts
- env.ts
- 1.4.0 — 2026-07-10
- page.tsx
- terms.ts
- inquiries.ts
- audit.ts
- page.tsx
- page.tsx
- autopay.ts
- proxy.ts
- contractDates.ts

## God Nodes (most connected - your core abstractions)
1. `errorMessage()` - 96 edges
2. `requireActionUser()` - 66 edges
3. `Changelog` - 50 edges
4. `getCurrentUser` - 48 edges
5. `notify()` - 45 edges
6. `formatRon()` - 35 edges
7. `makeUser()` - 34 edges
8. `Button` - 29 edges
9. `resetDb()` - 29 edges
10. `sha256()` - 25 edges

## Surprising Connections (you probably didn't know these)
- `CI Postgres 16 Service` --semantically_similar_to--> `Local Dev Postgres (docker compose)`  [INFERRED] [semantically similar]
  .github/workflows/ci.yml → docker-compose.yml
- `Isolated Test Database Harness` --semantically_similar_to--> `Isolated Test Schema (clavium_test)`  [INFERRED] [semantically similar]
  CHANGELOG.md → .github/workflows/ci.yml
- `resetAndSeedMoneyPath()` --calls--> `resetDb()`  [EXTRACTED]
  e2e/support/moneyPath.ts → src/test/helpers.ts
- `cleanMoneyPath()` --calls--> `resetDb()`  [EXTRACTED]
  e2e/support/moneyPath.ts → src/test/helpers.ts
- `session()` --calls--> `sessionFor()`  [EXTRACTED]
  src/app/actions/__tests__/kyc.test.ts → src/test/helpers.ts

## Import Cycles
- None detected.

## Communities (144 total, 62 thin omitted)

### Community 0 - "Property & Offer Actions"
Cohesion: 0.07
Nodes (55): createOfferAction(), OPEN_CONTRACT_STATUSES, respondToOfferAction(), createPropertyAction(), deletePhotoAction(), revalidateProperties(), toggleSaveAction(), updatePropertyAction() (+47 more)

### Community 1 - "Contract & Payment Flow"
Cohesion: 0.20
Nodes (12): Footer(), FeaturedSlider(), SlideDevelopers(), SlideHowItWorks(), STEP_ICONS, SlideOwners(), SlideRenters(), TX_TO_FILTER (+4 more)

### Community 2 - "Property Search & Listing UI"
Cohesion: 0.10
Nodes (35): deleteSavedSearchAction(), saveSearchAction(), DashboardSearchPage(), metadata, PropertiesPage(), SavedSearches(), SavedSearchView, PropertyCard() (+27 more)

### Community 3 - "Cron Jobs & Email"
Cohesion: 0.22
Nodes (12): AdminPage(), AdminPage(), AdminReportsPage(), REASON_LABELS, dateFmt, KycVerificationPage(), AdminUserRow, DashboardHeader() (+4 more)

### Community 4 - "Commission & Sale Terms"
Cohesion: 0.07
Nodes (37): importListingAction(), generateMetadata(), PropertyDetailPage(), CopyLinkButton(), CopyLinkButtonProps, rentCommission(), APP_URL, buildCommissionInvoiceXml() (+29 more)

### Community 5 - "Auth Core & Registration"
Cohesion: 0.20
Nodes (18): POST(), POST(), POST(), POST(), createToken(), isNewDevice(), loginUser(), sendPhoneOtpCode() (+10 more)

### Community 6 - "Contract Document & Receipts"
Cohesion: 0.07
Nodes (34): GET(), buildParty(), ContractDetail, ContractDocument, formatDate(), getContractDetail(), Party, PartyUser (+26 more)

### Community 7 - "KYC Verification"
Cohesion: 0.09
Nodes (32): FaceMatch, KIND_LABELS, KycEvidence, recordKycVerification(), submitKycAction(), DbUser, session(), canvasToJpeg() (+24 more)

### Community 8 - "QES & Env Validation"
Cohesion: 0.19
Nodes (17): processAutopay(), addMonths(), formatRon(), paymentReference(), Variant, CheckoutResult, loadPayment(), SettleablePayment (+9 more)

### Community 9 - "i18n & Root Layout"
Cohesion: 0.19
Nodes (15): setLocaleAction(), LanguageSwitcher(), I18nContext, I18nValue, useI18n(), isLocale(), Locale, LOCALE_LABELS (+7 more)

### Community 10 - "Dashboard Data Views"
Cohesion: 0.10
Nodes (26): DashboardPage(), DashboardPaymentsPage(), BadgeVariant, CONTRACT_STATUS, ContractPayment, contractPaymentProgress(), ContractView, formatDate() (+18 more)

### Community 11 - "Auth API Routes"
Cohesion: 0.12
Nodes (34): GET(), POST(), confirmEmailToken(), encoder, jwtKey, registerUser(), sendVerificationEmail(), verifyOtpCode() (+26 more)

### Community 12 - "Validation Schemas"
Cohesion: 0.10
Nodes (23): POST(), resetConfirmSchema, resetPassword(), isValidCui(), isValidRegNumber(), ROLES, adminUserUpdateSchema, changePasswordSchema (+15 more)

### Community 13 - "Homepage Slide Deck"
Cohesion: 0.08
Nodes (37): GET(), monitorConfig, GET(), monitorConfig, GET(), POST(), authorizeCron(), cronUnauthorized() (+29 more)

### Community 14 - "NPM Dependencies"
Cohesion: 0.09
Nodes (23): dependencies, asn1js, @aws-sdk/client-s3, bcryptjs, clsx, jose, lucide-react, next (+15 more)

### Community 15 - "Admin Dashboard Pages"
Cohesion: 0.23
Nodes (8): DashboardTicketsPage(), EmptyState(), EmptyStateProps, PRIORITY_RANK, SORTS, STATUS_FILTERS, getTicketableContracts(), TicketView

### Community 16 - "Legacy Landing Sections"
Cohesion: 0.12
Nodes (16): Accesul în Imobil, Chiria și modalitatea de plată, Durata contractului, Garanția (depozitul), Legea aplicabilă și litigiile, Notificări, Obiectul contractului, Obligațiile chiriașului (+8 more)

### Community 17 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 18 - "Support Tickets"
Cohesion: 0.48
Nodes (5): DashboardProfilePage(), relativeTime(), ReferralCard(), getNotifications(), getCurrentSessionId()

### Community 19 - "NPM Scripts"
Cohesion: 0.10
Nodes (20): scripts, build, db:generate, db:push, db:seed, dev, dev:https, lighthouse:ci (+12 more)

### Community 20 - "Auth Pages & Forms"
Cohesion: 0.16
Nodes (13): CtaSection(), HeroSection(), TX_TO_FILTER, TxType, HowItWorksSection(), STEPS, FEATURES, SignatureSection() (+5 more)

### Community 22 - "Dev Dependencies"
Cohesion: 0.11
Nodes (19): devDependencies, autoprefixer, @axe-core/playwright, eslint, eslint-config-next, @eslint/eslintrc, @lhci/cli, @playwright/test (+11 more)

### Community 23 - "Listing Reports & Moderation"
Cohesion: 0.21
Nodes (12): reportAction(), resolveReportAction(), ReportResolveControls(), REASONS, ReportButton(), REPORT_REASONS, REPORT_STATUSES, REPORT_TARGETS (+4 more)

### Community 24 - "Saved Searches & APIs"
Cohesion: 0.18
Nodes (11): 10. Content & microcopy, 2. Forms (where users spend the most effort), 3. Loading & perceived performance, 4. Flow & guidance (the "natural" part), 5. Search & listings, 6. Property photos, 7. Micro-interactions & motion, 8. Accessibility (also makes it feel "finished") (+3 more)

### Community 25 - "Session & Site Meta"
Cohesion: 0.19
Nodes (13): generateMetadata(), inter, RootLayout(), CookieBanner(), hasConsent(), listeners, subscribe(), DevNoticeBanner() (+5 more)

### Community 26 - "Admin Support Actions"
Cohesion: 0.05
Nodes (40): 0.8.0 — 2026-06-15, 0.8.1 — 2026-06-15, 0.8.2 — 2026-06-16, 0.8.3 — 2026-06-16, 0.8.4 — 2026-06-17, 0.9.0 — 2026-06-19, 0.9.10 — 2026-06-27, 0.9.1 — 2026-06-19 (+32 more)

### Community 27 - "Admin Users & KYC Pages"
Cohesion: 0.17
Nodes (11): updateUserAction(), DashboardContractsPage(), PropertyDetailPage(), AdminUsersTable(), ROLES, MESSAGES, PaymentToast(), badgeStyles (+3 more)

### Community 28 - "Misc Dashboard Actions"
Cohesion: 0.13
Nodes (15): Backlog — room for more, Design Re-Shaped, Domain gaps — real-use logic (currently happy-path only), Done (v0.9.10 — branch `refactor/stability-perf-pass`), Growth & reach, Housekeeping, Phase 1 — Make a real deploy work (BLOCKERS), Phase 2 — Launch confidence & ops (+7 more)

### Community 29 - "Reviews & UI Buttons"
Cohesion: 0.22
Nodes (10): Error(), GlobalError(), register(), reportException(), SENTRY_ENABLED, firstDefined(), sentryDataCollection(), sentryTraceSampleRate() (+2 more)

### Community 30 - "Dashboard Navigation"
Cohesion: 0.05
Nodes (44): markNotificationsReadAction(), acceptTermsAction(), highlights, DashboardLayout(), metadata, ActionResult, DueType, MarkNotificationsRead() (+36 more)

### Community 31 - "Project Docs & CI"
Cohesion: 0.40
Nodes (5): Isolated Test Database Harness, Local Dev Postgres (docker compose), CI Pipeline (lint, typecheck, test, build), CI Postgres 16 Service, Isolated Test Schema (clavium_test)

### Community 32 - "constants.ts"
Cohesion: 0.27
Nodes (6): POST(), GET(), getUserFromToken(), revokeSessionFromToken(), verifyToken(), insecureDevelopmentSecrets

### Community 33 - "Dashboard Action Helpers"
Cohesion: 0.17
Nodes (11): Arvuna — efecte (art. 1544 Cod civil), Declarațiile vânzătorului, Legea aplicabilă și litigiile, Notificări, Obiectul antecontractului, Predarea imobilului, Prețul și avansul (arvuna), Protecția datelor cu caracter personal (+3 more)

### Community 34 - "TOTP Algorithm"
Cohesion: 0.17
Nodes (14): setContractTermsAction(), createReviewAction(), AUDIT_LABEL, ContractDetailPage(), ContractTermsForm(), Terms, PrintButton(), ReviewForm() (+6 more)

### Community 35 - "Profile Management"
Cohesion: 0.47
Nodes (7): changePasswordAction(), deactivateAccountAction(), updateProfileAction(), ProfileForms(), ProfileFormsProps, changePassword(), revokeAllSessions()

### Community 36 - "Login & 2FA Flow"
Cohesion: 0.22
Nodes (9): API endpoints, Project structure, Roadmap / not yet implemented, Scripts, Security notes, Tech stack, User roles, Vatrio.ro — Imobiliare fără intermediari (+1 more)

### Community 37 - "Theme & Auth Layout"
Cohesion: 0.29
Nodes (7): 0.4.0 — 2026-06-13, Calitate, SEO, legal, Fotografii, căutare pentru clienți și UX (follow-up 0.4), Infrastructură, Marketplace funcțional (milestone 0.4), Plăți și chirii recurente (milestone 0.5), Securitate

### Community 38 - "Legal & Static Pages"
Cohesion: 0.15
Nodes (15): metadata, PrivacyPage(), sections, DashboardServicesPage(), NotFound(), HomePage(), metadata, PublicServicesPage() (+7 more)

### Community 39 - "page.tsx"
Cohesion: 0.20
Nodes (20): RFC-4226, RFC-4648, RFC-6238, begin2faSetupAction(), confirm2faAction(), disable2faAction(), groupSecret(), TwoFactorSettings() (+12 more)

### Community 40 - "StatusBadge.tsx"
Cohesion: 0.40
Nodes (4): DashboardPropertiesPage(), getProperties(), priceLabel(), PropertyView

### Community 41 - "contracts.ts"
Cohesion: 0.20
Nodes (15): cancelSaleAction(), payRentAction(), paySaleAction(), renewContractAction(), returnDepositAction(), SignatureInput, terminateContractAction(), ContractActions() (+7 more)

### Community 42 - "Inquiry Actions"
Cohesion: 0.33
Nodes (6): 0.5.0 — 2026-06-13, Feedback și interacțiuni (UX batch 1–3), Limbajul vizual al homepage-ului în dashboard, Navigație și acces, Notificări, Performanță

### Community 43 - "2FA Setup"
Cohesion: 0.33
Nodes (6): 1.0.0 — 2026-06-30, Domeniu, Growth, Ops & integrări (env-gated), Securitate & confidențialitate, Trust & safety

### Community 44 - "Profile Page & Referrals"
Cohesion: 0.19
Nodes (12): revokeOtherSessionsAction(), revokeSessionAction(), SessionManager(), SessionView, DeviceMeta, getTransporter(), sendEmail(), deviceLabel() (+4 more)

### Community 45 - "Package Metadata"
Cohesion: 0.17
Nodes (11): engines, node, name, overrides, chrome-launcher, tmp, uuid, prisma (+3 more)

### Community 47 - "Session Revocation"
Cohesion: 0.20
Nodes (14): POST(), POST(), POST(), GET(), GET(), GET(), requireUser(), errorMessage() (+6 more)

### Community 48 - "Button.tsx"
Cohesion: 0.15
Nodes (10): adminVerifyAuditChainAction(), AuditVerifyCard(), Result, Button, ButtonProps, Variant, variantClass, ConfirmDialog() (+2 more)

### Community 49 - "tickets.ts"
Cohesion: 0.40
Nodes (5): createTicketAction(), CATEGORIES, NewTicketForm(), PRIORITIES, TicketableContract

### Community 50 - "Referral System"
Cohesion: 0.40
Nodes (5): 0.3.0 — 2026-06-12, Autentificare și securitate, Dashboard pe date reale, Platformă, Înregistrare

### Community 52 - "Database Seed"
Cohesion: 0.40
Nodes (5): { hash }, main(), prisma, { PrismaClient }, upsertUser()

### Community 53 - "Offers Page"
Cohesion: 0.40
Nodes (5): 0.6.1 — 2026-06-14, Editarea proprietăților, Mod întunecat (dark mode), Note, Suită de teste

### Community 54 - "Cookie Banner"
Cohesion: 0.40
Nodes (5): 1. Landing page (`/`), 2. Registration (`/auth/register`), 3. Login (`/auth/login`), 4. Dashboard (`/dashboard`), How it's intended to be used

### Community 56 - "Next.js Config"
Cohesion: 0.40
Nodes (3): nextConfig, securityHeaders, { withSentryConfig }

### Community 57 - "Vercel Config"
Cohesion: 0.40
Nodes (4): buildCommand, crons, regions, $schema

### Community 74 - "E2E Money Path"
Cohesion: 0.23
Nodes (14): login(), openRolePages(), signVisibleContract(), assertDisposableDatabase(), cleanMoneyPath(), E2E_ACCOUNTS, moneyPathEnabled(), pemToDer() (+6 more)

### Community 84 - "page 2.tsx"
Cohesion: 0.33
Nodes (7): InquiryThreadPage(), DashboardMessagesPage(), fullName(), getInquiriesFor(), getInquiryThread(), InquiryListItem, InquiryThread

### Community 85 - "Ancore de încredere QES (certificate root ale furnizorilor calificați)"
Cohesion: 0.50
Nodes (3): Ancore de încredere QES (certificate root ale furnizorilor calificați), Cum se populează, Important

### Community 86 - "FormField.tsx"
Cohesion: 0.19
Nodes (12): LoginPage(), LoginTab, readTab(), subscribeTab(), RegisterPage(), roleOptions, steps, FormField (+4 more)

### Community 87 - "0.5.1 — 2026-06-14"
Cohesion: 0.67
Nodes (3): 0.5.1 — 2026-06-14, Experiența cu fotografii, Flux ghidat (next-steps)

### Community 124 - "hash.ts"
Cohesion: 0.40
Nodes (5): Demo accounts (after `npm run db:seed`), Environment (`.env`), Getting started, Prerequisites, Setup

### Community 125 - "SaleTermsForm.tsx"
Cohesion: 0.40
Nodes (5): 1.1 Feedback is a single mutable string — the biggest offender, 1.2 Every action triggers a full server refetch — no optimism, 1.3 Inconsistent micro-decisions (the "unedged" feel), 1.4 Native browser dialogs, 1. The root causes (why it feels rough)

### Community 126 - "FormField.tsx"
Cohesion: 0.35
Nodes (11): signContractAction(), recordAuditSafe(), authorizedOnContract(), cancelSaleContract(), CloseResult, renewRentalContract(), returnRentalDeposit(), terminateRentalContract() (+3 more)

### Community 127 - "page.tsx"
Cohesion: 0.32
Nodes (9): adminModeratePropertyAction(), adminRefundPaymentAction(), adminSetKycStatusAction(), KYC_STATUSES, KycStatus, AdminUserSupportPage(), KycOverrideControls(), PropertyModerateControl() (+1 more)

### Community 128 - "SaleTermsForm.tsx"
Cohesion: 0.38
Nodes (7): setSaleTermsAction(), ronFmt, SaleTerms, SaleTermsForm(), SALE_BRACKETS, saleCommission(), saleCommissionRate()

### Community 129 - "ThemeToggle.tsx"
Cohesion: 0.50
Nodes (4): Larger investments (worth it for production), Medium (1–3 days each), Prioritized roadmap, Quick wins (hours each, do first)

### Community 130 - "requireActionUser"
Cohesion: 0.42
Nodes (8): AUTHOR_STATUSES, markTicketReadAction(), replyToTicketAction(), setTicketStatusAction(), STATUS_LABEL, MANAGER_STATUSES, TicketCard(), requireActionUser()

### Community 131 - "sessions.ts"
Cohesion: 0.40
Nodes (4): Alerte recomandate în Sentry, Sentry — configurare și operare, Variabile de mediu, Verificarea primului deploy

### Community 132 - "env.ts"
Cohesion: 0.09
Nodes (27): isPlaceholder(), validateEnv(), contractDigest(), contractDocumentHash(), SignableContract, certName(), checkRevocation(), engine (+19 more)

### Community 135 - "page.tsx"
Cohesion: 0.50
Nodes (3): Automated controls, Reporting a vulnerability, Security policy

### Community 137 - "inquiries.ts"
Cohesion: 0.39
Nodes (6): closeInquiryAction(), replyInquiryAction(), sendInquiryAction(), InquiryThreadView(), timeFmt, AskOwnerForm()

### Community 138 - "audit.ts"
Cohesion: 0.28
Nodes (8): AuditAction, AuditEntity, AuditInput, AuditTrailItem, canonical(), GENESIS, recordAudit(), verifyAuditChain()

### Community 139 - "page.tsx"
Cohesion: 0.33
Nodes (5): TERMS_SECTIONS, TermsBlock, TermsSection, metadata, TermsPage()

### Community 140 - "page.tsx"
Cohesion: 0.40
Nodes (4): DashboardOffersPage(), getOffers(), offerStatus(), OfferView

### Community 142 - "proxy.ts"
Cohesion: 0.67
Nodes (3): buildCsp(), config, proxy()

## Knowledge Gaps
- **492 isolated node(s):** `publicRoutes`, `QES_FIXTURES`, `qesKeyPem`, `eslintConfig`, `{ withSentryConfig }` (+487 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **62 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Dev Dependencies` to `Package Metadata`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Why does `prisma` connect `Dev Dependencies` to `Property & Offer Actions`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Why does `errorMessage()` connect `Session Revocation` to `SaleTermsForm.tsx`, `Property & Offer Actions`, `Property Search & Listing UI`, `requireActionUser`, `Commission & Sale Terms`, `Auth Core & Registration`, `Contract Document & Receipts`, `KYC Verification`, `inquiries.ts`, `Auth API Routes`, `Validation Schemas`, `autopay.ts`, `Homepage Slide Deck`, `Listing Reports & Moderation`, `Admin Users & KYC Pages`, `Dashboard Navigation`, `TOTP Algorithm`, `Profile Management`, `page.tsx`, `contracts.ts`, `Profile Page & Referrals`, `Button.tsx`, `tickets.ts`, `FormField.tsx`, `page.tsx`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **What connects `publicRoutes`, `QES_FIXTURES`, `qesKeyPem` to the rest of the system?**
  _498 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Property & Offer Actions` be split into smaller, more focused modules?**
  _Cohesion score 0.07066167290886392 - nodes in this community are weakly interconnected._
- **Should `Property Search & Listing UI` be split into smaller, more focused modules?**
  _Cohesion score 0.10040816326530612 - nodes in this community are weakly interconnected._
- **Should `Commission & Sale Terms` be split into smaller, more focused modules?**
  _Cohesion score 0.06623376623376623 - nodes in this community are weakly interconnected._