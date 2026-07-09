# Graph Report - .  (2026-07-09)

## Corpus Check
- 312 files · ~103,516 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1184 nodes · 3245 edges · 84 communities (65 shown, 19 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 26 edges (avg confidence: 0.77)
- Token cost: 86,202 input · 11,355 output

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

## God Nodes (most connected - your core abstractions)
1. `errorMessage()` - 95 edges
2. `requireActionUser()` - 66 edges
3. `getCurrentUser` - 48 edges
4. `notify()` - 44 edges
5. `formatRon()` - 35 edges
6. `makeUser()` - 34 edges
7. `Button` - 29 edges
8. `resetDb()` - 26 edges
9. `sha256()` - 25 edges
10. `recordAuditSafe()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `CI Postgres 16 Service` --semantically_similar_to--> `Local Dev Postgres (docker compose)`  [INFERRED] [semantically similar]
  .github/workflows/ci.yml → docker-compose.yml
- `Isolated Test Database Harness` --semantically_similar_to--> `Isolated Test Schema (clavium_test)`  [INFERRED] [semantically similar]
  CHANGELOG.md → .github/workflows/ci.yml
- `BNR EUR/RON Exchange-Rate Feed` --semantically_similar_to--> `Multi-Currency Display (RON/EUR)`  [INFERRED] [semantically similar]
  CHANGELOG.md → ROADMAP.md
- `S3/R2-Compatible Storage` --semantically_similar_to--> `Persistent Object Storage (S3/R2) Seam`  [INFERRED] [semantically similar]
  CHANGELOG.md → ROADMAP.md
- `Clavium Release History` --implements--> `Styled Confirm Dialog Recommendation`  [INFERRED]
  CHANGELOG.md → UX-REVIEW.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **RBAC Role System** — src_lib_rbac_rbac_system, src_lib_rbac_admin_role, src_lib_rbac_owner_role, src_lib_rbac_client_role [EXTRACTED 1.00]
- **Rental Transaction Lifecycle (list, offer, sign, pay, close)** — readme_rental_lifecycle, changelog_qes_signature, changelog_stripe_checkout, roadmap_dunning, roadmap_deposit_lifecycle [INFERRED 0.85]
- **Electronic Signature Compliance Stack (QES/AES/eIDAS)** — config_qes_trust_readme_qes_trust_anchors, config_qes_trust_readme_romanian_qtsps, roadmap_qes_provider_decision, roadmap_aes_bank_model, changelog_qes_signature [INFERRED 0.85]

## Communities (84 total, 19 thin omitted)

### Community 0 - "Property & Offer Actions"
Cohesion: 0.07
Nodes (58): createOfferAction(), OPEN_CONTRACT_STATUSES, respondToOfferAction(), createPropertyAction(), deletePhotoAction(), revalidateProperties(), toggleSaveAction(), updatePropertyAction() (+50 more)

### Community 1 - "Contract & Payment Flow"
Cohesion: 0.06
Nodes (68): stripe, cancelSaleAction(), payRentAction(), paySaleAction(), renewContractAction(), returnDepositAction(), setContractTermsAction(), SignatureInput (+60 more)

### Community 2 - "Property Search & Listing UI"
Cohesion: 0.08
Nodes (41): DashboardSearchPage(), generateMetadata(), PropertyDetailPage(), metadata, SavedSearchView, PropertyCard(), PropertyCardData, PropertyFiltersForm() (+33 more)

### Community 3 - "Cron Jobs & Email"
Cohesion: 0.08
Nodes (37): GET(), GET(), DeviceMeta, processAutopay(), authorizeCron(), cronUnauthorized(), getTransporter(), sendEmail() (+29 more)

### Community 4 - "Commission & Sale Terms"
Cohesion: 0.09
Nodes (30): setSaleTermsAction(), ronFmt, SaleTerms, SaleTermsForm(), rentCommission(), SALE_BRACKETS, saleCommission(), saleCommissionRate() (+22 more)

### Community 5 - "Auth Core & Registration"
Cohesion: 0.13
Nodes (33): GET(), confirmEmailToken(), encoder, jwtKey, registerUser(), sendOtpCode(), verifyOtpCode(), sha256() (+25 more)

### Community 6 - "Contract Document & Receipts"
Cohesion: 0.09
Nodes (26): GET(), buildParty(), ContractDetail, ContractDocument, formatDate(), getContractDetail(), Party, PartyUser (+18 more)

### Community 7 - "KYC Verification"
Cohesion: 0.09
Nodes (30): FaceMatch, KIND_LABELS, KycEvidence, recordKycVerification(), submitKycAction(), canvasToJpeg(), Capture, fileToCanvas() (+22 more)

### Community 8 - "QES & Env Validation"
Cohesion: 0.09
Nodes (28): register(), isPlaceholder(), validateEnv(), contractDigest(), contractDocumentHash(), SignableContract, certName(), checkRevocation() (+20 more)

### Community 9 - "i18n & Root Layout"
Cohesion: 0.15
Nodes (20): setLocaleAction(), generateMetadata(), inter, RootLayout(), LanguageSwitcher(), I18nContext, I18nValue, LocaleProvider() (+12 more)

### Community 10 - "Dashboard Data Views"
Cohesion: 0.10
Nodes (24): DashboardPropertiesPage(), BadgeVariant, CONTRACT_STATUS, ContractPayment, ContractView, formatDate(), formatDateTime(), getProperties() (+16 more)

### Community 11 - "Auth API Routes"
Cohesion: 0.17
Nodes (18): POST(), POST(), POST(), POST(), POST(), requestPasswordReset(), sendPhoneOtpCode(), verifyPhoneOtpCode() (+10 more)

### Community 12 - "Validation Schemas"
Cohesion: 0.12
Nodes (20): POST(), resetConfirmSchema, resetPassword(), isValidCui(), isValidRegNumber(), adminUserUpdateSchema, changePasswordSchema, contractTermsSchema (+12 more)

### Community 13 - "Homepage Slide Deck"
Cohesion: 0.16
Nodes (15): HomePage(), Footer(), Navbar(), FeaturedSlider(), SlideDevelopers(), SlideHowItWorks(), STEP_ICONS, SlideOwners() (+7 more)

### Community 14 - "NPM Dependencies"
Cohesion: 0.10
Nodes (21): dependencies, asn1js, @aws-sdk/client-s3, bcryptjs, clsx, jose, lucide-react, next (+13 more)

### Community 15 - "Admin Dashboard Pages"
Cohesion: 0.19
Nodes (14): AdminReportsPage(), REASON_LABELS, AdminUserSupportPage(), DashboardPage(), DashboardPaymentsPage(), PropertyDetailPage(), badgeStyles, StatusBadge() (+6 more)

### Community 16 - "Legacy Landing Sections"
Cohesion: 0.16
Nodes (13): CtaSection(), HeroSection(), TX_TO_FILTER, TxType, HowItWorksSection(), STEPS, FEATURES, SignatureSection() (+5 more)

### Community 17 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 18 - "Support Tickets"
Cohesion: 0.17
Nodes (15): AUTHOR_STATUSES, createTicketAction(), markTicketReadAction(), replyToTicketAction(), setTicketStatusAction(), STATUS_LABEL, CATEGORIES, NewTicketForm() (+7 more)

### Community 19 - "NPM Scripts"
Cohesion: 0.12
Nodes (17): scripts, build, db:generate, db:push, db:seed, dev, dev:https, lint (+9 more)

### Community 20 - "Auth Pages & Forms"
Cohesion: 0.19
Nodes (12): LoginPage(), LoginTab, readTab(), subscribeTab(), RegisterPage(), roleOptions, steps, FormField (+4 more)

### Community 21 - "RBAC Roles & Permissions"
Cohesion: 0.17
Nodes (13): Serverless-Safe Shared Rate Limiting (Upstash Redis), Four-Step Registration Wizard, ADMIN Role, RBAC System, requirePermission(), requireRole(), RoleCheckRequest, canAccessResource() (+5 more)

### Community 22 - "Dev Dependencies"
Cohesion: 0.12
Nodes (16): devDependencies, autoprefixer, eslint, eslint-config-next, @eslint/eslintrc, @playwright/test, postcss, prisma (+8 more)

### Community 23 - "Listing Reports & Moderation"
Cohesion: 0.21
Nodes (12): reportAction(), resolveReportAction(), ReportResolveControls(), REASONS, ReportButton(), REPORT_REASONS, REPORT_STATUSES, REPORT_TARGETS (+4 more)

### Community 24 - "Saved Searches & APIs"
Cohesion: 0.30
Nodes (9): deleteSavedSearchAction(), saveSearchAction(), GET(), GET(), GET(), SavedSearches(), GuardResult, requireUser() (+1 more)

### Community 25 - "Session & Site Meta"
Cohesion: 0.16
Nodes (8): POST(), GET(), getUserFromToken(), revokeSessionFromToken(), verifyToken(), buildCsp(), config, proxy()

### Community 26 - "Admin Support Actions"
Cohesion: 0.22
Nodes (12): adminModeratePropertyAction(), adminRefundPaymentAction(), adminSetKycStatusAction(), adminVerifyAuditChainAction(), KYC_STATUSES, KycStatus, updateUserAction(), KycOverrideControls() (+4 more)

### Community 27 - "Admin Users & KYC Pages"
Cohesion: 0.20
Nodes (10): AdminPage(), AdminPage(), dateFmt, KycVerificationPage(), AdminUserRow, AdminUsersTable(), ROLES, DashboardHeader() (+2 more)

### Community 28 - "Misc Dashboard Actions"
Cohesion: 0.27
Nodes (7): setAutopayAction(), importListingAction(), markNotificationsReadAction(), acceptTermsAction(), AutopayToggle(), TermsReconsentBanner(), requireActionUser()

### Community 29 - "Reviews & UI Buttons"
Cohesion: 0.20
Nodes (7): createReviewAction(), ReviewForm(), Button, ButtonProps, Variant, variantClass, Spinner()

### Community 30 - "Dashboard Navigation"
Cohesion: 0.26
Nodes (9): LogoutButton(), iconMap, MobileTopBar(), useUnreadCount(), NotificationTab(), iconMap, DashboardNavItem, dashboardNavItems (+1 more)

### Community 31 - "Project Docs & CI"
Cohesion: 0.15
Nodes (13): Isolated Test Database Harness, Clavium Release History, Server Actions Migration (v0.6.0), Local Dev Postgres (docker compose), CI Pipeline (lint, typecheck, test, build), CI Postgres 16 Service, Isolated Test Schema (clavium_test), Clavium Real-Estate Platform (+5 more)

### Community 32 - "Dashboard Layout & Alerts"
Cohesion: 0.19
Nodes (8): DashboardLayout(), metadata, STATES, NotificationProvider(), SetUnreadContext, UnreadContext, Sidebar(), hasAcceptedCurrentTerms()

### Community 33 - "Dashboard Action Helpers"
Cohesion: 0.22
Nodes (10): ActionResult, DueType, MarkNotificationsRead(), OfferActions(), PAY_LABEL, PropertyStatusToggle(), RunOptions, useAction() (+2 more)

### Community 34 - "TOTP Algorithm"
Cohesion: 0.30
Nodes (10): RFC-4226, RFC-4648, RFC-6238, base32Decode(), base32Encode(), generateTotp(), generateTotpSecret(), hotp() (+2 more)

### Community 35 - "Profile Management"
Cohesion: 0.32
Nodes (9): changePasswordAction(), deactivateAccountAction(), updateProfileAction(), ProfileForms(), ProfileFormsProps, ConfirmDialog(), ConfirmDialogProps, changePassword() (+1 more)

### Community 36 - "Login & 2FA Flow"
Cohesion: 0.39
Nodes (9): POST(), POST(), createToken(), isNewDevice(), loginUser(), notifyNewDevice(), hashBackupCode(), TwoFactorUser (+1 more)

### Community 37 - "Theme & Auth Layout"
Cohesion: 0.23
Nodes (6): highlights, isDark(), listeners, subscribe(), ThemeToggle(), NavUser

### Community 38 - "Legal & Static Pages"
Cohesion: 0.21
Nodes (9): metadata, PrivacyPage(), sections, NotFound(), PropertiesPage(), metadata, sections, TermsPage() (+1 more)

### Community 39 - "Ticket List UI"
Cohesion: 0.23
Nodes (8): DashboardTicketsPage(), EmptyState(), EmptyStateProps, PRIORITY_RANK, SORTS, STATUS_FILTERS, getTicketableContracts(), TicketView

### Community 40 - "Owner Services Catalog"
Cohesion: 0.31
Nodes (7): DashboardServicesPage(), metadata, PublicServicesPage(), ServiceCard(), OwnerService, serviceRequestMailto(), SERVICES

### Community 41 - "Inquiry Messaging"
Cohesion: 0.33
Nodes (7): InquiryThreadPage(), DashboardMessagesPage(), fullName(), getInquiriesFor(), getInquiryThread(), InquiryListItem, InquiryThread

### Community 42 - "Inquiry Actions"
Cohesion: 0.39
Nodes (6): closeInquiryAction(), replyInquiryAction(), sendInquiryAction(), InquiryThreadView(), timeFmt, AskOwnerForm()

### Community 43 - "2FA Setup"
Cohesion: 0.47
Nodes (7): begin2faSetupAction(), confirm2faAction(), disable2faAction(), groupSecret(), TwoFactorSettings(), totpAuthUri(), generateBackupCodes()

### Community 44 - "Profile Page & Referrals"
Cohesion: 0.36
Nodes (6): DashboardProfilePage(), relativeTime(), ReferralCard(), SessionView, getNotifications(), getCurrentSessionId()

### Community 45 - "Package Metadata"
Cohesion: 0.25
Nodes (7): engines, node, name, prisma, seed, private, version

### Community 46 - "QES Compliance Docs"
Cohesion: 0.29
Nodes (7): KYC Identity Verification, QES Contract Signing, QES Trust Anchors Directory, Romanian Qualified Trust Service Providers, Rental Lifecycle Flow, AES 'Bank-Model' Signing Ceremony, QES Provider Decision

### Community 47 - "Session Revocation"
Cohesion: 0.57
Nodes (5): revokeOtherSessionsAction(), revokeSessionAction(), SessionManager(), revokeOtherSessions(), revokeUserSession()

### Community 48 - "Email Verify & Logging"
Cohesion: 0.43
Nodes (5): POST(), GlobalError(), sendVerificationEmail(), captureException(), getUserById()

### Community 49 - "Contracts Page & Toasts"
Cohesion: 0.38
Nodes (5): DashboardContractsPage(), MESSAGES, PaymentToast(), contractPaymentProgress(), getContracts()

### Community 50 - "Referral System"
Cohesion: 0.52
Nodes (5): applyReferral(), ensureReferralCode(), getReferralStats(), randomCode(), ReferralStats

### Community 52 - "Database Seed"
Cohesion: 0.40
Nodes (5): { hash }, main(), prisma, { PrismaClient }, upsertUser()

### Community 53 - "Offers Page"
Cohesion: 0.40
Nodes (4): DashboardOffersPage(), getOffers(), offerStatus(), OfferView

### Community 54 - "Cookie Banner"
Cohesion: 0.60
Nodes (4): CookieBanner(), hasConsent(), listeners, subscribe()

### Community 55 - "JWT Auth Docs"
Cohesion: 0.50
Nodes (4): JWT_SECRET Production-Only Enforcement, Server-Resolved Navbar Auth State, JWT HTTP-only Cookie Auth, Route Protection via proxy.ts

### Community 57 - "Vercel Config"
Cohesion: 0.50
Nodes (3): buildCommand, crons, $schema

### Community 58 - "Homepage Redesign Docs"
Cohesion: 0.67
Nodes (3): Homepage 4-Slide Sales Deck, SlideShell Background Slot (full-bleed fix), Design Re-Shaped: 4-Slide Homepage Plan

### Community 59 - "Toast UX Docs"
Cohesion: 0.67
Nodes (3): Sonner Toast Feedback, Single Mutable Status-String Anti-Pattern, Toast System (sonner) Recommendation

## Knowledge Gaps
- **304 isolated node(s):** `eslintConfig`, `securityHeaders`, `nextConfig`, `name`, `version` (+299 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `errorMessage()` connect `Saved Searches & APIs` to `Property & Offer Actions`, `Contract & Payment Flow`, `Cron Jobs & Email`, `Commission & Sale Terms`, `Contract Document & Receipts`, `KYC Verification`, `Auth API Routes`, `Validation Schemas`, `Support Tickets`, `Listing Reports & Moderation`, `Admin Support Actions`, `Misc Dashboard Actions`, `Reviews & UI Buttons`, `Profile Management`, `Login & 2FA Flow`, `Inquiry Actions`, `2FA Setup`, `Session Revocation`, `Email Verify & Logging`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Dev Dependencies` to `Package Metadata`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Why does `prisma` connect `Dev Dependencies` to `Property & Offer Actions`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `NOTE: This file should not be edited`, `securityHeaders` to the rest of the system?**
  _309 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Property & Offer Actions` be split into smaller, more focused modules?**
  _Cohesion score 0.06572164948453608 - nodes in this community are weakly interconnected._
- **Should `Contract & Payment Flow` be split into smaller, more focused modules?**
  _Cohesion score 0.05742821473158552 - nodes in this community are weakly interconnected._
- **Should `Property Search & Listing UI` be split into smaller, more focused modules?**
  _Cohesion score 0.07562136435748282 - nodes in this community are weakly interconnected._