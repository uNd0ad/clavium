# Production-Readiness Audit — Clavium

**Date:** 2026-06-20
**Branch reviewed:** `dev` (v0.9.3)
**Scope:** pre-launch checklist. No code changed for this pass — this is the audit
that decides what to action next.

---

## TL;DR

The codebase is **healthy and well-architected**: typecheck + lint clean, 64/64
tests pass, production build compiles, strong security fundamentals. **Nothing here
is a code-quality problem.** What stands between this and a real launch is
**integration wiring and deploy configuration** — and the single biggest risk is
that unconfigured delivery providers (email/SMS) *silently no-op* instead of
failing loudly, which would lock users out without any error.

| Area | State |
|------|-------|
| Type check / lint / build | ✅ clean |
| Tests | ✅ 64/64 pass |
| Auth/session security | ✅ strong (see below) |
| Delivery providers (email/SMS) | ⛔ **silent no-op in prod if unconfigured** |
| Rate limiting | ⚠️ in-memory — weak on serverless/multi-instance |
| Observability | ⚠️ none wired (Sentry is a TODO) |
| KYC / QES | ⚠️ dev/simulated mode without provider keys |

---

## What's already solid (verified, not assumed)

- **Rate limiting on every auth endpoint** — login, register, OTP send/verify,
  phone-OTP send/verify, password reset, email verify, change-password — keyed by
  both identity and IP ([`src/lib/rateLimit.ts`](src/lib/rateLimit.ts), applied across `src/app/api/auth/*`).
- **DB-backed sessions** with expiry + revocation ([`src/lib/auth.ts`](src/lib/auth.ts)); JWT via `jose`.
- **Email/reset tokens** stored hashed (`sha256`), single-use (`usedAt`), with expiry.
- **Cookies**: `httpOnly`, `secure` in production, `sameSite: lax`.
- **Stripe webhook** signature-verified (`stripe.webhooks.constructEvent`); invalid
  signatures rejected and logged.
- **Security headers** in [`next.config.js`](next.config.js): X-Frame-Options DENY, nosniff,
  Referrer-Policy, Permissions-Policy (camera self-only for KYC), HSTS in prod.
- **Per-request nonce CSP** with `strict-dynamic` + `upgrade-insecure-requests` ([`src/proxy.ts`](src/proxy.ts)).
- **Secrets** gitignored; KYC documents stored under gitignored `private/`.

---

## P0 — Launch blockers

### 1. Delivery providers silently no-op in production
[`src/lib/email.ts`](src/lib/email.ts) and [`src/lib/sms.ts`](src/lib/sms.ts) fall back to
`console.log` when their env vars are missing/placeholder — **with no error**. Deploy
to prod without them and:
- password-reset emails never arrive,
- email-verification links never arrive,
- phone-OTP codes never arrive → **users cannot complete signup/login**.

**Action:** (a) configure the providers (see env checklist), and (b) make the
fallback *fail loudly* in production instead of silently logging — i.e. throw if
`NODE_ENV === 'production'` and provider env is absent, so a misconfigured deploy
fails fast instead of locking out users.

### 2. Rate limiting is in-memory → ineffective on serverless
[`src/lib/rateLimit.ts`](src/lib/rateLimit.ts) uses an in-process `Map`. On Vercel
(serverless / horizontally scaled) each instance has its own bucket and cold starts
reset them, so brute-force and OTP-flood protection is far weaker than it looks. The
file already anticipates this ("la scalare orizontală se înlocuiește cu Redis/Upstash").

**Action:** back it with Upstash Redis (Vercel-native) behind the **same**
`rateLimit()` signature — no call-site changes needed.

### 3. Stripe is on test keys
`.env` carries `sk_test_…` / `whsec_…`. Real payments require live keys **and** a
production webhook endpoint registered in the Stripe dashboard with its own signing
secret. *(You marked Stripe out of scope for this pass — listed here for completeness;
treat as your call.)*

---

## P1 — Hardening before launch

### 4. `CSP_DISABLED` footgun
[`src/proxy.ts`](src/proxy.ts) turns CSP off entirely when `CSP_DISABLED=1`. This exists
for local HTTP phone-testing, but if it ever leaks into the Vercel prod environment,
CSP silently disappears.
**Action:** verify `CSP_DISABLED` is **not** set in the Vercel production env; optionally
guard it in code so it's ignored on the real host.

### 5. No fail-fast env validation
There's no boot-time check that required secrets exist and aren't placeholders.
**Action:** add a Zod-validated env module that throws at startup in production if
`JWT_SECRET` / `DATABASE_URL` (and the chosen provider keys) are missing or default.

### 6. No observability
[`src/lib/logger.ts`](src/lib/logger.ts) has a Sentry/APM TODO but nothing is wired. Without
it, the silent-failure classes above are invisible in production.
**Action:** wire Sentry (or equivalent) via `captureException`; alert on auth/payment errors.

### 7. QES signing runs simulated without a provider
**KYC — decided: in-house.** Identity verification stays self-hosted (browser face-api
capture of ID + selfie, server-side threshold match in [`src/lib/kyc.ts`](src/lib/kyc.ts)).
No third-party provider; no `KYC_API_KEY` needed. Production-functional as-is — not a gap.

**QES — still open.** [`src/lib/qes.ts`](src/lib/qes.ts) marks signatures as QES but
signing is *simulated* until `QES_API_KEY` is set. For legally-binding rental/sale
contracts, a real eIDAS **QES** provider (certSIGN/Namirial/DocuSign EU Qualified) is
likely a compliance requirement before launch — the more sensitive of the two.
**Action:** decide whether QES launches simulated or with a real provider; if real, set
`QES_API_KEY`/`QES_PROVIDER` (the call sites already support it without changes).

---

## P2 — Hygiene

- **npm audit:** 2 moderate, transitive `postcss <8.5.10` under `next` (build-time CSS
  tool). The `--force` "fix" downgrades Next to 9.x — **do not run it**; wait for upstream.
- **Dev-only conveniences** (`CSP_DISABLED`, `start:lan`) live on `dev` — ensure prod
  deploys from `main` without them.
- **CODEBASE-REVIEW.md** is now committed and public on GitHub; remove if not intended.

---

## Pre-launch env checklist (Vercel production)

| Var | Purpose | Notes |
|-----|---------|-------|
| `DATABASE_URL` / `DIRECT_URL` | Neon prod | not the dev DB |
| `JWT_SECRET` | session signing | strong, unique — not the dev value |
| `APP_URL` | absolute URLs / redirects | real `https://` domain |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | email delivery (SMTP) | **required** (P0 #1); `SMTP_FROM`/`SMTP_SECURE` optional |
| `SMS_API_URL` / `SMS_API_KEY` / `SMS_SENDER_ID` | OTP delivery | **required** (P0 #1) |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | payments | live keys + live webhook (P0 #3) |
| `KYC_API_KEY` / `KYC_PROVIDER` | identity verification | if real KYC (P1 #7) |
| `QES_API_KEY` / `QES_PROVIDER` | qualified signing | if real QES (P1 #7) |
| `UPSTASH_REDIS_*` | shared rate limiting | if adopting P0 #2 |
| `SENTRY_DSN` | error monitoring | if adopting P1 #6 |
| `CSP_DISABLED` | **must be UNSET** | never in prod (P1 #4) |

---

## Recommended order of work

1. **P0 #1** — fail-fast provider guard + configure email/SMS (highest user impact, low effort).
2. **P0 #2** — Upstash-backed rate limiting (security, drop-in).
3. **P1 #5 + #4** — env validation + CSP_DISABLED guard (cheap, prevents silent misconfig).
4. **P1 #6** — Sentry (so the rest is observable).
5. **P1 #7** — KYC/QES providers (compliance; needs vendor selection).
6. **P0 #3** — Stripe live (when you're ready to take real money).
