import { test, expect } from '@playwright/test'

// Calea banilor, capăt-la-capăt: înregistrare → verificare → ofertă → semnare (QES) → plată
// (decontare „mod dev") → contract ACTIV/ÎNCHEIAT. E plasa de regresie pentru tot ce ține de bani.
//
// Marcat `skip` deoarece necesită fixture-uri de mediu pe care le configurezi în CI:
//   1. O bază de date de test izolată (resetată între rulări).
//   2. Bypass pentru OTP telefon + verificare email (ex. un endpoint de test sau coduri fixe în
//      mod dev), ca să nu depindă de SMS/email reale.
//   3. Două conturi: proprietar (OWNER) + chiriaș (CLIENT).
//   4. Un certificat QES de test pentru fluxul de semnare.
//   5. STRIPE neconfigurat → plățile se decontează instant în „mod dev" (vezi lib/payments.ts).
//
// Pașii de mai jos descriu fluxul; deblochează-i pe rând pe măsură ce adaugi fixture-urile.
test.describe('calea banilor (capăt-la-capăt)', () => {
  test.skip('proprietar listează → chiriaș oferă → ambii semnează → plată → contract activ', async ({ page }) => {
    // 1. OWNER se înregistrează și creează o listare.
    // 2. CLIENT se înregistrează, deschide listarea și trimite o ofertă.
    // 3. OWNER acceptă oferta → se creează contractul (IN_ASTEPTARE).
    // 4. Ambele părți semnează (QES) → contractul devine SEMNAT/ACTIV.
    // 5. CLIENT plătește chiria → în mod dev se decontează instant (FINALIZATA).
    // 6. Se verifică: contractul e ACTIV, plata e FINALIZATA, comisionul e înregistrat,
    //    iar chitanța PDF e descărcabilă din /dashboard/plati.
    await page.goto('/')
    expect(true).toBe(true)
  })

  test.skip('webhook Stripe decontează plata și e idempotent la reluare', async ({ request }) => {
    // Cu STRIPE configurat: POST semnat către /api/webhooks/stripe cu checkout.session.completed
    // → plata trece în FINALIZATA; reluarea aceluiași eveniment NU dublează decontarea.
    expect(request).toBeTruthy()
  })
})
