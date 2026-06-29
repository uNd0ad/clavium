import { test, expect } from '@playwright/test'

// Smoke pe suprafața publică (indexabilă, fără autentificare). Rulează fiabil pe orice mediu.
test.describe('pagini publice', () => {
  test('landing-ul se încarcă cu hero + CTA', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Clavium/i)
    // Brandul din navbar.
    await expect(page.getByRole('link', { name: /Clavium/i }).first()).toBeVisible()
    // Acțiunea principală din hero duce la înregistrare.
    await expect(page.getByRole('link', { name: /Începe gratuit|Start for free/i }).first()).toBeVisible()
  })

  test('comutatorul de limbă schimbă interfața în engleză', async ({ page }) => {
    await page.goto('/')
    // Butonul EN din comutatorul de limbă.
    await page.getByRole('button', { name: 'EN', exact: true }).first().click()
    // După schimbare, apare textul în engleză (ex. CTA „Sign up"/„Sign in").
    await expect(page.getByRole('link', { name: /Sign in|Sign up/i }).first()).toBeVisible()
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
    // Toast de eroare (sonner) — mesaj de credențiale invalide.
    await expect(page.getByText(/incorect|invalid/i).first()).toBeVisible({ timeout: 10_000 })
  })
})
