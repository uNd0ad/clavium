// Recenzii reciproce + reputație. Părțile unui contract încheiat se pot evalua o singură dată.
import { prisma } from './prisma'

export type Reputation = { average: number; count: number }

// Reputația unui utilizator (media rotunjită la o zecimală + numărul de recenzii primite).
export async function getUserReputation(userId: string): Promise<Reputation> {
  const agg = await prisma.review.aggregate({
    where: { subjectId: userId },
    _avg: { rating: true },
    _count: true,
  })
  return {
    average: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 0,
    count: agg._count,
  }
}

export type ContractReview = {
  rating: number
  comment: string | null
  authorName: string
  createdAt: Date
}

// Recenziile lăsate pe un contract (cu numele autorului), pentru afișare pe pagina contractului.
export async function getContractReviews(contractId: string): Promise<ContractReview[]> {
  const reviews = await prisma.review.findMany({
    where: { contractId },
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { firstName: true, lastName: true } } },
  })
  return reviews.map((r) => ({
    rating: r.rating,
    comment: r.comment,
    authorName: `${r.author.firstName} ${r.author.lastName}`,
    createdAt: r.createdAt,
  }))
}

// Stările de contract în care se pot lăsa recenzii (relația s-a încheiat).
export const REVIEWABLE_STATUSES = ['INCHEIAT', 'ANULAT'] as const

// Poate `userId` să recenzeze cealaltă parte a acestui contract acum?
// (e parte, contractul e încheiat/anulat, și nu a mai lăsat o recenzie).
export async function canReview(contractId: string, userId: string): Promise<{ ok: boolean; subjectId?: string }> {
  const contract = await prisma.contract.findUnique({ where: { id: contractId } })
  if (!contract) return { ok: false }
  if (!REVIEWABLE_STATUSES.includes(contract.status as (typeof REVIEWABLE_STATUSES)[number])) return { ok: false }
  const isOwner = contract.ownerId === userId
  const isTenant = contract.tenantId === userId
  if (!isOwner && !isTenant) return { ok: false }
  const existing = await prisma.review.findUnique({ where: { contractId_authorId: { contractId, authorId: userId } } })
  if (existing) return { ok: false }
  return { ok: true, subjectId: isOwner ? contract.tenantId : contract.ownerId }
}
