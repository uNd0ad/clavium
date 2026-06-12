# Clavium.ro — Imobiliare fără intermediari

**Clavium** is a Romanian-language real estate platform that lets property owners and tenants transact **directly, without intermediaries**: discover properties, negotiate through offers, sign rental contracts online (with QES — qualified electronic signature), and handle rent payments — all in one place.

Version: **0.4.0** · See [CHANGELOG.md](CHANGELOG.md) for release history.

## What the platform does

The product connects three kinds of users around a rental lifecycle:

```
Property listed → Offer sent → Offer accepted → Contract drafted
   → Signed by both parties (QES) → Contract active → Rent payments tracked
```

- A **Client** (chiriaș) finds a property, sends an offer with the amount they're willing to pay, signs the contract when the owner accepts, and pays rent through the platform.
- An **Owner** (proprietar) lists properties, receives and answers offers, countersigns contracts, and tracks rent income and commissions.
- An **Admin** oversees the whole platform: all properties, contracts, payments, and users.

## User roles

| Role | Who | What they see in the dashboard |
|--------|--------------------------|----------------------------------------------------------------|
| `CLIENT` | Tenant / property seeker | Own offers, own contracts, saved properties, payments made |
| `OWNER` | Property owner | Own properties, received offers, contracts, rent income, fees |
| `ADMIN` | Platform operator | Everything, platform-wide |

Role choice happens at registration (Client or Proprietar). `ADMIN` cannot be self-assigned — it is rejected server-side and must be granted manually in the database. Role definitions and permissions live in [src/lib/types/roles.ts](src/lib/types/roles.ts); details in [src/lib/RBAC.md](src/lib/RBAC.md).

## How it's intended to be used

### 1. Landing page (`/`)
Public marketing page: hero, how-it-works, transaction types, QES signature explanation, and calls to action leading to registration.

### 2. Registration (`/auth/register`)
A four-step wizard:
1. **Informații cont** — pick account type (Client / Proprietar), name, email
2. **Parolă** — minimum 8 characters, confirmed
3. **Verificare telefon** — enter a Romanian mobile number (`07XX...`), receive a 6-digit OTP by SMS, verify it. Registration is refused server-side if the phone was not verified.
4. **Finalizare** — review the summary and create the account

On success a confirmation screen counts down 5 seconds, then redirects to the dashboard (already logged in via session cookie).

### 3. Login (`/auth/login`)
Two methods, selectable by tab:
- **Parolă** — email + password
- **OTP** — a 6-digit code tied to the email (no email service is connected yet, so in development the code is printed in the server console)

Logged-in users who visit `/auth/*` are redirected away; anonymous visitors to `/dashboard/*` are redirected to login (see [src/proxy.ts](src/proxy.ts)).

### 4. Dashboard (`/dashboard`)
Server-rendered, role-aware, fed entirely from the database:

| Page | Content |
|----------------------------|------------------------------------------------------------------------------|
| `/dashboard` | Stats (monthly income / payments, active contracts, new offers, properties), alerts computed from real state (missing signatures, failed payments), recent activity |
| `/dashboard/oferte` | Offers sent and received, with amount and status (Trimisă / Acceptată / Respinsă) |
| `/dashboard/contracte` | Contracts with per-party signature status (owner / client) and QES indicator |
| `/dashboard/proprietati` | Owned properties and saved properties — **owners/admins only** |
| `/dashboard/plati` | Payment summary (income, pending, fees) and transaction history — **owners/admins only** |
| `/dashboard/profil` | Personal data, notifications, danger zone |

Clients navigating to owner-only pages are redirected back to the overview.

## Tech stack

| Layer | Technology |
|---------------|---------------------------------------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS 3.4, lucide-react |
| Database | SQLite via Prisma ORM |
| Auth | JWT (jose, HS256, 2h) in an HTTP-only cookie; bcryptjs password hashing |
| Validation | Zod (Romanian error messages) |
| SMS | SMSO.ro API (pluggable; console fallback in dev) |
| State (client)| Zustand |

## Getting started

### Prerequisites
- Node.js 18+

### Setup

```bash
cd clavium
npm install
npx prisma migrate dev   # create/update the SQLite database
npm run db:seed          # optional: demo data (see below)
npm run dev              # http://localhost:3000
```

### Environment (`.env`)

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="<random secret, 32+ chars in production>"

# SMS via SMSO.ro — leave unset in dev to print OTP codes to the console
SMS_API_URL="https://app.smso.ro/api/v1/"
SMS_API_KEY="<your SMSO API key>"
SMS_SENDER_ID="<numeric sender id from GET /api/v1/senders>"
```

### Demo accounts (after `npm run db:seed`)

| Email | Role | Password |
|---------------------|--------|------------|
| `admin@clavium.ro` | ADMIN | `parola123` |
| `owner@clavium.ro` | OWNER | `parola123` |
| `client@clavium.ro` | CLIENT | `parola123` |

The seed links them with demo properties, offers, an active contract, payments, and notifications, so every dashboard page has content.

## Project structure

```
clavium/
├── prisma/
│   ├── schema.prisma            # User, Otp, PhoneOtp, Property, SavedProperty,
│   │                            #   Offer, Contract, Payment, Notification
│   ├── migrations/
│   └── seed.js                  # demo data (npm run db:seed)
├── src/
│   ├── proxy.ts                 # route protection (auth redirects)
│   ├── app/
│   │   ├── page.tsx             # landing page
│   │   ├── template.tsx         # page-transition animation wrapper
│   │   ├── auth/                # login + registration wizard
│   │   ├── dashboard/           # overview, oferte, contracte, proprietati,
│   │   │                        #   plati, profil (all server-rendered from DB)
│   │   └── api/auth/            # login, register, logout, me,
│   │                            #   otp/* (email), phone-otp/* (SMS)
│   ├── components/
│   │   ├── layout/              # Navbar, Footer
│   │   ├── sections/            # landing page sections
│   │   ├── dashboard/           # Sidebar, MobileTopBar, StatusBadge
│   │   └── ui/                  # FormField, OtpInput
│   └── lib/
│       ├── auth.ts              # tokens, login/register, OTP logic
│       ├── session.ts           # getCurrentUser() for server components
│       ├── dashboardData.ts     # role-aware dashboard queries
│       ├── userStore.ts         # Prisma data access
│       ├── sms.ts               # SMSO.ro integration / dev fallback
│       ├── validations.ts       # Zod schemas
│       └── rbac.ts              # role/permission checks
└── CHANGELOG.md
```

## API endpoints

| Method | Endpoint | Purpose |
|--------|----------------------------|--------------------------------------------------|
| POST | `/api/auth/register` | Create account (requires verified phone) |
| POST | `/api/auth/login` | Login with email & password |
| GET | `/api/auth/me` | Current authenticated user |
| POST | `/api/auth/logout` | Clear session |
| POST | `/api/auth/otp/send` | Send email OTP (dev: printed in server console) |
| POST | `/api/auth/otp/verify` | Verify email OTP and log in |
| POST | `/api/auth/phone-otp/send` | Send SMS OTP for phone verification |
| POST | `/api/auth/phone-otp/verify` | Verify SMS OTP (valid 30 min for registration) |
| POST | `/api/auth/verify-email/send` | Resend email verification link |
| GET | `/api/auth/verify-email/confirm` | Confirm email via token link |
| POST | `/api/auth/reset/request` | Request password reset email |
| POST | `/api/auth/reset/confirm` | Set new password via reset token |
| POST | `/api/properties` | Create property (OWNER/ADMIN) |
| PATCH | `/api/properties/[id]` | Update property / toggle listing status |
| POST | `/api/properties/[id]/save` | Toggle saved property |
| POST | `/api/offers` | Send offer (CLIENT) |
| PATCH | `/api/offers/[id]` | Accept/reject offer (OWNER) — accept creates the contract |
| POST | `/api/contracts/[id]/sign` | Sign contract (QES); both signatures activate it |
| POST | `/api/contracts/[id]/pay` | Pay due rent (tenant); records commission, schedules next |
| POST | `/api/notifications/read` | Mark notifications as read |
| PATCH/DELETE | `/api/profile` | Update profile / deactivate account |
| POST | `/api/profile/password` | Change password (revokes other sessions) |
| GET | `/api/profile/export` | GDPR data export (JSON download) |
| PATCH | `/api/admin/users/[id]` | Change role / activate-deactivate user (ADMIN) |

All endpoints return `{ error: "<human-readable message>" }` with status 400 on failure.
Auth and OTP endpoints are rate limited (429 on abuse).

## Security notes

- Passwords hashed with bcryptjs (10 rounds); JWT expires after 2 hours; cookie is HTTP-only, `sameSite=lax`, `secure` in production.
- `/dashboard` access verifies the JWT **and** the user in the database — a forged cookie is rejected.
- OTP codes (email and SMS) expire after 10 minutes; phone verification stays valid 30 minutes to finish the registration form.
- Public registration can only create `CLIENT` or `OWNER` accounts.
- Keep `.env` out of version control (already gitignored) — it holds the JWT secret and the SMSO API key.

## Scripts

```bash
npm run dev        # dev server with HMR
npm run build      # production build
npm start          # run production server
npm run db:seed    # populate demo data
npm run db:push    # push schema without a migration
npx prisma studio  # browse the database
```

## Roadmap / not yet implemented

The full production roadmap with current status lives in [TODO.md](TODO.md). As of v0.4.0 the
marketplace flows (browsing, offers, contracts, signing, rent payments), security hardening, and
the legal/GDPR layer are implemented. What remains is connecting real external providers
(payments — Stripe/Netopia, QES — eIDAS provider, email — Resend/SendGrid, all pluggable in
`src/lib/`), migrating SQLite → PostgreSQL, file storage for photos, monitoring, and E2E tests.
