'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireActionUser } from '@/lib/actionUser'
import { errorMessage } from '@/lib/apiError'
import { notify } from '@/lib/notify'

const MAX_BODY = 2000

// Trimite o întrebare proprietarului despre o listare (înainte de orice contract). Un singur fir
// per (listare, utilizator): mesajele ulterioare se adaugă în același fir, care se redeschide.
export async function sendInquiryAction(propertyId: string, body: string) {
  try {
    const user = await requireActionUser()
    const text = (body ?? '').trim()
    if (!text) return { ok: false as const, error: 'Mesajul nu poate fi gol.' }
    if (text.length > MAX_BODY) return { ok: false as const, error: 'Mesajul este prea lung (max. 2000 de caractere).' }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, ownerId: true, title: true, status: true },
    })
    if (!property || property.status === 'INACTIVA') return { ok: false as const, error: 'Listarea nu există.' }
    if (property.ownerId === user.id) return { ok: false as const, error: 'Nu poți trimite o întrebare propriei listări.' }

    const inquiry = await prisma.inquiry.upsert({
      where: { propertyId_fromUserId: { propertyId, fromUserId: user.id } },
      create: { propertyId, fromUserId: user.id, ownerId: property.ownerId, status: 'DESCHIS' },
      update: { status: 'DESCHIS' },
    })
    await prisma.inquiryMessage.create({ data: { inquiryId: inquiry.id, authorId: user.id, body: text } })
    await notify(
      property.ownerId,
      'Întrebare nouă despre o listare',
      `${user.firstName} ${user.lastName} a întrebat despre „${property.title}”.`,
      'info'
    )
    revalidatePath('/dashboard/mesaje')
    return { ok: true as const, inquiryId: inquiry.id }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}

// Răspunde într-un fir existent (oricare participant sau admin).
export async function replyInquiryAction(inquiryId: string, body: string) {
  try {
    const user = await requireActionUser()
    const text = (body ?? '').trim()
    if (!text) return { ok: false as const, error: 'Mesajul nu poate fi gol.' }
    if (text.length > MAX_BODY) return { ok: false as const, error: 'Mesajul este prea lung (max. 2000 de caractere).' }

    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
      include: { property: { select: { title: true } } },
    })
    if (!inquiry) return { ok: false as const, error: 'Firul nu există.' }
    const isOwner = inquiry.ownerId === user.id
    const isSender = inquiry.fromUserId === user.id
    if (!isOwner && !isSender && user.role !== 'ADMIN') return { ok: false as const, error: 'Nu ai acces la acest fir.' }

    await prisma.$transaction([
      prisma.inquiryMessage.create({ data: { inquiryId, authorId: user.id, body: text } }),
      prisma.inquiry.update({ where: { id: inquiryId }, data: { status: 'DESCHIS' } }),
    ])

    // Notifică cealaltă parte.
    const recipientId = user.id === inquiry.ownerId ? inquiry.fromUserId : inquiry.ownerId
    await notify(recipientId, 'Răspuns la întrebare', `Mesaj nou despre „${inquiry.property.title}”.`, 'info')
    revalidatePath(`/dashboard/mesaje/${inquiryId}`)
    revalidatePath('/dashboard/mesaje')
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}

// Închide firul (oricare participant sau admin).
export async function closeInquiryAction(inquiryId: string) {
  try {
    const user = await requireActionUser()
    const inquiry = await prisma.inquiry.findUnique({ where: { id: inquiryId } })
    if (!inquiry) return { ok: false as const, error: 'Firul nu există.' }
    if (inquiry.ownerId !== user.id && inquiry.fromUserId !== user.id && user.role !== 'ADMIN') {
      return { ok: false as const, error: 'Nu ai acces la acest fir.' }
    }
    await prisma.inquiry.update({ where: { id: inquiryId }, data: { status: 'INCHIS' } })
    revalidatePath(`/dashboard/mesaje/${inquiryId}`)
    revalidatePath('/dashboard/mesaje')
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}
