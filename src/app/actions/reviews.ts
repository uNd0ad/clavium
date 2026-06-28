'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireActionUser } from '@/lib/actionUser'
import { errorMessage } from '@/lib/apiError'
import { notify } from '@/lib/notify'
import { canReview } from '@/lib/reviews'

const MAX_COMMENT = 1000

// Lasă o recenzie celeilalte părți a unui contract încheiat (1–5 + comentariu opțional).
export async function createReviewAction(contractId: string, rating: number, comment?: string) {
  try {
    const user = await requireActionUser()
    const stars = Math.round(Number(rating))
    if (!Number.isFinite(stars) || stars < 1 || stars > 5) {
      return { ok: false as const, error: 'Nota trebuie să fie între 1 și 5.' }
    }
    const text = (comment ?? '').trim()
    if (text.length > MAX_COMMENT) return { ok: false as const, error: 'Comentariul este prea lung.' }

    const eligibility = await canReview(contractId, user.id)
    if (!eligibility.ok || !eligibility.subjectId) {
      return { ok: false as const, error: 'Nu poți lăsa o recenzie pentru acest contract.' }
    }

    await prisma.review.create({
      data: {
        contractId,
        authorId: user.id,
        subjectId: eligibility.subjectId,
        rating: stars,
        comment: text || null,
      },
    })
    await notify(eligibility.subjectId, 'Recenzie nouă', `${user.firstName} ${user.lastName} ți-a lăsat o recenzie (${stars}/5).`, 'info')
    revalidatePath(`/dashboard/contracte/${contractId}`)
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}
