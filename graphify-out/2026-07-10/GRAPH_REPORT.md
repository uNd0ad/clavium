# Graph Report - clavium  (2026-07-10)

## Corpus Check
- 314 files · ~107,040 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1361 nodes · 3417 edges · 134 communities (74 shown, 60 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.59)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ae2ea068`
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
- Dashboard Layout & Alerts
- Dashboard Action Helpers
- TOTP Algorithm
- Profile Management
- Login & 2FA Flow
- Theme & Auth Layout
- Legal & Static Pages
- Ticket List UI
- Owner Services Catalog
- Inquiry Messaging
- Inquiry Actions
- 2FA Setup
- Profile Page & Referrals
- Package Metadata
- QES Compliance Docs
- Session Revocation
- Email Verify & Logging
- Contracts Page & Toasts
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
- Dunning Roadmap
- i18n Roadmap
- eFactura Flag
- Client Role
- Owner Role
- page 2.tsx
- Ancore de încredere QES (certificate root ale furnizorilor calificați)
- proxy.ts
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
- constants.ts
- inquiries.ts
- ThemeToggle.tsx
- env.ts
- route.ts
- kyc.ts
- 1.4.0 — 2026-07-10

## God Nodes (most connected - your core abstractions)
1. `errorMessage()` - 96 edges
2. `requireActionUser()` - 66 edges
3. `getCurrentUser` - 48 edges
4. `notify()` - 45 edges
5. `Changelog` - 39 edges
6. `formatRon()` - 35 edges
7. `makeUser()` - 34 edges
8. `Button` - 29 edges
9. `resetDb()` - 26 edges
10. `sha256()` - 25 edges

## Surprising Connections (you probably didn't know these)
- `CI Postgres 16 Service` --semantically_similar_to--> `Local Dev Postgres (docker compose)`  [INFERRED] [semantically similar]
  .github/workflows/ci.yml → docker-compose.yml
- `Isolated Test Database Harness` --semantically_similar_to--> `Isolated Test Schema (clavium_test)`  [INFERRED] [semantically similar]
  CHANGELOG.md → .github/workflows/ci.yml
- `DashboardServicesPage()` --calls--> `getCurrentUser`  [EXTRACTED]
  src/app/dashboard/servicii/page.tsx → src/lib/session.ts
- `PublicServicesPage()` --calls--> `getNavUser()`  [EXTRACTED]
  src/app/servicii/page.tsx → src/lib/session.ts
- `listing()` --calls--> `makeUser()`  [EXTRACTED]
  src/app/actions/__tests__/inquiries.test.ts → src/test/helpers.ts

## Import Cycles
- None detected.

## Communities (134 total, 60 thin omitted)

### Community 0 - "Property & Offer Actions"
Cohesion: 0.06
Nodes (61): createOfferAction(), OPEN_CONTRACT_STATUSES, respondToOfferAction(), createPropertyAction(), deletePhotoAction(), revalidateProperties(), toggleSaveAction(), updatePropertyAction() (+53 more)

### Community 1 - "Contract & Payment Flow"
Cohesion: 0.29
Nodes (9): cancelSaleAction(), renewContractAction(), returnDepositAction(), terminateContractAction(), CancelSaleButton(), DepositReturnForm(), RenewForm(), ronFmt (+1 more)

### Community 2 - "Property Search & Listing UI"
Cohesion: 0.10
Nodes (36): deleteSavedSearchAction(), saveSearchAction(), DashboardSearchPage(), HomePage(), metadata, PropertiesPage(), SavedSearches(), SavedSearchView (+28 more)

### Community 3 - "Cron Jobs & Email"
Cohesion: 0.07
Nodes (46): importListingAction(), GET(), GET(), GET(), GET(), GET(), GET(), GET() (+38 more)

### Community 4 - "Commission & Sale Terms"
Cohesion: 0.06
Nodes (40): setSaleTermsAction(), PropertyDetailPage(), generateMetadata(), PropertyDetailPage(), ronFmt, SaleTerms, SaleTermsForm(), CopyLinkButton() (+32 more)

### Community 5 - "Auth Core & Registration"
Cohesion: 0.28
Nodes (11): POST(), POST(), createToken(), DeviceMeta, isNewDevice(), loginUser(), getTransporter(), sendEmail() (+3 more)

### Community 6 - "Contract Document & Receipts"
Cohesion: 0.07
Nodes (33): buildParty(), ContractDetail, ContractDocument, formatDate(), getContractDetail(), Party, PartyUser, SignatureRecord (+25 more)

### Community 7 - "KYC Verification"
Cohesion: 0.20
Nodes (16): FaceMatch, KIND_LABELS, KycEvidence, recordKycVerification(), submitKycAction(), submitKycVerification(), ALLOWED_INPUT_FORMATS, ALLOWED_TYPES (+8 more)

### Community 8 - "QES & Env Validation"
Cohesion: 0.24
Nodes (17): registerUser(), sendOtpCode(), verifyOtpCode(), sha256(), isValidRole(), clearExpiredOtps(), consumePhoneOtp(), createUser() (+9 more)

### Community 9 - "i18n & Root Layout"
Cohesion: 0.05
Nodes (54): setLocaleAction(), generateMetadata(), inter, RootLayout(), CookieBanner(), hasConsent(), listeners, subscribe() (+46 more)

### Community 10 - "Dashboard Data Views"
Cohesion: 0.10
Nodes (26): DashboardPropertiesPage(), DashboardTicketsPage(), BadgeVariant, CONTRACT_STATUS, ContractPayment, ContractView, formatDate(), formatDateTime() (+18 more)

### Community 11 - "Auth API Routes"
Cohesion: 0.20
Nodes (15): POST(), POST(), POST(), POST(), requestPasswordReset(), sendPhoneOtpCode(), buckets, clientIp() (+7 more)

### Community 12 - "Validation Schemas"
Cohesion: 0.12
Nodes (19): POST(), resetConfirmSchema, resetPassword(), isValidCui(), isValidRegNumber(), adminUserUpdateSchema, changePasswordSchema, contractTermsSchema (+11 more)

### Community 13 - "Homepage Slide Deck"
Cohesion: 0.16
Nodes (9): getS3(), localBackend, PRIVATE_ROOT, PUBLIC_ROOT, publicBaseUrl(), requireEnv(), s3Backend, S3Module (+1 more)

### Community 14 - "NPM Dependencies"
Cohesion: 0.09
Nodes (22): dependencies, asn1js, @aws-sdk/client-s3, bcryptjs, clsx, jose, lucide-react, next (+14 more)

### Community 15 - "Admin Dashboard Pages"
Cohesion: 0.16
Nodes (10): DashboardOffersPage(), EmptyState(), EmptyStateProps, PRIORITY_RANK, SORTS, STATUS_FILTERS, getOffers(), offerStatus() (+2 more)

### Community 16 - "Legacy Landing Sections"
Cohesion: 0.14
Nodes (13): Chiria și modalitatea de plată, Durata contractului, Garanția (depozitul), Legea aplicabilă și litigiile, Notificări, Obiectul contractului, Obligațiile chiriașului, Obligațiile proprietarului (+5 more)

### Community 17 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 18 - "Support Tickets"
Cohesion: 0.26
Nodes (10): payRentAction(), paySaleAction(), SignatureInput, ContractActions(), requestBaseUrl(), CheckoutResult, createCheckoutSession(), loadPayment() (+2 more)

### Community 19 - "NPM Scripts"
Cohesion: 0.12
Nodes (17): scripts, build, db:generate, db:push, db:seed, dev, dev:https, lint (+9 more)

### Community 20 - "Auth Pages & Forms"
Cohesion: 0.20
Nodes (23): signContractAction(), recordAuditSafe(), processAutopay(), authorizedOnContract(), cancelSaleContract(), CloseResult, renewRentalContract(), returnRentalDeposit() (+15 more)

### Community 22 - "Dev Dependencies"
Cohesion: 0.12
Nodes (16): devDependencies, autoprefixer, eslint, eslint-config-next, @eslint/eslintrc, @playwright/test, postcss, prisma (+8 more)

### Community 23 - "Listing Reports & Moderation"
Cohesion: 0.21
Nodes (12): reportAction(), resolveReportAction(), ReportResolveControls(), REASONS, ReportButton(), REPORT_REASONS, REPORT_STATUSES, REPORT_TARGETS (+4 more)

### Community 24 - "Saved Searches & APIs"
Cohesion: 0.18
Nodes (11): 10. Content & microcopy, 2. Forms (where users spend the most effort), 3. Loading & perceived performance, 4. Flow & guidance (the "natural" part), 5. Search & listings, 6. Property photos, 7. Micro-interactions & motion, 8. Accessibility (also makes it feel "finished") (+3 more)

### Community 25 - "Session & Site Meta"
Cohesion: 0.23
Nodes (10): canvasToJpeg(), Capture, fileToCanvas(), KycForm(), Mode, STEP_INFO, Target, faceDescriptor() (+2 more)

### Community 26 - "Admin Support Actions"
Cohesion: 0.07
Nodes (29): 0.8.0 — 2026-06-15, 0.8.1 — 2026-06-15, 0.8.2 — 2026-06-16, 0.8.3 — 2026-06-16, 0.8.4 — 2026-06-17, 0.9.0 — 2026-06-19, 0.9.10 — 2026-06-27, 0.9.1 — 2026-06-19 (+21 more)

### Community 27 - "Admin Users & KYC Pages"
Cohesion: 0.19
Nodes (15): AdminPage(), AdminPage(), AdminUserSupportPage(), DashboardPage(), DashboardPaymentsPage(), dateFmt, KycVerificationPage(), AdminUserRow (+7 more)

### Community 28 - "Misc Dashboard Actions"
Cohesion: 0.14
Nodes (14): Backlog — room for more, Clavium — Road to Paid Public Launch, Design Re-Shaped, Domain gaps — real-use logic (currently happy-path only), Done (v0.9.10 — branch `refactor/stability-perf-pass`), Growth & reach, Housekeeping, Phase 1 — Make a real deploy work (BLOCKERS) (+6 more)

### Community 29 - "Reviews & UI Buttons"
Cohesion: 0.25
Nodes (11): adminModeratePropertyAction(), adminRefundPaymentAction(), adminSetKycStatusAction(), adminVerifyAuditChainAction(), KYC_STATUSES, KycStatus, KycOverrideControls(), PropertyModerateControl() (+3 more)

### Community 30 - "Dashboard Navigation"
Cohesion: 0.06
Nodes (36): acceptTermsAction(), highlights, DashboardLayout(), metadata, ActionResult, DueType, MarkNotificationsRead(), OfferActions() (+28 more)

### Community 31 - "Project Docs & CI"
Cohesion: 0.40
Nodes (5): Isolated Test Database Harness, Local Dev Postgres (docker compose), CI Pipeline (lint, typecheck, test, build), CI Postgres 16 Service, Isolated Test Schema (clavium_test)

### Community 32 - "Dashboard Layout & Alerts"
Cohesion: 0.23
Nodes (9): updateUserAction(), AdminReportsPage(), REASON_LABELS, AdminUsersTable(), ROLES, badgeStyles, StatusBadge(), StatusBadgeProps (+1 more)

### Community 33 - "Dashboard Action Helpers"
Cohesion: 0.17
Nodes (11): Arvuna — efecte (art. 1544 Cod civil), Declarațiile vânzătorului, Legea aplicabilă și litigiile, Notificări, Obiectul antecontractului, Predarea imobilului, Prețul și avansul (arvuna), Protecția datelor cu caracter personal (+3 more)

### Community 34 - "TOTP Algorithm"
Cohesion: 0.06
Nodes (51): RFC-4226, RFC-4648, RFC-6238, AUTHOR_STATUSES, markTicketReadAction(), replyToTicketAction(), setTicketStatusAction(), STATUS_LABEL (+43 more)

### Community 35 - "Profile Management"
Cohesion: 0.23
Nodes (12): changePasswordAction(), deactivateAccountAction(), updateProfileAction(), POST(), ProfileForms(), ProfileFormsProps, changePassword(), revokeAllSessions() (+4 more)

### Community 36 - "Login & 2FA Flow"
Cohesion: 0.22
Nodes (9): API endpoints, Clavium.ro — Imobiliare fără intermediari, Project structure, Roadmap / not yet implemented, Scripts, Security notes, Tech stack, User roles (+1 more)

### Community 37 - "Theme & Auth Layout"
Cohesion: 0.29
Nodes (7): 0.4.0 — 2026-06-13, Calitate, SEO, legal, Fotografii, căutare pentru clienți și UX (follow-up 0.4), Infrastructură, Marketplace funcțional (milestone 0.4), Plăți și chirii recurente (milestone 0.5), Securitate

### Community 38 - "Legal & Static Pages"
Cohesion: 0.23
Nodes (9): metadata, PrivacyPage(), sections, NotFound(), metadata, sections, TermsPage(), getNavUser() (+1 more)

### Community 39 - "Ticket List UI"
Cohesion: 0.29
Nodes (11): certName(), checkRevocation(), engine, loadTrustAnchors(), ocspUrl(), parseCert(), pemToDer(), QesVerifyInput (+3 more)

### Community 40 - "Owner Services Catalog"
Cohesion: 0.31
Nodes (7): DashboardServicesPage(), metadata, PublicServicesPage(), ServiceCard(), OwnerService, serviceRequestMailto(), SERVICES

### Community 41 - "Inquiry Messaging"
Cohesion: 0.33
Nodes (7): InquiryThreadPage(), DashboardMessagesPage(), fullName(), getInquiriesFor(), getInquiryThread(), InquiryListItem, InquiryThread

### Community 42 - "Inquiry Actions"
Cohesion: 0.33
Nodes (6): 0.5.0 — 2026-06-13, Feedback și interacțiuni (UX batch 1–3), Limbajul vizual al homepage-ului în dashboard, Navigație și acces, Notificări, Performanță

### Community 43 - "2FA Setup"
Cohesion: 0.33
Nodes (6): 1.0.0 — 2026-06-30, Domeniu, Growth, Ops & integrări (env-gated), Securitate & confidențialitate, Trust & safety

### Community 44 - "Profile Page & Referrals"
Cohesion: 0.17
Nodes (17): revokeOtherSessionsAction(), revokeSessionAction(), DashboardProfilePage(), relativeTime(), ReferralCard(), SessionManager(), SessionView, getNotifications() (+9 more)

### Community 45 - "Package Metadata"
Cohesion: 0.25
Nodes (7): engines, node, name, prisma, seed, private, version

### Community 47 - "Session Revocation"
Cohesion: 0.40
Nodes (5): createTicketAction(), CATEGORIES, NewTicketForm(), PRIORITIES, TicketableContract

### Community 48 - "Email Verify & Logging"
Cohesion: 0.11
Nodes (22): POST(), GET(), GET(), confirmEmailToken(), encoder, getUserFromToken(), jwtKey, revokeSessionFromToken() (+14 more)

### Community 49 - "Contracts Page & Toasts"
Cohesion: 0.38
Nodes (5): DashboardContractsPage(), MESSAGES, PaymentToast(), contractPaymentProgress(), getContracts()

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

### Community 57 - "Vercel Config"
Cohesion: 0.50
Nodes (3): buildCommand, crons, $schema

### Community 84 - "page 2.tsx"
Cohesion: 0.17
Nodes (14): setContractTermsAction(), createReviewAction(), AUDIT_LABEL, ContractDetailPage(), ContractTermsForm(), Terms, PrintButton(), ReviewForm() (+6 more)

### Community 85 - "Ancore de încredere QES (certificate root ale furnizorilor calificați)"
Cohesion: 0.50
Nodes (3): Ancore de încredere QES (certificate root ale furnizorilor calificați), Cum se populează, Important

### Community 86 - "proxy.ts"
Cohesion: 0.25
Nodes (6): RoleCheckRequest, canAccessResource(), hasPermission(), ROLE_PERMISSIONS, ROLES, UserRole

### Community 87 - "0.5.1 — 2026-06-14"
Cohesion: 0.67
Nodes (3): 0.5.1 — 2026-06-14, Experiența cu fotografii, Flux ghidat (next-steps)

### Community 124 - "hash.ts"
Cohesion: 0.40
Nodes (5): Demo accounts (after `npm run db:seed`), Environment (`.env`), Getting started, Prerequisites, Setup

### Community 125 - "SaleTermsForm.tsx"
Cohesion: 0.40
Nodes (5): 1.1 Feedback is a single mutable string — the biggest offender, 1.2 Every action triggers a full server refetch — no optimism, 1.3 Inconsistent micro-decisions (the "unedged" feel), 1.4 Native browser dialogs, 1. The root causes (why it feels rough)

### Community 126 - "constants.ts"
Cohesion: 0.28
Nodes (8): AuditAction, AuditEntity, AuditInput, AuditTrailItem, canonical(), GENESIS, recordAudit(), verifyAuditChain()

### Community 127 - "inquiries.ts"
Cohesion: 0.24
Nodes (10): setAutopayAction(), closeInquiryAction(), replyInquiryAction(), sendInquiryAction(), markNotificationsReadAction(), AutopayToggle(), InquiryThreadView(), timeFmt (+2 more)

### Community 129 - "ThemeToggle.tsx"
Cohesion: 0.50
Nodes (4): Larger investments (worth it for production), Medium (1–3 days each), Prioritized roadmap, Quick wins (hours each, do first)

### Community 130 - "env.ts"
Cohesion: 0.43
Nodes (5): register(), isPlaceholder(), validateEnv(), qesConfigured(), storageIsPersistent()

### Community 131 - "route.ts"
Cohesion: 0.50
Nodes (4): POST(), verifyPhoneOtpCode(), verifyPhoneOtp(), phoneOtpVerifySchema

### Community 132 - "kyc.ts"
Cohesion: 0.40
Nodes (4): KYC_ENABLED, KycDecision, KycStatus, TODO: integrare furnizor KYC — creează un „applicant", încarcă documentele, porn

## Knowledge Gaps
- **452 isolated node(s):** `eslintConfig`, `securityHeaders`, `nextConfig`, `name`, `version` (+447 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **60 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `errorMessage()` connect `Cron Jobs & Email` to `Property & Offer Actions`, `Contract & Payment Flow`, `Property Search & Listing UI`, `route.ts`, `Commission & Sale Terms`, `Auth Core & Registration`, `KYC Verification`, `Auth API Routes`, `Validation Schemas`, `Support Tickets`, `Auth Pages & Forms`, `Listing Reports & Moderation`, `Reviews & UI Buttons`, `Dashboard Navigation`, `Dashboard Layout & Alerts`, `TOTP Algorithm`, `Profile Management`, `Profile Page & Referrals`, `Session Revocation`, `page 2.tsx`, `inquiries.ts`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Dev Dependencies` to `Package Metadata`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `prisma` connect `Dev Dependencies` to `Property & Offer Actions`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `NOTE: This file should not be edited`, `securityHeaders` to the rest of the system?**
  _458 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Property & Offer Actions` be split into smaller, more focused modules?**
  _Cohesion score 0.06091757091185989 - nodes in this community are weakly interconnected._
- **Should `Property Search & Listing UI` be split into smaller, more focused modules?**
  _Cohesion score 0.10204081632653061 - nodes in this community are weakly interconnected._
- **Should `Cron Jobs & Email` be split into smaller, more focused modules?**
  _Cohesion score 0.068997668997669 - nodes in this community are weakly interconnected._