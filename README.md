# Clavium.ro — Imobiliare fără intermediari

A modern Next.js real estate platform enabling direct property transactions without intermediaries. Features a responsive landing page with integrated authentication system.

## Stack

- **Framework**: Next.js 16 (App Router)
- **React**: 18 with TypeScript
- **Styling**: Tailwind CSS 3.4.1
- **Database**: Prisma ORM + SQLite
- **Authentication**: JWT (jose) + bcryptjs
- **State Management**: Zustand
- **Components**: Lucide React (icons)

## Features

### v0.2 — Major Update (Current)
✅ **Authentication System**
- User registration with multi-step wizard
- Password-based login with email & password
- OTP (One-Time Password) authentication
- JWT token management with secure HTTP-only cookies
- Logout functionality with session clearing
- Auth middleware for protected routes

✅ **User Management**
- Prisma-backed user storage with SQLite
- Password hashing with bcryptjs (10 rounds)
- User session persistence via JWT tokens
- OTP code generation (6-digit) with 10-minute expiration
- User verification and authentication

✅ **UI/UX Improvements**
- Responsive navbar with mobile menu optimization
- Mobile-optimized authentication pages
- Auth-aware navigation (shows username or login/register)
- Multi-step registration form with validation
- Form error handling and user feedback
- Accessible form components (FormField, OtpInput)
- Fixed mobile navbar visibility and blur effects

✅ **Developer Experience**
- Fixed HMR (Hot Module Reload) origin configuration
- NextAuth middleware integration
- API routes with proper error handling
- TypeScript validation schemas (Zod)
- Environment configuration for local development

### v0.1
- Landing page with hero section
- Navigation structure with multiple sections
- Components: How It Works, Transaction Types, Ticker Bar, Signature, CTA
- Tailwind styling with custom design system
- Responsive design
- Scroll reveal animations

## Project Structure

```
clavium/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── login/page.tsx          # Login (password + OTP)
│   │   │   ├── register/page.tsx       # Registration wizard
│   │   │   └── layout.tsx              # Auth layout
│   │   ├── api/auth/
│   │   │   ├── login/route.ts          # Login endpoint
│   │   │   ├── register/route.ts       # Register endpoint
│   │   │   ├── me/route.ts             # Current user endpoint
│   │   │   ├── logout/route.ts         # Logout endpoint
│   │   │   └── otp/
│   │   │       ├── send/route.ts       # OTP request
│   │   │       └── verify/route.ts     # OTP verification
│   │   ├── globals.css                 # Global styles & themes
│   │   ├── layout.tsx                  # Root layout
│   │   └── page.tsx                    # Home page
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx              # Responsive navbar
│   │   │   └── Footer.tsx              # Footer
│   │   ├── sections/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── HowItWorksSection.tsx
│   │   │   ├── SignatureSection.tsx
│   │   │   ├── CtaSection.tsx
│   │   │   ├── TickerBar.tsx
│   │   │   └── TransactionTypesSection.tsx
│   │   └── ui/
│   │       ├── FormField.tsx           # Form input component
│   │       └── OtpInput.tsx            # OTP code input
│   ├── lib/
│   │   ├── auth.ts                     # Auth logic & tokens
│   │   ├── userStore.ts                # Prisma DB operations
│   │   ├── validations.ts              # Schema validation
│   │   └── constants.ts                # Constants
│   ├── types/
│   │   └── index.ts                    # TypeScript types
│   └── middleware.ts                   # Auth middleware
├── prisma/
│   ├── schema.prisma                   # Data models
│   └── dev.db                          # SQLite database
├── public/                             # Static assets
├── .env.local                          # Environment variables
└── next.config.js                      # Next.js config

```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
cd clavium
npm install
```

### Environment Setup

Create `.env.local` in the `clavium` directory:
```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-secret-key-here-minimum-32-characters"
NODE_ENV="development"
```

### Development

```bash
npm run dev
```

Visit `http://localhost:3000`

### Build & Production

```bash
npm run build
npm start
```

## Authentication

### Registration Flow
1. Navigate to `/auth/register`
2. Step 1: Enter name & email
3. Step 2: Set password (min 8 chars, must match confirmation)
4. Step 3: Review account details
5. Step 4: Confirmation — account created
6. Auto-redirects to homepage with authenticated session

### Login (Password)
1. Go to `/auth/login`
2. Select "Parolă" tab
3. Enter email & password
4. Redirects to homepage on success

### Login (OTP)
1. Go to `/auth/login`
2. Select "OTP" tab
3. Click "Trimite cod OTP" to receive 6-digit code
4. Enter code & click "Verifică cod OTP"
5. Redirects to homepage on success

### Logout
- Click "Deconectare" in navbar
- Session cleared, redirected to homepage

## API Endpoints

### Auth Routes
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/register` | Create new user account |
| POST | `/api/auth/login` | Login with email & password |
| GET | `/api/auth/me` | Get current authenticated user |
| POST | `/api/auth/logout` | Clear session & logout |

### OTP Routes
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/otp/send` | Send OTP code to email |
| POST | `/api/auth/otp/verify` | Verify OTP code |

## Database Schema

### User Model
```prisma
model User {
  id        String    @id @default(cuid())
  name      String
  email     String    @unique
  password  String    # bcryptjs hash
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  otps      Otp[]
}
```

### Otp Model
```prisma
model Otp {
  id        String    @id @default(cuid())
  email     String
  code      String
  expiresAt DateTime
  userId    String?
  user      User?     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## Key Technologies

- **Next.js 16**: Server & client components, app router
- **Prisma**: Type-safe ORM with automatic migrations
- **SQLite**: Lightweight embedded database
- **JWT (jose)**: Stateless token-based authentication
- **bcryptjs**: Password hashing & verification
- **Tailwind CSS**: Utility-first styling
- **TypeScript**: Type safety across codebase
- **Zod**: Schema validation

## Development Notes

- HMR is configured to accept `127.0.0.1` and `localhost`
- JWT tokens expire after 2 hours
- OTP codes expire after 10 minutes
- Cookies are HTTP-only and sameSite='lax' for security
- All passwords are hashed before storage
- Email validation is performed on registration/login

## Scripts

```bash
npm run dev      # Start dev server with HMR
npm run build    # Build for production
npm start        # Run production server
npm run lint     # Run ESLint
```

## Git Status

All changes committed as **"Major update v0.2"** with full authentication system integration.
