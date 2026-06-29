// Program de recomandare: fiecare utilizator are un cod partajabil; cine se înregistrează cu codul
// altcuiva e legat de recomandator. Reward-urile monetare se pot adăuga ulterior pe această relație.
import { randomBytes } from 'crypto'
import { prisma } from './prisma'
import { notify } from './notify'
import { logger } from './logger'

// Cod scurt, lizibil (8 caractere, fără 0/O/1/I ambigue).
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
function randomCode(length = 8): string {
  const bytes = randomBytes(length)
  let out = ''
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length]
  return out
}

// Asigură un cod unic de recomandare pe cont (idempotent — îl întoarce pe cel existent).
export async function ensureReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { referralCode: true } })
  if (user?.referralCode) return user.referralCode
  // Reîncearcă la coliziune (unique), extrem de rar.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode()
    try {
      await prisma.user.update({ where: { id: userId }, data: { referralCode: code } })
      return code
    } catch {
      // coliziune pe unique — mai încercăm
    }
  }
  throw new Error('Nu am putut genera un cod de recomandare.')
}

// Leagă un utilizator nou de recomandatorul al cărui cod l-a folosit. Best-effort, nu blochează
// înregistrarea. Ignoră coduri inexistente sau auto-recomandarea.
export async function applyReferral(newUserId: string, code: string | undefined | null): Promise<void> {
  const clean = (code ?? '').trim().toUpperCase()
  if (!clean) return
  try {
    const referrer = await prisma.user.findUnique({ where: { referralCode: clean }, select: { id: true, firstName: true } })
    if (!referrer || referrer.id === newUserId) return
    await prisma.user.update({ where: { id: newUserId }, data: { referredById: referrer.id } })
    await notify(referrer.id, 'Recomandare nouă', 'Cineva s-a înregistrat folosind codul tău de recomandare. Mulțumim!', 'success')
  } catch (err) {
    logger.warn('referral: aplicare eșuată', { newUserId, error: (err as Error).message })
  }
}

export type ReferralStats = { code: string; count: number }

// Codul propriu + câți utilizatori au fost recomandați — pentru pagina de profil.
export async function getReferralStats(userId: string): Promise<ReferralStats> {
  const [code, count] = await Promise.all([
    ensureReferralCode(userId),
    prisma.user.count({ where: { referredById: userId } }),
  ])
  return { code, count }
}
