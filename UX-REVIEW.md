# Vatrio — UX Review & Ideas

An honest, opinionated assessment of why the app currently feels "rough, unedged and messy,"
and a prioritized set of ideas to make it smooth and natural. Grounded in the actual codebase
(file references + measured patterns), not generic advice.

> TL;DR — The **visuals** are actually fine and improving (design tokens, the recent homepage
> design pass, empty states, role-aware nav). What makes it feel rough is the **interaction
> layer**: how the app talks back to the user (feedback), how it waits (loading), and how
> consistent the small decisions are (radius/type/spacing). Fixing the feedback model is ~70%
> of the perceived-quality win.

---

## 1. The root causes (why it feels rough)

These are systemic patterns repeated everywhere, so they drag down *every* screen at once.

### 1.1 Feedback is a single mutable string — the biggest offender
7 forms use the same pattern: one `status` state that holds errors, loading text, **and** success
messages, rendered as a permanent grey box. Examples: [login](src/app/auth/login/page.tsx),
[register](src/app/auth/register/page.tsx), [ProfileForms](src/components/dashboard/ProfileForms.tsx),
[PropertyForm](src/components/dashboard/PropertyForm.tsx).

Why it feels rough:
- Success and error look identical (same grey box) — no color, no icon, no severity.
- The message is **permanent** — it sits there forever; nothing auto-dismisses.
- It's the *only* feedback; there's no transient confirmation that an action landed.
- It reads like a debug log, not a product.

**Fix: a toast system.** Add `sonner` (tiny, headless, looks great). Replace every `setStatus(...)`
success/error with `toast.success(...)` / `toast.error(...)`. Keep inline text only for
*persistent* states (e.g. "phone verified ✓" on the register step). This single change makes the
whole app feel modern.

### 1.2 Every action triggers a full server refetch — no optimism
11 `router.refresh()` calls across 8 components ([actions.tsx](src/components/dashboard/actions.tsx),
[ListingActions](src/components/properties/ListingActions.tsx),
[AdminUsersTable](src/components/dashboard/AdminUsersTable.tsx), etc.). After accepting an offer,
signing, paying, saving a property — the UI disables a button, waits for the round-trip, then
refetches the **entire page**. It works, but it feels heavy and laggy: nothing moves until the
server answers.

**Fix: optimistic UI with React 19's `useOptimistic`.** You're on React 19 + Next 16 but using
none of the modern primitives (measured: 0 uses of `useOptimistic` / `useActionState` /
`useFormStatus` / Server Actions). The save toggle, mark-as-read, offer accept/reject, and admin
role changes should update instantly and reconcile in the background.

### 1.3 Inconsistent micro-decisions (the "unedged" feel)
- **Border radius:** 8 different values in use — `rounded-[24px]` (43×), `rounded-[32px]` (36×),
  `rounded-full` (33×), `rounded-[18px]` (9×), `rounded-3xl` (8×), plus `xl`/`2xl`/`[28px]`. There's
  no radius scale; cards, inputs and pills don't agree.
- **Type scale:** 10+ ad-hoc pixel sizes (`text-[13px]` 39×, `text-[12px]` 28×, `text-[14px]` 24×,
  `text-[15px]`, `text-[11px]`, `text-[10px]`…). No semantic scale = subtly mismatched text everywhere.
- **Spacing & buttons** are similarly ad-hoc; `.btn-primary`/`.btn-outline` are ALL-CAPS with wide
  tracking, which reads loud/dated on dense dashboard screens.

**Fix: a tiny design system.** Define 3–4 radii, a 6-step type scale, and a spacing rhythm as
Tailwind theme tokens, then sweep the codebase to use them. Tedious but it's what separates
"template" from "product."

### 1.4 Native browser dialogs
Account deactivation uses `window.confirm(...)` ([ProfileForms.tsx:76](src/components/dashboard/ProfileForms.tsx)).
It's jarring, unstyleable, and breaks the visual language right at a high-stakes moment.

**Fix:** a styled confirm `Dialog` primitive (Radix Dialog or a 30-line custom modal), reused for
all destructive confirmations.

---

## 2. Forms (where users spend the most effort)

- **No client-side validation.** Zod runs only on the server, so users submit, round-trip, then get a
  generic error in the grey box. Field-level errors should appear *as they type/blur*.
  `FormField` already has an `error` prop ([FormField.tsx](src/components/ui/FormField.tsx)) — it's
  barely used. Adopt **react-hook-form + the existing Zod schemas** ([validations.ts](src/lib/validations.ts))
  via `zodResolver` so client and server validate identically.
- **OTP can't be pasted.** [OtpInput](src/components/ui/OtpInput.tsx) has no `onPaste` handler — a user
  copying the 6-digit SMS/email code can only fill one box. Add paste-to-fill and
  `autoComplete="one-time-code"` (iOS/Android autofill). High-impact, tiny fix.
- **No resend cooldown.** OTP "resend" buttons can be spammed (the server rate-limits, but the UI
  doesn't show a countdown) — add a visible "retrimite în 0:30" timer.
- **Register wizard** is decent but: no autofocus per step, no inline "passwords don't match" until
  submit, the step bar doesn't let you jump back to a completed step, and there's no progress
  persistence (refresh = lose everything).
- **Password fields**: no show/hide toggle, no strength hint.
- **Number inputs** for rent/amount have no currency affordance, no thousands formatting while typing.

---

## 3. Loading & perceived performance

- **Only one skeleton exists** ([dashboard/loading.tsx](src/app/dashboard/loading.tsx)). Per-section
  data should have its own skeletons via `<Suspense>` boundaries so the shell paints instantly and
  cards fill in — instead of the whole page waiting.
- **No navigation progress.** Add a top progress bar (e.g. `nprogress`-style) so clicks feel
  acknowledged immediately.
- **Button pending states** are text swaps ("Se trimite…"). Add a spinner icon + keep layout stable
  (don't let the label width jump). A shared `<Button loading>` component solves this everywhere.
- **Optimistic mutations** (see 1.2) remove most of the perceived latency.

---

## 4. Flow & guidance (the "natural" part)

The data model is solid but the app doesn't *guide*. After a user does X, what's next is unclear.

- **Guided next steps.** When an offer is accepted, the new contract just appears in a list — tell the
  owner/tenant "Contract creat — semnează acum" with a direct action. After signing, prompt the next
  party. After a contract goes active, surface "prima chirie scadentă în X zile."
- **Empty states with a CTA.** They exist but are passive text ("Nu ai nicio proprietate încă."). Add
  the action: a "+ Adaugă proprietate" button right in the empty state; for clients, "Caută
  proprietăți →".
- **Onboarding.** A first-login checklist ("verifică emailul · completează profilul · adaugă prima
  proprietate") would orient new users instead of dropping them on an empty dashboard.
- **Context/orientation.** No breadcrumbs or back affordance on detail pages; the dashboard doesn't
  show *which* role-context you're in beyond the sidebar.
- **The "Tip utilizator" sidebar card** is filler noise — replace with something useful (unread
  summary, next action, or remove).

---

## 5. Search & listings

[/proprietati](src/app/proprietati/page.tsx) and [/dashboard/cauta](src/app/dashboard/cauta/page.tsx)
use a GET form that **full-reloads** on every filter.

- Make filtering feel instant: update the URL with `useRouter`/`nuqs` + debounce, or client-filter an
  already-loaded set. At minimum, show a **result count** ("12 proprietăți") and a **"Resetează
  filtrele"** link.
- No **pagination / infinite scroll** (currently `take: 60` hard cap — silently drops the rest).
- No **sort affordance** beyond the dropdown; no **saved-search**; no **map view** (the homepage
  markets "hartă clară" but there's no map anywhere).
- Filter inputs have no loading state, so a slow query looks frozen.

---

## 6. Property photos

[PhotoManager](src/components/dashboard/PhotoManager.tsx) works but is bare:
- No **drag-and-drop** upload, no **reorder** (first photo = cover, but you can't choose it).
- No **per-file progress** or thumbnail-before-upload; large uploads look frozen.
- Detail page gallery ([proprietati/[id]](src/app/proprietati/[id]/page.tsx)) has no **lightbox** /
  full-screen viewer or swipe on mobile.
- No client-side image **compression/resize** before upload (5 MB originals are heavy).

---

## 7. Micro-interactions & motion

- Hover/active states are inconsistent; many interactive elements have no `:active` feedback and no
  consistent `focus-visible` ring (keyboard users can't see where they are).
- The page-transition fade ([template.tsx](src/app/template.tsx)) is nice — extend the same care to
  list items (stagger-in), toasts, and modal enter/exit.
- Buttons don't give tactile feedback (a subtle scale on press goes a long way).
- Respect `prefers-reduced-motion` (already partly done in globals.css — keep it).

---

## 8. Accessibility (also makes it feel "finished")

- **Feedback isn't announced.** The status box isn't an `aria-live` region, so screen readers miss
  errors. Toasts (sonner) handle this for free.
- **Focus management:** wizard steps and modals don't move focus; after closing a dialog focus is
  lost.
- **Color contrast:** `--muted` (#6b6b74) on `--surface` is borderline for small text; verify against
  WCAG AA.
- **Forms:** inputs rely on placeholder-as-label in places; ensure every field has a real
  `<label htmlFor>` and errors are tied via `aria-describedby`.
- Run axe / Lighthouse and fix the top issues — quick credibility win.

---

## 9. Mobile

- Dashboard cards stack OK, but **wide content** (admin user rows, payment/transaction rows) will
  overflow on small screens — needs responsive card layouts or horizontal scroll containers.
- **Touch targets:** some pills/badges and icon buttons are below the 44px comfortable minimum.
- Consider a **bottom tab bar** on mobile instead of the hamburger drawer for the 3–4 primary
  destinations — far more reachable.

---

## 10. Content & microcopy

- Tone is mostly good Romanian, but inconsistent (some messages technical, some friendly). Pick a
  voice and align.
- Error messages should be **actionable** ("Parola trebuie să aibă cel puțin 8 caractere" ✓ good;
  "A apărut o eroare." ✗ vague — say what to do next).
- Numbers/dates are well-formatted (`formatRon`, relative times) — keep that consistency everywhere.

---

## Prioritized roadmap

Ordered by **impact ÷ effort**. The first three deliver the biggest "smooth and natural" jump.

### Quick wins (hours each, do first)
1. **Toasts (sonner)** — replace status-string success/errors. *Transforms perceived quality.*
2. **OtpInput paste + `one-time-code` autofill** — removes a real point of friction.
3. **Styled confirm Dialog** — kill `window.confirm`.
4. **Shared `<Button loading>`** with spinner — consistent pending states everywhere.
5. **Empty states get CTAs** — turn dead-ends into next actions.
6. **`focus-visible` ring + `:active` press states** as global utilities.

### Medium (1–3 days each)
7. **Optimistic UI** (`useOptimistic`) for save/mark-read/offer actions — kills perceived lag.
8. **react-hook-form + Zod** client validation with inline field errors (reuse `validations.ts`).
9. **Design tokens**: radius scale (3–4 values), type scale (6 steps), spacing rhythm; sweep the
   arbitrary values.
10. **Per-section `<Suspense>` skeletons** + navigation progress bar.
11. **Search UX**: result count, reset filters, debounced URL filtering, pagination.

### Larger investments (worth it for production)
12. ~~**Migrate forms/mutations to Next Server Actions**~~ — ✅ **Done (v0.6.0).** Mutations moved to
    `src/app/actions/`, clients call them via `useTransition`, `router.refresh` → `revalidatePath`,
    12 API routes removed. Toasts + optimistic updates preserved.
13. **Guided flows / onboarding** (next-step prompts after offer→contract→sign→pay).
14. **Photo UX**: drag-drop, reorder, progress, client-side resize, lightbox.
15. **Component library adoption** (shadcn/ui on Radix) so dialogs, dropdowns, tooltips, tabs are
    accessible and consistent out of the box — instead of hand-rolling each.
16. **Dark mode** (tokens already make this feasible) — increasingly expected.

---

## Suggested dependencies (all small, well-maintained)
- `sonner` — toasts
- `react-hook-form` + `@hookform/resolvers` — forms (pairs with existing Zod)
- `@radix-ui/react-dialog` (or `shadcn/ui`) — accessible dialog/dropdown/tooltip primitives
- `nuqs` — URL-synced filter state for search

> None of this is implemented yet — this file is the opinion/idea backlog you asked for. Pick the
> quick wins for an immediate feel upgrade, then decide whether the Server Actions migration (#12)
> is worth doing before more features land (it's cheaper to do sooner than later).
