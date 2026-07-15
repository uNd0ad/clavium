# Graph Report - clavium  (2026-07-12)

## Corpus Check
- 315 files · ~158,567 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1375 nodes · 3432 edges · 138 communities (78 shown, 60 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.59)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5fe6094e`
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
- Inquiry Messaging
- Inquiry Actions
- 2FA Setup
- Profile Page & Referrals
- Package Metadata
- QES Compliance Docs
- Session Revocation
- storageBackend.ts
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
- Dunning Roadmap
- i18n Roadmap
- eFactura Flag
- Client Role
- Owner Role
- page 2.tsx
- Ancore de încredere QES (certificate root ale furnizorilor calificați)
- kyc.ts
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
- roles.ts
- ThemeToggle.tsx
- storage.ts
- sessions.ts
- env.ts
- 1.4.0 — 2026-07-10
- referrals.ts
- page.tsx
- terms.ts
- sessions.ts

## God Nodes (most connected - your core abstractions)
1. `errorMessage()` - 96 edges
2. `requireActionUser()` - 66 edges
3. `getCurrentUser` - 48 edges
4. `notify()` - 45 edges
5. `Changelog` - 45 edges
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
- `AdminPage()` --calls--> `getCurrentUser`  [EXTRACTED]
  src/app/dashboard/admin/page 2.tsx → src/lib/session.ts
- `Footer()` --calls--> `useDict()`  [EXTRACTED]
  src/components/layout/Footer.tsx → src/lib/i18n/client.tsx
- `Navbar()` --calls--> `useDict()`  [EXTRACTED]
  src/components/layout/Navbar.tsx → src/lib/i18n/client.tsx

## Import Cycles
- None detected.

## Communities (138 total, 60 thin omitted)

### Community 0 - "Property & Offer Actions"
Cohesion: 0.09
Nodes (37): createOfferAction(), OPEN_CONTRACT_STATUSES, respondToOfferAction(), createPropertyAction(), DbUser, DbUser, listing(), DbUser (+29 more)

### Community 1 - "Contract & Payment Flow"
Cohesion: 0.23
Nodes (10): FeaturedSlider(), SlideDevelopers(), SlideHowItWorks(), STEP_ICONS, SlideOwners(), SlideRenters(), TX_TO_FILTER, TxType (+2 more)

### Community 2 - "Property Search & Listing UI"
Cohesion: 0.05
Nodes (63): GET(), GET(), DashboardSearchPage(), metadata, PropertiesPage(), SavedSearchView, PropertyCard(), PropertyCardData (+55 more)

### Community 3 - "Cron Jobs & Email"
Cohesion: 0.05
Nodes (78): adminModeratePropertyAction(), adminRefundPaymentAction(), adminSetKycStatusAction(), KYC_STATUSES, KycStatus, cancelSaleAction(), payRentAction(), paySaleAction() (+70 more)

### Community 4 - "Commission & Sale Terms"
Cohesion: 0.07
Nodes (41): setSaleTermsAction(), generateMetadata(), PropertyDetailPage(), ronFmt, SaleTerms, SaleTermsForm(), CopyLinkButton(), CopyLinkButtonProps (+33 more)

### Community 5 - "Auth Core & Registration"
Cohesion: 0.19
Nodes (20): POST(), POST(), POST(), POST(), POST(), POST(), createToken(), isNewDevice() (+12 more)

### Community 6 - "Contract Document & Receipts"
Cohesion: 0.07
Nodes (38): GET(), GET(), GET(), GuardResult, requireUser(), buildParty(), ContractDetail, ContractDocument (+30 more)

### Community 7 - "KYC Verification"
Cohesion: 0.23
Nodes (10): canvasToJpeg(), Capture, fileToCanvas(), KycForm(), Mode, STEP_INFO, Target, faceDescriptor() (+2 more)

### Community 8 - "QES & Env Validation"
Cohesion: 0.33
Nodes (7): HomePage(), SlideSnap(), ServiceCard(), getHomeData(), OwnerService, serviceRequestMailto(), SERVICES

### Community 9 - "i18n & Root Layout"
Cohesion: 0.19
Nodes (15): setLocaleAction(), LanguageSwitcher(), I18nContext, I18nValue, useI18n(), isLocale(), Locale, LOCALE_LABELS (+7 more)

### Community 10 - "Dashboard Data Views"
Cohesion: 0.10
Nodes (24): DashboardOffersPage(), BadgeVariant, CONTRACT_STATUS, ContractPayment, ContractView, formatDate(), formatDateTime(), getOffers() (+16 more)

### Community 11 - "Auth API Routes"
Cohesion: 0.13
Nodes (31): GET(), confirmEmailToken(), encoder, jwtKey, registerUser(), sendOtpCode(), verifyOtpCode(), AccountType (+23 more)

### Community 12 - "Validation Schemas"
Cohesion: 0.10
Nodes (24): POST(), POST(), resetConfirmSchema, resetPassword(), verifyPhoneOtpCode(), isValidCui(), isValidRegNumber(), adminUserUpdateSchema (+16 more)

### Community 13 - "Homepage Slide Deck"
Cohesion: 0.23
Nodes (14): contractDigest(), contractDocumentHash(), SignableContract, certName(), checkRevocation(), engine, loadTrustAnchors(), ocspUrl() (+6 more)

### Community 14 - "NPM Dependencies"
Cohesion: 0.09
Nodes (22): dependencies, asn1js, @aws-sdk/client-s3, bcryptjs, clsx, jose, lucide-react, next (+14 more)

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
Cohesion: 0.22
Nodes (13): setAutopayAction(), importListingAction(), submitKycAction(), markNotificationsReadAction(), createReviewAction(), deleteSavedSearchAction(), saveSearchAction(), GET() (+5 more)

### Community 19 - "NPM Scripts"
Cohesion: 0.12
Nodes (17): scripts, build, db:generate, db:push, db:seed, dev, dev:https, lint (+9 more)

### Community 20 - "Auth Pages & Forms"
Cohesion: 0.16
Nodes (13): CtaSection(), HeroSection(), TX_TO_FILTER, TxType, HowItWorksSection(), STEPS, FEATURES, SignatureSection() (+5 more)

### Community 22 - "Dev Dependencies"
Cohesion: 0.12
Nodes (16): devDependencies, autoprefixer, eslint, eslint-config-next, @eslint/eslintrc, @playwright/test, postcss, prisma (+8 more)

### Community 23 - "Listing Reports & Moderation"
Cohesion: 0.26
Nodes (10): reportAction(), REASONS, ReportButton(), REPORT_REASONS, REPORT_STATUSES, REPORT_TARGETS, ReportListItem, ReportReason (+2 more)

### Community 24 - "Saved Searches & APIs"
Cohesion: 0.15
Nodes (11): 10. Content & microcopy, 2. Forms (where users spend the most effort), 3. Loading & perceived performance, 4. Flow & guidance (the "natural" part), 5. Search & listings, 6. Property photos, 7. Micro-interactions & motion, 8. Accessibility (also makes it feel "finished") (+3 more)

### Community 25 - "Session & Site Meta"
Cohesion: 0.19
Nodes (13): generateMetadata(), inter, RootLayout(), CookieBanner(), hasConsent(), listeners, subscribe(), DevNoticeBanner() (+5 more)

### Community 26 - "Admin Support Actions"
Cohesion: 0.06
Nodes (35): 0.8.0 — 2026-06-15, 0.8.1 — 2026-06-15, 0.8.2 — 2026-06-16, 0.8.3 — 2026-06-16, 0.8.4 — 2026-06-17, 0.9.0 — 2026-06-19, 0.9.10 — 2026-06-27, 0.9.1 — 2026-06-19 (+27 more)

### Community 27 - "Admin Users & KYC Pages"
Cohesion: 0.24
Nodes (11): DashboardPage(), DashboardPaymentsPage(), DashboardServicesPage(), dateFmt, KycVerificationPage(), DashboardHeader(), DashboardHeaderProps, getOverview() (+3 more)

### Community 28 - "Misc Dashboard Actions"
Cohesion: 0.13
Nodes (15): Backlog — room for more, Clavium — Road to Paid Public Launch, Design Re-Shaped, Domain gaps — real-use logic (currently happy-path only), Done (v0.9.10 — branch `refactor/stability-perf-pass`), Growth & reach, Housekeeping, Phase 1 — Make a real deploy work (BLOCKERS) (+7 more)

### Community 29 - "Reviews & UI Buttons"
Cohesion: 0.18
Nodes (16): deletePhotoAction(), revalidateProperties(), toggleSaveAction(), updatePropertyAction(), updatePropertyStatusAction(), uploadPhotosAction(), PhotoManager(), PropertyEditForm() (+8 more)

### Community 30 - "Dashboard Navigation"
Cohesion: 0.07
Nodes (33): highlights, DashboardLayout(), metadata, ActionResult, DueType, MarkNotificationsRead(), OfferActions(), PAY_LABEL (+25 more)

### Community 31 - "Project Docs & CI"
Cohesion: 0.40
Nodes (5): Isolated Test Database Harness, Local Dev Postgres (docker compose), CI Pipeline (lint, typecheck, test, build), CI Postgres 16 Service, Isolated Test Schema (clavium_test)

### Community 32 - "constants.ts"
Cohesion: 0.15
Nodes (9): POST(), GET(), getUserFromToken(), revokeSessionFromToken(), verifyToken(), APP_URL, buildCsp(), config (+1 more)

### Community 33 - "Dashboard Action Helpers"
Cohesion: 0.17
Nodes (11): Arvuna — efecte (art. 1544 Cod civil), Declarațiile vânzătorului, Legea aplicabilă și litigiile, Notificări, Obiectul antecontractului, Predarea imobilului, Prețul și avansul (arvuna), Protecția datelor cu caracter personal (+3 more)

### Community 34 - "TOTP Algorithm"
Cohesion: 0.11
Nodes (30): RFC-4226, RFC-4648, RFC-6238, begin2faSetupAction(), confirm2faAction(), disable2faAction(), LoginPage(), LoginTab (+22 more)

### Community 35 - "Profile Management"
Cohesion: 0.32
Nodes (10): changePasswordAction(), deactivateAccountAction(), updateProfileAction(), POST(), ProfileForms(), ProfileFormsProps, changePassword(), revokeAllSessions() (+2 more)

### Community 36 - "Login & 2FA Flow"
Cohesion: 0.18
Nodes (9): API endpoints, Clavium.ro — Imobiliare fără intermediari, Project structure, Roadmap / not yet implemented, Scripts, Security notes, Tech stack, User roles (+1 more)

### Community 37 - "Theme & Auth Layout"
Cohesion: 0.29
Nodes (7): 0.4.0 — 2026-06-13, Calitate, SEO, legal, Fotografii, căutare pentru clienți și UX (follow-up 0.4), Infrastructură, Marketplace funcțional (milestone 0.4), Plăți și chirii recurente (milestone 0.5), Securitate

### Community 38 - "Legal & Static Pages"
Cohesion: 0.13
Nodes (15): metadata, PrivacyPage(), sections, NotFound(), metadata, PublicServicesPage(), TERMS_SECTIONS, TermsBlock (+7 more)

### Community 39 - "page.tsx"
Cohesion: 0.21
Nodes (10): adminVerifyAuditChainAction(), updateUserAction(), AdminPage(), AdminPage(), AdminUserRow, AdminUsersTable(), ROLES, AuditVerifyCard() (+2 more)

### Community 40 - "StatusBadge.tsx"
Cohesion: 0.27
Nodes (7): AdminReportsPage(), REASON_LABELS, PropertyDetailPage(), badgeStyles, StatusBadge(), StatusBadgeProps, getReports()

### Community 41 - "Inquiry Messaging"
Cohesion: 0.39
Nodes (6): closeInquiryAction(), replyInquiryAction(), sendInquiryAction(), InquiryThreadView(), timeFmt, AskOwnerForm()

### Community 42 - "Inquiry Actions"
Cohesion: 0.33
Nodes (6): 0.5.0 — 2026-06-13, Feedback și interacțiuni (UX batch 1–3), Limbajul vizual al homepage-ului în dashboard, Navigație și acces, Notificări, Performanță

### Community 43 - "2FA Setup"
Cohesion: 0.33
Nodes (6): 1.0.0 — 2026-06-30, Domeniu, Growth, Ops & integrări (env-gated), Securitate & confidențialitate, Trust & safety

### Community 44 - "Profile Page & Referrals"
Cohesion: 0.36
Nodes (6): DashboardProfilePage(), relativeTime(), ReferralCard(), SessionView, getNotifications(), getCurrentSessionId()

### Community 45 - "Package Metadata"
Cohesion: 0.25
Nodes (7): engines, node, name, prisma, seed, private, version

### Community 47 - "Session Revocation"
Cohesion: 0.12
Nodes (14): resolveReportAction(), createTicketAction(), CATEGORIES, NewTicketForm(), PRIORITIES, ReportResolveControls(), Button, ButtonProps (+6 more)

### Community 48 - "storageBackend.ts"
Cohesion: 0.16
Nodes (9): getS3(), localBackend, PRIVATE_ROOT, PUBLIC_ROOT, publicBaseUrl(), requireEnv(), s3Backend, S3Module (+1 more)

### Community 49 - "tickets.ts"
Cohesion: 0.21
Nodes (12): AUTHOR_STATUSES, markTicketReadAction(), replyToTicketAction(), setTicketStatusAction(), STATUS_LABEL, MANAGER_STATUSES, TicketCard(), ConfirmDialog() (+4 more)

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
Cohesion: 0.40
Nodes (4): buildCommand, crons, regions, $schema

### Community 84 - "page 2.tsx"
Cohesion: 0.33
Nodes (7): InquiryThreadPage(), DashboardMessagesPage(), fullName(), getInquiriesFor(), getInquiryThread(), InquiryListItem, InquiryThread

### Community 85 - "Ancore de încredere QES (certificate root ale furnizorilor calificați)"
Cohesion: 0.50
Nodes (3): Ancore de încredere QES (certificate root ale furnizorilor calificați), Cum se populează, Important

### Community 86 - "kyc.ts"
Cohesion: 0.22
Nodes (9): FaceMatch, KIND_LABELS, KycEvidence, recordKycVerification(), KYC_ENABLED, KycDecision, KycStatus, TODO: integrare furnizor KYC — creează un „applicant", încarcă documentele, porn (+1 more)

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
Nodes (8): findDuplicateListingSignals(), findStolenPhotoSignals(), FraudSignal, hammingDistance(), isSimilar(), POPCOUNT, runFraudChecks(), createSystemReport()

### Community 127 - "page.tsx"
Cohesion: 0.38
Nodes (5): DashboardContractsPage(), MESSAGES, PaymentToast(), contractPaymentProgress(), getContracts()

### Community 128 - "roles.ts"
Cohesion: 0.25
Nodes (6): RoleCheckRequest, canAccessResource(), hasPermission(), ROLE_PERMISSIONS, ROLES, UserRole

### Community 129 - "ThemeToggle.tsx"
Cohesion: 0.50
Nodes (4): Larger investments (worth it for production), Medium (1–3 days each), Prioritized roadmap, Quick wins (hours each, do first)

### Community 130 - "storage.ts"
Cohesion: 0.33
Nodes (9): ALLOWED_INPUT_FORMATS, ALLOWED_TYPES, deleteKycDocument(), deletePropertyPhoto(), KYC_DOCUMENT_KINDS, KycDocumentKind, saveKycDocument(), savePropertyPhoto() (+1 more)

### Community 131 - "sessions.ts"
Cohesion: 0.57
Nodes (5): revokeOtherSessionsAction(), revokeSessionAction(), SessionManager(), revokeOtherSessions(), revokeUserSession()

### Community 132 - "env.ts"
Cohesion: 0.43
Nodes (5): register(), isPlaceholder(), validateEnv(), qesConfigured(), storageIsPersistent()

### Community 134 - "referrals.ts"
Cohesion: 0.52
Nodes (5): applyReferral(), ensureReferralCode(), getReferralStats(), randomCode(), ReferralStats

### Community 135 - "page.tsx"
Cohesion: 0.40
Nodes (4): DashboardPropertiesPage(), getProperties(), priceLabel(), PropertyView

### Community 136 - "terms.ts"
Cohesion: 0.70
Nodes (3): acceptTermsAction(), TermsReconsentBanner(), recordTermsConsent()

### Community 137 - "sessions.ts"
Cohesion: 0.50
Nodes (4): DeviceMeta, deviceLabel(), getUserSessions(), SessionInfo

## Knowledge Gaps
- **464 isolated node(s):** `eslintConfig`, `securityHeaders`, `nextConfig`, `name`, `version` (+459 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **60 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `errorMessage()` connect `Support Tickets` to `Property & Offer Actions`, `TOTP Algorithm`, `Cron Jobs & Email`, `Commission & Sale Terms`, `Profile Management`, `sessions.ts`, `page.tsx`, `terms.ts`, `Inquiry Messaging`, `Auth Core & Registration`, `Contract Document & Receipts`, `Validation Schemas`, `Property Search & Listing UI`, `Session Revocation`, `tickets.ts`, `kyc.ts`, `Listing Reports & Moderation`, `Reviews & UI Buttons`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Dev Dependencies` to `Package Metadata`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `prisma` connect `Dev Dependencies` to `Property & Offer Actions`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `NOTE: This file should not be edited`, `securityHeaders` to the rest of the system?**
  _470 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Property & Offer Actions` be split into smaller, more focused modules?**
  _Cohesion score 0.09399585921325052 - nodes in this community are weakly interconnected._
- **Should `Property Search & Listing UI` be split into smaller, more focused modules?**
  _Cohesion score 0.0546218487394958 - nodes in this community are weakly interconnected._
- **Should `Cron Jobs & Email` be split into smaller, more focused modules?**
  _Cohesion score 0.05238095238095238 - nodes in this community are weakly interconnected._