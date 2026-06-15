'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireActionUser } from '@/lib/actionUser'
import { errorMessage } from '@/lib/apiError'
import { ticketCreateSchema, ticketReplySchema, ticketStatusSchema } from '@/lib/validations'
import { notify } from '@/lib/notify'

const TICKETS_PATH = '/dashboard/tichete'

// Statusuri pe care le poate seta chiriașul (autorul). Trecerea „În lucru” aparține proprietarului.
const AUTHOR_STATUSES = ['DESCHIS', 'REZOLVAT', 'INCHIS'] as const

const STATUS_LABEL: Record<string, string> = {
  DESCHIS: 'Deschis',
  IN_LUCRU: 'În lucru',
  REZOLVAT: 'Rezolvat',
  INCHIS: 'Închis',
}

// Chiriașul deschide un tichet pe un contract de închiriere activ în care este parte.
export async function createTicketAction(input: unknown) {
  try {
    const user = await requireActionUser()
    const data = ticketCreateSchema.parse(input)

    const contract = await prisma.contract.findUnique({
      where: { id: data.contractId },
      include: { property: true },
    })
    if (!contract) return { ok: false as const, error: 'Contractul nu există.' }
    if (contract.tenantId !== user.id) {
      return { ok: false as const, error: 'Poți deschide tichete doar pe contractele tale de chiriaș.' }
    }
    if (contract.type !== 'INCHIRIERE') {
      return { ok: false as const, error: 'Tichetele sunt disponibile doar pentru contractele de închiriere.' }
    }
    if (contract.status !== 'ACTIV') {
      return { ok: false as const, error: 'Poți deschide tichete doar pe un contract de închiriere activ.' }
    }

    const ticket = await prisma.ticket.create({
      data: {
        contractId: contract.id,
        authorId: user.id,
        subject: data.subject,
        category: data.category,
        priority: data.priority,
        messages: { create: { authorId: user.id, body: data.message } },
      },
    })

    await notify(
      contract.ownerId,
      'Tichet nou',
      `${user.firstName} ${user.lastName} a deschis tichetul „${data.subject}” pentru „${contract.property.title}”.`,
      data.priority === 'URGENTA' ? 'danger' : 'warning'
    )

    revalidatePath(TICKETS_PATH)
    return { ok: true as const, ticketId: ticket.id }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}

export async function replyToTicketAction(ticketId: string, input: unknown) {
  try {
    const user = await requireActionUser()
    const data = ticketReplySchema.parse(input)

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { contract: { include: { property: true } } },
    })
    if (!ticket) return { ok: false as const, error: 'Tichetul nu există.' }

    const isAuthor = ticket.authorId === user.id
    const isOwner = ticket.contract.ownerId === user.id
    if (!isAuthor && !isOwner && user.role !== 'ADMIN') {
      return { ok: false as const, error: 'Nu ești parte în acest tichet.' }
    }
    if (ticket.status === 'INCHIS') {
      return { ok: false as const, error: 'Tichetul este închis. Redeschide-l pentru a răspunde.' }
    }

    await prisma.$transaction([
      prisma.ticketMessage.create({ data: { ticketId: ticket.id, authorId: user.id, body: data.body } }),
      prisma.ticket.update({ where: { id: ticket.id }, data: { updatedAt: new Date() } }),
    ])

    // Notificăm cealaltă parte: autorul scrie → anunțăm proprietarul; proprietarul/adminul scrie → anunțăm chiriașul.
    const recipientId = isAuthor ? ticket.contract.ownerId : ticket.authorId
    if (recipientId !== user.id) {
      await notify(
        recipientId,
        'Răspuns la tichet',
        `${user.firstName} ${user.lastName} a răspuns la tichetul „${ticket.subject}”.`,
        'info'
      )
    }

    revalidatePath(TICKETS_PATH)
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}

// Marchează tichetul ca vizualizat de utilizatorul curent (golește indicatorul „răspuns nou").
export async function markTicketReadAction(ticketId: string) {
  try {
    const user = await requireActionUser()

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { contract: { select: { ownerId: true } } },
    })
    if (!ticket) return { ok: false as const, error: 'Tichetul nu există.' }

    const isParty = ticket.authorId === user.id || ticket.contract.ownerId === user.id || user.role === 'ADMIN'
    if (!isParty) return { ok: false as const, error: 'Nu ești parte în acest tichet.' }

    const now = new Date()
    await prisma.ticketRead.upsert({
      where: { ticketId_userId: { ticketId, userId: user.id } },
      create: { ticketId, userId: user.id, readAt: now },
      update: { readAt: now },
    })

    revalidatePath(TICKETS_PATH)
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}

export async function setTicketStatusAction(ticketId: string, input: unknown) {
  try {
    const user = await requireActionUser()
    const { status } = ticketStatusSchema.parse(input)

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { contract: true },
    })
    if (!ticket) return { ok: false as const, error: 'Tichetul nu există.' }

    const isAuthor = ticket.authorId === user.id
    const isOwner = ticket.contract.ownerId === user.id
    const isManager = isOwner || user.role === 'ADMIN'
    if (!isAuthor && !isManager) {
      return { ok: false as const, error: 'Nu ești parte în acest tichet.' }
    }
    if (!isManager && !AUTHOR_STATUSES.includes(status as (typeof AUTHOR_STATUSES)[number])) {
      return { ok: false as const, error: 'Doar proprietarul poate marca tichetul „În lucru”.' }
    }
    if (ticket.status === status) {
      return { ok: false as const, error: 'Tichetul are deja acest status.' }
    }

    await prisma.ticket.update({ where: { id: ticket.id }, data: { status } })

    const recipientId = isAuthor ? ticket.contract.ownerId : ticket.authorId
    if (recipientId !== user.id) {
      await notify(
        recipientId,
        'Status tichet actualizat',
        `Tichetul „${ticket.subject}” are acum statusul „${STATUS_LABEL[status] ?? status}”.`,
        status === 'REZOLVAT' ? 'success' : 'info'
      )
    }

    revalidatePath(TICKETS_PATH)
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}
