import { test, expect } from '@playwright/test'

// Smoke pe suprafața publică (indexabilă, fără autentificare). Emulăm „mișcare redusă", care prin
// globals.css forțează conținutul `.reveal` vizibil imediat — deci slide-urile de sub fold sunt
// verificabile fără scroll.
test.describe('pagini publice', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
  })

  test('homepage: cele 4 slide-uri se randează', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Clavium/i)
    await expect(page.getByRole('link', { name: /Clavium/i }).first()).toBeVisible()

    // Slide 1 — chiriași & cumpărători: titlu + căutare + CTA.
    await expect(page.getByRole('heading', { name: /Găsește-ți casa/i })).toBeVisible()
    await expect(page.getByPlaceholder(/oraș|city/i)).toBeVisible()
    await expect(page.getByRole('link', { name: /Vezi proprietățile/i }).first()).toBeVisible()
    // Slide 2 — proprietari: modelul dual.
    await expect(page.getByText('Self-service').first()).toBeVisible()
    // Slide 3 — dezvoltatori & comercial: CTA de lead.
    await expect(page.getByRole('link', { name: /Programează o demonstrație/i })).toBeVisible()
    // Slide 4 — cum funcționează.
    await expect(page.getByRole('heading', { name: /de la căutare la cheie/i })).toBeVisible()
  })

  test('comutatorul de limbă schimbă homepage-ul în engleză', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'EN', exact: true }).first().click()
    // Titlul slide-ului 1 trece în engleză.
    await expect(page.getByRole('heading', { name: /Find your home/i })).toBeVisible()
  })

  test('pagina publică /servicii prezintă oferta de administrare', async ({ page }) => {
    await page.goto('/servicii')
    await expect(page.getByRole('heading', { name: /Lasă-ne pe noi/i })).toBeVisible()
    await expect(page.getByText('Administrare proprietate')).toBeVisible()
  })

  test('lista de proprietăți se încarcă și are filtre', async ({ page }) => {
    await page.goto('/proprietati')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('robots.txt și sitemap.xml sunt servite', async ({ request }) => {
    expect((await request.get('/robots.txt')).ok()).toBeTruthy()
    const sitemap = await request.get('/sitemap.xml')
    expect(sitemap.ok()).toBeTruthy()
    expect(await sitemap.text()).toContain('/proprietati')
  })
})

test.describe('autentificare (UI)', () => {
  test('paginile de login și înregistrare se încarcă', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.getByRole('button', { name: /Conectează-te|Sign in/i })).toBeVisible()

    await page.goto('/auth/register')
    await expect(page.getByRole('heading').first()).toBeVisible()
  })

  test('login cu credențiale greșite afișează o eroare', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByPlaceholder(/exemplu@/i).fill('inexistent@clavium.test')
    await page.getByPlaceholder('••••••••').fill('parolagresita123')
    await page.getByRole('button', { name: /Conectează-te|Sign in/i }).click()
    await expect(page.getByText(/incorect|invalid/i).first()).toBeVisible({ timeout: 10_000 })
  })
})
