import { describe, it, expect, beforeAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { setUser } from '@/test/setup'
import { resetDb, makeUser, sessionFor } from '@/test/helpers'
import { createPropertyAction } from '@/app/actions/properties'
import { createOfferAction, respondToOfferAction } from '@/app/actions/offers'
import { signContractAction } from '@/app/actions/contracts'
import { contractDocumentHash } from '@/lib/qes'

type DbUser = Awaited<ReturnType<typeof makeUser>>

describe('semnare QES: pistă de audit + legare de document', () => {
  let owner: DbUser
  let client: DbUser
  let contractId: string

  beforeAll(async () => {
    await resetDb()
    owner = await makeUser('OWNER', 'owner@qes.test')
    client = await makeUser('CLIENT', 'client@qes.test')

    setUser(sessionFor(owner))
    const created = await createPropertyAction({ title: 'Garsonieră QES', location: 'Cluj', rent: 1200 })
    if (!created.ok) throw new Error('property')

    setUser(sessionFor(client))
    const offered = await createOfferAction({ propertyId: created.propertyId, amount: 1200 })
    if (!offered.ok) throw new Error('offer')
    const offer = await prisma.offer.findFirstOrThrow()

    setUser(sessionFor(owner))
    const accepted = await respondToOfferAction(offer.id, 'accept')
    if (!accepted.ok) throw new Error('accept')
    contractId = (await prisma.contract.findFirstOrThrow()).id
  })

  it('înregistrează o semnătură per parte, cu referință QES și amprenta documentului', async () => {
    // Ownerul semnează.
    setUser(sessionFor(owner))
    expect((await signContractAction(contractId)).ok).toBe(true)

    const ownerSig = await prisma.signature.findUniqueOrThrow({
      where: { contractId_signerId: { contractId, signerId: owner.id } },
    })
    expect(ownerSig.role).toBe('OWNER')
    expect(ownerSig.qes).toBe(true)
    expect(ownerSig.provider).toBe('dev')
    expect(ownerSig.signatureRef).toMatch(/^qes_dev_/)
    expect(ownerSig.signerEmail).toBe(owner.email)

    // Clientul semnează → contract activ.
    setUser(sessionFor(client))
    expect((await signContractAction(contractId)).ok).toBe(true)

    const sigs = await prisma.signature.findMany({ where: { contractId } })
    expect(sigs).toHaveLength(2)
    expect(sigs.map((s) => s.role).sort()).toEqual(['CLIENT', 'OWNER'])

    // Ambele semnături sunt legate de aceeași amprentă (termenii sunt înghețați la semnare).
    const [a, b] = sigs
    expect(a.documentHash).toBe(b.documentHash)

    // Amprenta stocată corespunde documentului curent (binding eIDAS).
    const contract = await prisma.contract.findUniqueOrThrow({ where: { id: contractId } })
    expect(a.documentHash).toBe(contractDocumentHash(contract))
  })

  it('amprenta se schimbă dacă termenii materiale se modifică (semnătura ar deveni invalidă)', async () => {
    const contract = await prisma.contract.findUniqueOrThrow({ where: { id: contractId } })
    const original = contractDocumentHash(contract)
    const tampered = contractDocumentHash({ ...contract, rent: contract.rent + 1 })
    expect(tampered).not.toBe(original)
  })

  it('blochează re-semnarea aceleiași părți', async () => {
    setUser(sessionFor(owner))
    const res = await signContractAction(contractId)
    expect(res.ok).toBe(false)
  })
})
