// Citirea firelor de întrebări pre-contract (dashboard). Vezi schema Inquiry / InquiryMessage.
import { prisma } from './prisma'
import type { SessionUser } from './session'

export type InquiryListItem = {
  id: string
  propertyId: string
  propertyTitle: string
  counterpart: string // cealaltă parte (proprietar sau solicitant), din perspectiva utilizatorului
  role: 'owner' | 'sender' // rolul utilizatorului curent în fir
  status: string
  lastMessage: string
  lastAt: Date
}

export type InquiryThread = {
  id: string
  propertyId: string
  propertyTitle: string
  counterpart: string
  status: string
  isOwner: boolean
  messages: { id: string; mine: boolean; authorName: string; body: string; createdAt: Date }[]
}

function fullName(u: { firstName: string; lastName: string }): string {
  return `${u.firstName} ${u.lastName}`
}

// Toate firele în care utilizatorul e proprietar sau solicitant (adminul le vede pe toate).
export async function getInquiriesFor(user: SessionUser): Promise<InquiryListItem[]> {
  const where =
    user.role === 'ADMIN' ? {} : { OR: [{ ownerId: user.id }, { fromUserId: user.id }] }
  const inquiries = await prisma.inquiry.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: {
      property: { select: { id: true, title: true } },
      fromUser: { select: { firstName: true, lastName: true } },
      owner: { select: { firstName: true, lastName: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  })

  return inquiries.map((inq) => {
    const isOwner = inq.ownerId === user.id
    return {
      id: inq.id,
      propertyId: inq.property.id,
      propertyTitle: inq.property.title,
      counterpart: isOwner ? fullName(inq.fromUser) : fullName(inq.owner),
      role: isOwner ? 'owner' : 'sender',
      status: inq.status,
      lastMessage: inq.messages[0]?.body ?? '',
      lastAt: inq.messages[0]?.createdAt ?? inq.updatedAt,
    }
  })
}

// Un fir complet, autorizat (participanți + admin). `null` dacă nu există / fără acces.
export async function getInquiryThread(inquiryId: string, user: SessionUser): Promise<InquiryThread | null> {
  const inquiry = await prisma.inquiry.findUnique({
    where: { id: inquiryId },
    include: {
      property: { select: { id: true, title: true } },
      fromUser: { select: { firstName: true, lastName: true } },
      owner: { select: { firstName: true, lastName: true } },
      messages: { orderBy: { createdAt: 'asc' }, include: { author: { select: { firstName: true, lastName: true } } } },
    },
  })
  if (!inquiry) return null
  const isOwner = inquiry.ownerId === user.id
  const isSender = inquiry.fromUserId === user.id
  if (!isOwner && !isSender && user.role !== 'ADMIN') return null

  return {
    id: inquiry.id,
    propertyId: inquiry.property.id,
    propertyTitle: inquiry.property.title,
    counterpart: isOwner ? fullName(inquiry.fromUser) : fullName(inquiry.owner),
    status: inquiry.status,
    isOwner,
    messages: inquiry.messages.map((m) => ({
      id: m.id,
      mine: m.authorId === user.id,
      authorName: fullName(m.author),
      body: m.body,
      createdAt: m.createdAt,
    })),
  }
}
