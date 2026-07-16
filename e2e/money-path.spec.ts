import Stripe from 'stripe'
import { test, expect, type Browser, type Page } from '@playwright/test'
import {
  E2E_ACCOUNTS,
  E2E_PASSWORD,
  QES_CERTIFICATE_PATH,
  cleanMoneyPath,
  moneyPathEnabled,
  prisma,
  resetAndSeedMoneyPath,
  signDocumentHash,
} from './support/moneyPath'

const PROPERTY_TITLE = 'Apartament E2E Vatrio'
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? ''

async function login(page: Page, email: string) {
  await page.goto('/auth/login')
  await page.getByLabel('Email', { exact: true }).fill(email)
  await page.getByLabel('Parolă', { exact: true }).fill(E2E_PASSWORD)
  const loginResponse = page.waitForResponse((response) =>
    response.url().endsWith('/api/auth/login') && response.request().method() === 'POST'
  )
  await page.getByRole('button', { name: 'Conectează-te' }).click()
  const response = await loginResponse
  const body = await response.json()
  expect(response.ok(), JSON.stringify(body)).toBe(true)
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/dashboard(?:\/|$)/)
}

async function signVisibleContract(page: Page) {
  await page.getByRole('button', { name: 'Semnează cu QES' }).click()
  const hashCode = page.locator('code').filter({ hasText: /^[a-f0-9]{64}$/ }).first()
  const documentHash = (await hashCode.textContent())?.trim()
  if (!documentHash) throw new Error('Amprenta contractului nu este vizibilă.')

  await page.getByLabel(/Certificat \(\.pem/).setInputFiles(QES_CERTIFICATE_PATH)
  await page.getByLabel('Semnătura (base64)').fill(await signDocumentHash(documentHash))
  await page.getByRole('button', { name: 'Trimite semnătura' }).click()
  await expect(page.getByText('Contract semnat cu QES.')).toBeVisible()
}

async function openRolePages(browser: Browser) {
  const ownerContext = await browser.newContext()
  const clientContext = await browser.newContext()
  for (const context of [ownerContext, clientContext]) {
    await context.addInitScript(() => {
      window.localStorage.setItem('vatrio_cookie_consent', 'e2e')
      window.sessionStorage.setItem('vatrio_dev_notice_dismissed', '1')
    })
  }
  const ownerPage = await ownerContext.newPage()
  const clientPage = await clientContext.newPage()
  await login(ownerPage, E2E_ACCOUNTS.owner.email)
  await login(clientPage, E2E_ACCOUNTS.client.email)
  return { ownerContext, clientContext, ownerPage, clientPage }
}

test.describe('calea banilor (capăt-la-capăt)', () => {
  test.skip(!moneyPathEnabled(), 'Necesită E2E_MONEY_PATH=1 și o bază locală explicit resetabilă.')
  test.describe.configure({ mode: 'serial', timeout: 120_000 })

  test.beforeEach(async () => {
    await resetAndSeedMoneyPath()
  })

  test.afterAll(async () => {
    await cleanMoneyPath()
  })

  test('proprietar listează → chiriaș oferă → ambii semnează → plată → contract activ', async ({ browser }) => {
    const { ownerContext, clientContext, ownerPage, clientPage } = await openRolePages(browser)

    try {
      await ownerPage.goto('/dashboard/proprietati')
      await ownerPage.getByRole('button', { name: 'Adaugă proprietate' }).click()
      await ownerPage.getByLabel('Titlu').fill(PROPERTY_TITLE)
      await ownerPage.getByLabel('Localitate').fill('București')
      await ownerPage.getByLabel('Chirie (RON / lună)').fill('1500')
      await ownerPage.getByLabel('Camere (opțional)').fill('2')
      await ownerPage.getByRole('button', { name: 'Publică proprietatea' }).click()
      await expect(ownerPage.getByText('Proprietatea a fost adăugată!')).toBeVisible()

      const property = await prisma.property.findFirstOrThrow({ where: { title: PROPERTY_TITLE } })

      await clientPage.goto(`/proprietati/${property.id}`)
      await clientPage.getByLabel('Oferta ta (RON / lună)').fill('1400')
      await clientPage.getByRole('button', { name: 'Trimite oferta' }).click()
      await expect(clientPage.getByText('Ofertă trimisă! Proprietarul a fost notificat.')).toBeVisible()

      await ownerPage.goto('/dashboard/oferte')
      await ownerPage.getByRole('button', { name: 'Acceptă' }).click()
      await expect(ownerPage.getByText('Ofertă acceptată — contractul a fost creat.')).toBeVisible()

      const contract = await prisma.contract.findFirstOrThrow({ where: { propertyId: property.id } })
      expect(contract.status).toBe('IN_ASTEPTARE')
      expect(contract.rent).toBe(1400)

      await ownerPage.goto(`/dashboard/contracte/${contract.id}`)
      await signVisibleContract(ownerPage)
      await expect.poll(async () => (await prisma.contract.findUniqueOrThrow({ where: { id: contract.id } })).status).toBe('SEMNAT')

      await clientPage.goto(`/dashboard/contracte/${contract.id}`)
      await signVisibleContract(clientPage)
      await expect.poll(async () => (await prisma.contract.findUniqueOrThrow({ where: { id: contract.id } })).status).toBe('ACTIV')

      const dueRent = await prisma.payment.findFirstOrThrow({
        where: { contractId: contract.id, type: 'CHIRIE', status: 'IN_CURS' },
      })
      await clientPage.goto('/dashboard/contracte')
      await clientPage.getByRole('button', { name: /Plătește chiria/ }).click()
      await expect(clientPage.getByText('Plata chiriei a fost efectuată.')).toBeVisible()

      await expect.poll(async () => (await prisma.payment.findUniqueOrThrow({ where: { id: dueRent.id } })).status).toBe('FINALIZATA')
      expect(await prisma.payment.count({ where: { contractId: contract.id, type: 'COMISION', status: 'FINALIZATA' } })).toBe(1)
      expect(await prisma.payment.count({ where: { contractId: contract.id, type: 'CHIRIE', status: 'IN_CURS' } })).toBe(1)

      await ownerPage.goto('/dashboard/plati')
      const receipt = ownerPage.locator(`a[href="/api/plati/${dueRent.id}/chitanta"]`)
      await expect(receipt).toBeVisible()
      const pdf = await ownerPage.evaluate(async (href) => {
        const response = await fetch(href, { credentials: 'include' })
        return {
          ok: response.ok,
          status: response.status,
          contentType: response.headers.get('content-type'),
          byteLength: (await response.arrayBuffer()).byteLength,
        }
      }, `/api/plati/${dueRent.id}/chitanta`)
      expect(pdf.ok, `Chitanța a răspuns cu HTTP ${pdf.status}.`).toBe(true)
      expect(pdf.contentType).toContain('application/pdf')
      expect(pdf.byteLength).toBeGreaterThan(1_000)
    } finally {
      await ownerContext.close().catch(() => {})
      await clientContext.close().catch(() => {})
    }
  })

  test('webhook Stripe decontează plata și este idempotent la reluare', async ({ request }) => {
    expect(WEBHOOK_SECRET, 'STRIPE_WEBHOOK_SECRET trebuie setat pentru testul webhook.').toBeTruthy()

    const owner = await prisma.user.findUniqueOrThrow({ where: { email: E2E_ACCOUNTS.owner.email } })
    const client = await prisma.user.findUniqueOrThrow({ where: { email: E2E_ACCOUNTS.client.email } })
    const property = await prisma.property.create({
      data: { title: 'Webhook E2E', location: 'Cluj', rent: 1200, ownerId: owner.id, status: 'INCHIRIATA' },
    })
    const contract = await prisma.contract.create({
      data: {
        propertyId: property.id,
        ownerId: owner.id,
        tenantId: client.id,
        rent: 1200,
        status: 'ACTIV',
        signedByOwner: true,
        signedByClient: true,
        qes: true,
      },
    })
    const payment = await prisma.payment.create({
      data: {
        reference: 'E2E-WEBHOOK-001',
        userId: client.id,
        contractId: contract.id,
        amount: 1200,
        type: 'CHIRIE',
        status: 'IN_CURS',
        dueDate: new Date(),
      },
    })

    const payload = JSON.stringify({
      id: 'evt_vatrio_e2e_checkout_completed',
      object: 'event',
      api_version: '2025-02-24.acacia',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: 'cs_vatrio_e2e',
          object: 'checkout.session',
          metadata: { paymentId: payment.id },
          payment_status: 'paid',
        },
      },
      livemode: false,
      pending_webhooks: 1,
      request: null,
      type: 'checkout.session.completed',
    })
    const stripe = new Stripe('sk_test_vatrio_e2e')
    const signature = stripe.webhooks.generateTestHeaderString({ payload, secret: WEBHOOK_SECRET })

    for (let delivery = 0; delivery < 2; delivery += 1) {
      const response = await request.post('/api/webhooks/stripe', {
        data: payload,
        headers: { 'content-type': 'application/json', 'stripe-signature': signature },
      })
      expect(response.status()).toBe(200)
      expect(await response.json()).toEqual({ received: true })
    }

    expect((await prisma.payment.findUniqueOrThrow({ where: { id: payment.id } })).status).toBe('FINALIZATA')
    expect(await prisma.payment.count({ where: { contractId: contract.id, type: 'COMISION' } })).toBe(1)
    expect(await prisma.payment.count({ where: { contractId: contract.id, type: 'CHIRIE', status: 'IN_CURS' } })).toBe(1)
  })
})
