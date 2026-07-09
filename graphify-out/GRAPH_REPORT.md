# Graph Report - clavium  (2026-07-09)

## Corpus Check
- 309 files · ~103,709 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1313 nodes · 3340 edges · 124 communities (65 shown, 59 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.61)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2b7de3fb`
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

## God Nodes (most connected - your core abstractions)
1. `errorMessage()` - 96 edges
2. `requireActionUser()` - 66 edges
3. `getCurrentUser` - 48 edges
4. `notify()` - 45 edges
5. `Changelog` - 36 edges
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
- `DashboardServicesPage()` --calls--> `getCurrentUser`  [EXTRACTED]
  src/app/dashboard/servicii/page.tsx → src/lib/session.ts
- `KycVerificationPage()` --calls--> `getCurrentUser`  [EXTRACTED]
  src/app/dashboard/verificare/page.tsx → src/lib/session.ts

## Import Cycles
- None detected.

## Communities (124 total, 59 thin omitted)

### Community 0 - "Property & Offer Actions"
Cohesion: 0.08
Nodes (41): createOfferAction(), OPEN_CONTRACT_STATUSES, respondToOfferAction(), createPropertyAction(), toggleSaveAction(), DbUser, DbUser, listing() (+33 more)

### Community 1 - "Contract & Payment Flow"
Cohesion: 0.05
Nodes (81): adminModeratePropertyAction(), adminRefundPaymentAction(), adminSetKycStatusAction(), adminVerifyAuditChainAction(), KYC_STATUSES, KycStatus, cancelSaleAction(), payRentAction() (+73 more)

### Community 2 - "Property Search & Listing UI"
Cohesion: 0.11
Nodes (34): deleteSavedSearchAction(), saveSearchAction(), DashboardSearchPage(), metadata, SavedSearches(), SavedSearchView, PropertyCard(), PropertyCardData (+26 more)

### Community 3 - "Cron Jobs & Email"
Cohesion: 0.10
Nodes (30): GET(), GET(), authorizeCron(), cronUnauthorized(), contractTitle(), daysOverdue(), formatDay(), processDunning() (+22 more)

### Community 4 - "Commission & Sale Terms"
Cohesion: 0.07
Nodes (38): importListingAction(), generateMetadata(), PropertyDetailPage(), ronFmt, SaleTerms, SaleTermsForm(), rentCommission(), SALE_BRACKETS (+30 more)

### Community 5 - "Auth Core & Registration"
Cohesion: 0.18
Nodes (19): GlobalError(), registerUser(), sendOtpCode(), verifyOtpCode(), captureException(), applyReferral(), CompanyInput, isValidRole() (+11 more)

### Community 6 - "Contract Document & Receipts"
Cohesion: 0.07
Nodes (41): setAutopayAction(), closeInquiryAction(), replyInquiryAction(), sendInquiryAction(), markNotificationsReadAction(), GET(), GET(), GET() (+33 more)

### Community 7 - "KYC Verification"
Cohesion: 0.07
Nodes (49): FaceMatch, KIND_LABELS, KycEvidence, recordKycVerification(), submitKycAction(), deletePhotoAction(), revalidateProperties(), updatePropertyAction() (+41 more)

### Community 8 - "QES & Env Validation"
Cohesion: 0.09
Nodes (28): register(), isPlaceholder(), validateEnv(), contractDigest(), contractDocumentHash(), SignableContract, certName(), checkRevocation() (+20 more)

### Community 9 - "i18n & Root Layout"
Cohesion: 0.19
Nodes (15): setLocaleAction(), LanguageSwitcher(), I18nContext, I18nValue, useI18n(), isLocale(), Locale, LOCALE_LABELS (+7 more)

### Community 10 - "Dashboard Data Views"
Cohesion: 0.10
Nodes (24): DashboardOffersPage(), BadgeVariant, CONTRACT_STATUS, ContractPayment, ContractView, formatDate(), formatDateTime(), getOffers() (+16 more)

### Community 11 - "Auth API Routes"
Cohesion: 0.16
Nodes (18): POST(), POST(), POST(), POST(), requestPasswordReset(), sendPhoneOtpCode(), verifyPhoneOtpCode(), buckets (+10 more)

### Community 12 - "Validation Schemas"
Cohesion: 0.12
Nodes (19): POST(), resetConfirmSchema, resetPassword(), isValidCui(), isValidRegNumber(), adminUserUpdateSchema, changePasswordSchema, contractTermsSchema (+11 more)

### Community 13 - "Homepage Slide Deck"
Cohesion: 0.19
Nodes (12): CtaSection(), FeaturedSlider(), SlideDevelopers(), SlideHowItWorks(), STEP_ICONS, SlideOwners(), SlideRenters(), TX_TO_FILTER (+4 more)

### Community 14 - "NPM Dependencies"
Cohesion: 0.09
Nodes (22): dependencies, asn1js, @aws-sdk/client-s3, bcryptjs, clsx, jose, lucide-react, next (+14 more)

### Community 15 - "Admin Dashboard Pages"
Cohesion: 0.20
Nodes (11): AdminReportsPage(), REASON_LABELS, DashboardPage(), DashboardPaymentsPage(), badgeStyles, StatusBadge(), StatusBadgeProps, getOverview() (+3 more)

### Community 16 - "Legacy Landing Sections"
Cohesion: 0.18
Nodes (12): HeroSection(), TX_TO_FILTER, TxType, HowItWorksSection(), STEPS, FEATURES, SignatureSection(), TransactionTypesSection() (+4 more)

### Community 17 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 18 - "Support Tickets"
Cohesion: 0.20
Nodes (13): AUTHOR_STATUSES, markTicketReadAction(), replyToTicketAction(), setTicketStatusAction(), STATUS_LABEL, MANAGER_STATUSES, TicketCard(), Button (+5 more)

### Community 19 - "NPM Scripts"
Cohesion: 0.12
Nodes (17): scripts, build, db:generate, db:push, db:seed, dev, dev:https, lint (+9 more)

### Community 20 - "Auth Pages & Forms"
Cohesion: 0.19
Nodes (12): LoginPage(), LoginTab, readTab(), subscribeTab(), RegisterPage(), roleOptions, steps, FormField (+4 more)

### Community 22 - "Dev Dependencies"
Cohesion: 0.12
Nodes (16): devDependencies, autoprefixer, eslint, eslint-config-next, @eslint/eslintrc, @playwright/test, postcss, prisma (+8 more)

### Community 23 - "Listing Reports & Moderation"
Cohesion: 0.21
Nodes (12): reportAction(), resolveReportAction(), ReportResolveControls(), REASONS, ReportButton(), REPORT_REASONS, REPORT_STATUSES, REPORT_TARGETS (+4 more)

### Community 24 - "Saved Searches & APIs"
Cohesion: 0.05
Nodes (39): 1. Landing page (`/`), 2. Registration (`/auth/register`), 3. Login (`/auth/login`), 4. Dashboard (`/dashboard`), API endpoints, Clavium.ro — Imobiliare fără intermediari, Demo accounts (after `npm run db:seed`), Environment (`.env`) (+31 more)

### Community 25 - "Session & Site Meta"
Cohesion: 0.15
Nodes (16): POST(), GET(), encoder, getUserFromToken(), jwtKey, revokeSessionFromToken(), verifyToken(), AccountType (+8 more)

### Community 26 - "Admin Support Actions"
Cohesion: 0.07
Nodes (27): 0.8.0 — 2026-06-15, 0.8.1 — 2026-06-15, 0.8.2 — 2026-06-16, 0.8.3 — 2026-06-16, 0.8.4 — 2026-06-17, 0.9.0 — 2026-06-19, 0.9.10 — 2026-06-27, 0.9.1 — 2026-06-19 (+19 more)

### Community 27 - "Admin Users & KYC Pages"
Cohesion: 0.19
Nodes (11): updateUserAction(), AdminPage(), AdminPage(), dateFmt, KycVerificationPage(), AdminUserRow, AdminUsersTable(), ROLES (+3 more)

### Community 28 - "Misc Dashboard Actions"
Cohesion: 0.13
Nodes (14): Backlog — room for more, Clavium — Road to Paid Public Launch, Design Re-Shaped, Domain gaps — real-use logic (currently happy-path only), Done (v0.9.10 — branch `refactor/stability-perf-pass`), Growth & reach, Housekeeping, Phase 1 — Make a real deploy work (BLOCKERS) (+6 more)

### Community 29 - "Reviews & UI Buttons"
Cohesion: 0.25
Nodes (4): ButtonProps, Variant, variantClass, Spinner()

### Community 30 - "Dashboard Navigation"
Cohesion: 0.07
Nodes (32): acceptTermsAction(), highlights, DashboardLayout(), metadata, STATES, LogoutButton(), iconMap, MobileTopBar() (+24 more)

### Community 31 - "Project Docs & CI"
Cohesion: 0.40
Nodes (5): Isolated Test Database Harness, Local Dev Postgres (docker compose), CI Pipeline (lint, typecheck, test, build), CI Postgres 16 Service, Isolated Test Schema (clavium_test)

### Community 32 - "Dashboard Layout & Alerts"
Cohesion: 0.32
Nodes (5): DashboardPropertiesPage(), PropertyForm(), getProperties(), priceLabel(), PropertyView

### Community 33 - "Dashboard Action Helpers"
Cohesion: 0.22
Nodes (10): ActionResult, DueType, MarkNotificationsRead(), OfferActions(), PAY_LABEL, PropertyStatusToggle(), RunOptions, useAction() (+2 more)

### Community 34 - "TOTP Algorithm"
Cohesion: 0.19
Nodes (19): RFC-4226, RFC-4648, RFC-6238, begin2faSetupAction(), confirm2faAction(), disable2faAction(), groupSecret(), TwoFactorSettings() (+11 more)

### Community 35 - "Profile Management"
Cohesion: 0.44
Nodes (8): changePasswordAction(), deactivateAccountAction(), updateProfileAction(), ProfileForms(), ProfileFormsProps, changePassword(), revokeAllSessions(), getUserById()

### Community 36 - "Login & 2FA Flow"
Cohesion: 0.22
Nodes (14): POST(), POST(), POST(), createToken(), DeviceMeta, isNewDevice(), loginUser(), getTransporter() (+6 more)

### Community 37 - "Theme & Auth Layout"
Cohesion: 0.29
Nodes (7): 0.4.0 — 2026-06-13, Calitate, SEO, legal, Fotografii, căutare pentru clienți și UX (follow-up 0.4), Infrastructură, Marketplace funcțional (milestone 0.4), Plăți și chirii recurente (milestone 0.5), Securitate

### Community 38 - "Legal & Static Pages"
Cohesion: 0.13
Nodes (14): metadata, PrivacyPage(), sections, NotFound(), HomePage(), PropertiesPage(), PublicServicesPage(), metadata (+6 more)

### Community 39 - "Ticket List UI"
Cohesion: 0.23
Nodes (8): DashboardTicketsPage(), EmptyState(), EmptyStateProps, PRIORITY_RANK, SORTS, STATUS_FILTERS, getTicketableContracts(), TicketView

### Community 40 - "Owner Services Catalog"
Cohesion: 0.36
Nodes (6): DashboardServicesPage(), metadata, ServiceCard(), OwnerService, serviceRequestMailto(), SERVICES

### Community 41 - "Inquiry Messaging"
Cohesion: 0.35
Nodes (8): InquiryThreadPage(), DashboardMessagesPage(), fullName(), getInquiriesFor(), getInquiryThread(), InquiryListItem, InquiryThread, getCurrentUser

### Community 42 - "Inquiry Actions"
Cohesion: 0.33
Nodes (6): 0.5.0 — 2026-06-13, Feedback și interacțiuni (UX batch 1–3), Limbajul vizual al homepage-ului în dashboard, Navigație și acces, Notificări, Performanță

### Community 43 - "2FA Setup"
Cohesion: 0.33
Nodes (6): 1.0.0 — 2026-06-30, Domeniu, Growth, Ops & integrări (env-gated), Securitate & confidențialitate, Trust & safety

### Community 44 - "Profile Page & Referrals"
Cohesion: 0.18
Nodes (16): revokeOtherSessionsAction(), revokeSessionAction(), DashboardProfilePage(), relativeTime(), ReferralCard(), SessionManager(), SessionView, getNotifications() (+8 more)

### Community 45 - "Package Metadata"
Cohesion: 0.25
Nodes (7): engines, node, name, prisma, seed, private, version

### Community 47 - "Session Revocation"
Cohesion: 0.40
Nodes (5): createTicketAction(), CATEGORIES, NewTicketForm(), PRIORITIES, TicketableContract

### Community 48 - "Email Verify & Logging"
Cohesion: 0.27
Nodes (7): GET(), POST(), confirmEmailToken(), sendVerificationEmail(), randomToken(), sha256(), storePhoneOtp()

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
Cohesion: 0.27
Nodes (9): generateMetadata(), inter, RootLayout(), CookieBanner(), hasConsent(), listeners, subscribe(), LocaleProvider() (+1 more)

### Community 57 - "Vercel Config"
Cohesion: 0.50
Nodes (3): buildCommand, crons, $schema

### Community 84 - "page 2.tsx"
Cohesion: 0.50
Nodes (3): PropertyDetailPage(), CopyLinkButton(), CopyLinkButtonProps

### Community 85 - "Ancore de încredere QES (certificate root ale furnizorilor calificați)"
Cohesion: 0.50
Nodes (3): Ancore de încredere QES (certificate root ale furnizorilor calificați), Cum se populează, Important

### Community 86 - "proxy.ts"
Cohesion: 0.67
Nodes (3): buildCsp(), config, proxy()

### Community 87 - "0.5.1 — 2026-06-14"
Cohesion: 0.67
Nodes (3): 0.5.1 — 2026-06-14, Experiența cu fotografii, Flux ghidat (next-steps)

## Knowledge Gaps
- **420 isolated node(s):** `eslintConfig`, `securityHeaders`, `nextConfig`, `name`, `version` (+415 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **59 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `errorMessage()` connect `Contract Document & Receipts` to `Property & Offer Actions`, `Contract & Payment Flow`, `Property Search & Listing UI`, `Cron Jobs & Email`, `Commission & Sale Terms`, `Auth Core & Registration`, `KYC Verification`, `Auth API Routes`, `Validation Schemas`, `Support Tickets`, `Listing Reports & Moderation`, `Admin Users & KYC Pages`, `Dashboard Navigation`, `TOTP Algorithm`, `Profile Management`, `Login & 2FA Flow`, `Profile Page & Referrals`, `Session Revocation`, `Email Verify & Logging`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Dev Dependencies` to `Package Metadata`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Why does `prisma` connect `Dev Dependencies` to `Property & Offer Actions`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `NOTE: This file should not be edited`, `securityHeaders` to the rest of the system?**
  _426 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Property & Offer Actions` be split into smaller, more focused modules?**
  _Cohesion score 0.07943037974683544 - nodes in this community are weakly interconnected._
- **Should `Contract & Payment Flow` be split into smaller, more focused modules?**
  _Cohesion score 0.05290072297654735 - nodes in this community are weakly interconnected._
- **Should `Property Search & Listing UI` be split into smaller, more focused modules?**
  _Cohesion score 0.10638297872340426 - nodes in this community are weakly interconnected._