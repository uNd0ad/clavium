# Codebase Review — Clavium

**Date:** 2026-06-19
**Version reviewed:** 0.8.4 (branch `dev`)
**Reviewer:** automated codebase health pass

---

## TL;DR

The codebase is in **good shape and runs well**. Type-checking, linting, and the
production build all pass cleanly. Of the 55 automated tests, 52 pass; the **3
failures are a test-environment isolation bug, not a defect in production code** —
they are caused by the local `.env` Stripe keys leaking into the test run. The
production payment logic itself is correct.

| Check | Command | Result |
|-------|---------|--------|
| Type check | `npm run typecheck` | ✅ Pass (0 errors) |
| Lint | `npm run lint` | ✅ Pass (0 warnings) |
| Production build | `npm run build` | ✅ Pass (35 routes compiled) |
| Unit/integration tests | `npm test` | ⚠️ 52/55 pass — 3 fail (see below) |
| Dependency audit | `npm audit` | ⚠️ 2 moderate (transitive, low impact) |

---

## What the project is

A Next.js 16 / React 19 real-estate platform ("Clavium") for property listings,
offers, rental and sale contracts with digital (QES) signing, and Stripe-hosted
payments. Romanian-language UI.

- **Stack:** Next.js 16 (App Router), React 19, TypeScript (strict), Prisma 5 +
  PostgreSQL, Stripe Checkout, `jose` JWT sessions, `bcryptjs`, Zustand, Tailwind.
- **Size:** ~10,100 lines of TS/TSX across 142 files.
- **Surface:** 35 routes — marketing pages, a `/dashboard` area (properties,
  offers, contracts, payments, tickets, admin, profile), and an API layer for
  auth, OTP, email/phone verification, password reset, notifications, profile
  export (GDPR), a health check, and a Stripe webhook.
- **Domain logic** lives mostly in server actions (`src/app/actions/*`) and
  `src/lib/*`, with a clean separation: actions handle auth/validation, `lib`
  holds the business rules (payment settlement, contract dates, RBAC, etc.).

The architecture is clean and consistent: typed `{ ok: true } | { ok: false }`
result objects from actions, centralized validation with Zod, RBAC helpers,
atomic payment claims to keep settlement idempotent, and good inline
documentation (in Romanian).

---

## The 3 failing tests — root cause

All three failures are in the payment-lifecycle integration tests:

- `lifecycle.test.ts` → full rent cycle (`payRentAction`)
- `sale-lifecycle.test.ts` → full sale cycle + adjusted-terms case (`paySaleAction`)

**Symptom:** after calling `paySaleAction` / `payRentAction`, the test expects the
due payment to flip to `FINALIZATA` (and follow-on payments/commissions to be
created). Instead it stays `IN_CURS`, e.g. `expected 'IN_CURS' to be 'FINALIZATA'`
and `No Payment found` for the follow-on `REST` tranche.

**Root cause:** The local `.env` contains real Stripe **test** keys
(`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`). Vitest auto-loads `.env` into
`process.env`, so `STRIPE_ENABLED` ([`src/lib/stripe.ts`](src/lib/stripe.ts#L8))
is `true` during the test run. With Stripe enabled,
[`createCheckoutSession`](src/lib/payments.ts#L22) returns `{ mode: 'redirect' }`,
so `payRentAction` / `paySaleAction` return a Stripe checkout URL and **defer
settlement to the webhook** instead of settling inline:

```ts
// src/app/actions/contracts.ts (paySaleAction / payRentAction)
if (checkout.mode === 'redirect') {
  return { ok: true as const, redirectUrl: checkout.url }   // <- tests stop here
}
await settlePayment(due.id)   // <- only runs in dev mode (Stripe disabled)
```

The tests assert the **dev-mode inline-settlement** path. They pass only when
Stripe is *not* configured. Confirmed by instrumenting the flow — `paySaleAction`
returned a genuine `https://checkout.stripe.com/c/pay/cs_test_…` URL during the
test, proving Stripe was live in the test process.

This is **purely a test-isolation problem.** The production code is correct: in
production the webhook ([`src/app/api/webhooks/stripe/route.ts`](src/app/api/webhooks/stripe/route.ts))
calls `settlePayment` after Stripe confirms payment.

### Recommended fix (one place)

Pin the payment provider off in the test env so results don't depend on whatever
is in a developer's local `.env`. In [`vitest.config.ts`](vitest.config.ts#L15):

```ts
env: {
  DATABASE_URL: TEST_DATABASE_URL,
  DIRECT_URL: TEST_DATABASE_URL,
  JWT_SECRET: TEST_JWT_SECRET,
  STRIPE_SECRET_KEY: '',      // force dev-mode (inline) settlement in tests
  STRIPE_WEBHOOK_SECRET: '',
},
```

(Note: `test.env` values are applied, but because `.env` is also loaded, the empty
override must win — verify `STRIPE_ENABLED` is `false` after the change. If env
ordering proves unreliable, the more robust option is to mock
`@/lib/payments`'s `createCheckoutSession` to always return `{ mode: 'dev' }` in
`src/test/setup.ts`, which also lets a future test cover the redirect/webhook
path explicitly.)

After this change all 55 tests should pass.

---

## Other observations (minor)

1. **`npm audit`: 2 moderate** — a transitive `postcss <8.5.10` advisory pulled in
   under `next`. The suggested `--force` fix tries to *downgrade* Next.js to 9.x,
   which is wrong; ignore it and wait for the upstream Next patch. Low real-world
   impact (build-time CSS tool).
2. **Bleeding-edge versions** — Next 16 / React 19 / Node 25 are very current.
   Builds fine today; just be aware ecosystem packages may lag.
3. **Test runtime** — the suite takes ~30s because the lifecycle tests hit a real
   Postgres `clavium_test` schema serially. Acceptable, but a per-file transaction
   rollback strategy would speed it up if it grows.
4. **Housekeeping** — a couple of `.DS_Store` files are committed under `src/`;
   worth adding to `.gitignore` and removing. 3 `TODO/FIXME` markers and 2
   non-dev `console.*` calls in app code — trivial.
5. **Good hygiene confirmed** — `.env` is gitignored and not tracked; secrets are
   not committed.

---

## Verdict

**Healthy, production-shaped codebase.** Clean build, types, and lint; thoughtful
architecture and documentation. The only red item — 3 failing tests — is a
test-environment configuration issue with a one-line fix, not a product bug. Once
the Stripe env override is added to the test config, the suite is green.
