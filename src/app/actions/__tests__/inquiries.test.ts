import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { setUser } from '@/test/setup'
import { resetDb, makeUser, sessionFor } from '@/test/helpers'
import { sendInquiryAction, replyInquiryAction, closeInquiryAction } from '@/app/actions/inquiries'

async function listing() {
  const owner = await makeUser('OWNER', `o-${Math.random()}@ex.ro`)
  const asker = await makeUser('CLIENT', `c-${Math.random()}@ex.ro`)
  const property = await prisma.property.create({ data: { title: 'Garsonieră', location: 'Cluj', rent: 1500, ownerId: owner.id } })
  return { owner, asker, property }
}

describe('pre-contract inquiries', () => {
  beforeEach(async () => { await resetDb() })

  it('creează un fir, notifică proprietarul și reutilizează firul la al doilea mesaj', async () => {
    const { owner, asker, property } = await listing()
    setUser(sessionFor(asker))

    const first = await sendInquiryAction(property.id, '  Este disponibilă pentru vizionare?  ')
    expect(first.ok).toBe(true)
    expect(await prisma.inquiry.count()).toBe(1)
    expect(await prisma.inquiryMessage.count()).toBe(1)
    expect(await prisma.notification.count({ where: { userId: owner.id } })).toBe(1)

    const second = await sendInquiryAction(property.id, 'Mai e liberă?')
    expect(second.ok).toBe(true)
    expect(await prisma.inquiry.count()).toBe(1) // același fir
    expect(await prisma.inquiryMessage.count()).toBe(2)
  })

  it('respinge mesajul gol și auto-întrebarea proprietarului', async () => {
    const { owner, property } = await listing()
    setUser(sessionFor(owner))
    expect((await sendInquiryAction(property.id, '   ')).ok).toBe(false)
    expect((await sendInquiryAction(property.id, 'salut')).ok).toBe(false) // proprietarul nu se întreabă singur
  })

  it('proprietarul răspunde și notifică solicitantul; un terț nu are acces', async () => {
    const { owner, asker, property } = await listing()
    setUser(sessionFor(asker))
    const created = await sendInquiryAction(property.id, 'Întrebare')
    const inquiryId = created.ok ? created.inquiryId! : ''

    setUser(sessionFor(owner))
    const reply = await replyInquiryAction(inquiryId, 'Da, e disponibilă.')
    expect(reply.ok).toBe(true)
    expect(await prisma.notification.count({ where: { userId: asker.id } })).toBe(1)

    const stranger = await makeUser('CLIENT', `x-${Math.random()}@ex.ro`)
    setUser(sessionFor(stranger))
    expect((await replyInquiryAction(inquiryId, 'intrus')).ok).toBe(false)
  })

  it('închide firul; un mesaj nou îl redeschide', async () => {
    const { owner, asker, property } = await listing()
    setUser(sessionFor(asker))
    const created = await sendInquiryAction(property.id, 'Întrebare')
    const inquiryId = created.ok ? created.inquiryId! : ''

    setUser(sessionFor(owner))
    expect((await closeInquiryAction(inquiryId)).ok).toBe(true)
    expect((await prisma.inquiry.findUniqueOrThrow({ where: { id: inquiryId } })).status).toBe('INCHIS')

    setUser(sessionFor(asker))
    await sendInquiryAction(property.id, 'Încă o întrebare')
    expect((await prisma.inquiry.findUniqueOrThrow({ where: { id: inquiryId } })).status).toBe('DESCHIS')
  })
})
