import { describe, it, expect, beforeAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { setUser } from '@/test/setup'
import { resetDb, makeUser, sessionFor } from '@/test/helpers'
import { createPropertyAction } from '@/app/actions/properties'
import { createOfferAction, respondToOfferAction } from '@/app/actions/offers'
import { signContractAction, paySaleAction, setSaleTermsAction } from '@/app/actions/contracts'

type DbUser = Awaited<ReturnType<typeof makeUser>>

describe('flux vânzare: proprietate → ofertă → antecontract → semnare → avans → diferență', () => {
  let owner: DbUser
  let buyer: DbUser

  beforeAll(async () => {
    await resetDb()
    owner = await makeUser('OWNER', 'owner@sale.test')
    buyer = await makeUser('CLIENT', 'buyer@sale.test')
  })

  it('parcurge tot ciclul de viață al unei vânzări prin server actions', async () => {
    // 1. Ownerul listează o proprietate de vânzare.
    setUser(sessionFor(owner))
    const created = await createPropertyAction({
      title: 'Vilă de vânzare',
      location: 'Cluj-Napoca',
      transactionType: 'VANZARE',
      price: 300000,
    })
    expect(created.ok).toBe(true)
    const propertyId = created.ok ? created.propertyId : ''
    const property = await prisma.property.findUniqueOrThrow({ where: { id: propertyId } })
    expect(property.transactionType).toBe('VANZARE')
    expect(property.price).toBe(300000)
    expect(property.rent).toBe(0)

    // 2. Cumpărătorul trimite o ofertă de preț.
    setUser(sessionFor(buyer))
    const offered = await createOfferAction({ propertyId, amount: 250000 })
    expect(offered.ok).toBe(true)
    const offer = await prisma.offer.findFirstOrThrow()

    // 3. Ownerul acceptă → antecontract de vânzare; proprietatea devine REZERVATA, avans 10%.
    setUser(sessionFor(owner))
    expect((await respondToOfferAction(offer.id, 'accept')).ok).toBe(true)
    const contract = await prisma.contract.findFirstOrThrow()
    expect(contract.type).toBe('VANZARE')
    expect(contract.status).toBe('IN_ASTEPTARE')
    expect(contract.price).toBe(250000)
    expect(contract.deposit).toBe(25000) // 10% din preț
    expect((await prisma.property.findUniqueOrThrow({ where: { id: propertyId } })).status).toBe('REZERVATA')

    // 4. Ambele părți semnează → ACTIV; avansul devine scadent.
    expect((await signContractAction(contract.id)).ok).toBe(true)
    setUser(sessionFor(buyer))
    expect((await signContractAction(contract.id)).ok).toBe(true)
    const active = await prisma.contract.findUniqueOrThrow({ where: { id: contract.id } })
    expect(active.status).toBe('ACTIV')

    const avans = await prisma.payment.findFirstOrThrow({ where: { type: 'AVANS', status: 'IN_CURS' } })
    expect(avans.amount).toBe(25000)
    // Proprietatea rămâne rezervată până la finalizarea plăților.
    expect((await prisma.property.findUniqueOrThrow({ where: { id: propertyId } })).status).toBe('REZERVATA')

    // 5. Cumpărătorul plătește avansul → FINALIZAT; diferența de preț devine scadentă.
    expect((await paySaleAction(contract.id)).ok).toBe(true)
    expect((await prisma.payment.findUniqueOrThrow({ where: { id: avans.id } })).status).toBe('FINALIZATA')
    const rest = await prisma.payment.findFirstOrThrow({ where: { type: 'REST', status: 'IN_CURS' } })
    expect(rest.amount).toBe(225000) // 250000 - 25000

    // 6. Cumpărătorul plătește diferența → vânzare finalizată.
    expect((await paySaleAction(contract.id)).ok).toBe(true)
    expect((await prisma.payment.findUniqueOrThrow({ where: { id: rest.id } })).status).toBe('FINALIZATA')

    // Comision 5% din preț pentru owner.
    const comision = await prisma.payment.findFirstOrThrow({ where: { type: 'COMISION', status: 'FINALIZATA' } })
    expect(comision.amount).toBe(12500)
    expect(comision.userId).toBe(owner.id)

    // Contract încheiat; proprietatea vândută și transferată cumpărătorului.
    expect((await prisma.contract.findUniqueOrThrow({ where: { id: contract.id } })).status).toBe('INCHEIAT')
    const sold = await prisma.property.findUniqueOrThrow({ where: { id: propertyId } })
    expect(sold.status).toBe('VANDUTA')
    expect(sold.ownerId).toBe(buyer.id)
  })

  it('respinge plata diferenței înainte de achitarea avansului (ordine corectă)', async () => {
    // Reluăm un flux până la activare, apoi verificăm că prima plată este avansul.
    await resetDb()
    const o = await makeUser('OWNER', 'o2@sale.test')
    const b = await makeUser('CLIENT', 'b2@sale.test')
    setUser(sessionFor(o))
    const created = await createPropertyAction({ title: 'Garsonieră vânzare', location: 'Iași', transactionType: 'VANZARE', price: 100000 })
    const propertyId = created.ok ? created.propertyId : ''
    setUser(sessionFor(b))
    await createOfferAction({ propertyId, amount: 100000 })
    const offer = await prisma.offer.findFirstOrThrow()
    setUser(sessionFor(o))
    await respondToOfferAction(offer.id, 'accept')
    const contract = await prisma.contract.findFirstOrThrow()
    await signContractAction(contract.id)
    setUser(sessionFor(b))
    await signContractAction(contract.id)

    // Prima plată scadentă este avansul, nu diferența.
    const first = await prisma.payment.findFirstOrThrow({ where: { contractId: contract.id, status: 'IN_CURS' } })
    expect(first.type).toBe('AVANS')
  })

  describe('editarea termenilor antecontractului de vânzare', () => {
    let o: DbUser
    let b: DbUser
    let contractId: string

    beforeAll(async () => {
      await resetDb()
      o = await makeUser('OWNER', 'o3@sale.test')
      b = await makeUser('CLIENT', 'b3@sale.test')
      setUser(sessionFor(o))
      const created = await createPropertyAction({ title: 'Duplex de vânzare', location: 'Timișoara', transactionType: 'VANZARE', price: 200000 })
      const propertyId = created.ok ? created.propertyId : ''
      setUser(sessionFor(b))
      await createOfferAction({ propertyId, amount: 180000 })
      const offer = await prisma.offer.findFirstOrThrow()
      setUser(sessionFor(o))
      await respondToOfferAction(offer.id, 'accept')
      contractId = (await prisma.contract.findFirstOrThrow()).id
    })

    it('vânzătorul ajustează prețul, avansul și clauzele', async () => {
      setUser(sessionFor(o))
      const res = await setSaleTermsAction(contractId, { price: 175000, deposit: 30000, clauses: 'Taxele notariale se împart egal.' })
      expect(res.ok).toBe(true)
      const c = await prisma.contract.findUniqueOrThrow({ where: { id: contractId } })
      expect(c.price).toBe(175000)
      expect(c.deposit).toBe(30000)
      expect(c.clauses).toBe('Taxele notariale se împart egal.')
    })

    it('respinge avansul mai mare decât prețul', async () => {
      setUser(sessionFor(o))
      const res = await setSaleTermsAction(contractId, { price: 100000, deposit: 150000 })
      expect(res.ok).toBe(false)
    })

    it('cumpărătorul nu poate edita termenii', async () => {
      setUser(sessionFor(b))
      const res = await setSaleTermsAction(contractId, { price: 1, deposit: 0 })
      expect(res.ok).toBe(false)
    })

    it('termenii ajustați se reflectă în plăți (avans, apoi diferență)', async () => {
      // Reluăm termenii valizi, semnăm și verificăm avansul scadent.
      setUser(sessionFor(o))
      await setSaleTermsAction(contractId, { price: 175000, deposit: 30000 })
      await signContractAction(contractId)
      setUser(sessionFor(b))
      await signContractAction(contractId)
      const avans = await prisma.payment.findFirstOrThrow({ where: { contractId, type: 'AVANS' } })
      expect(avans.amount).toBe(30000)

      expect((await paySaleAction(contractId)).ok).toBe(true)
      const rest = await prisma.payment.findFirstOrThrow({ where: { contractId, type: 'REST' } })
      expect(rest.amount).toBe(145000) // 175000 - 30000
    })
  })
})
