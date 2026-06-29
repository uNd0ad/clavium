// Logica 2FA la nivel de cont: coduri de rezervă (consum unic) + verificarea unui cod la login,
// care acceptă fie un cod TOTP, fie un cod de rezervă (pe care îl invalidează după folosire).
import { randomBytes } from 'crypto'
import { prisma } from './prisma'
import { sha256 } from './hash'
import { verifyTotp } from './totp'

export const BACKUP_CODE_COUNT = 8

// Coduri de rezervă lizibile (40 biți fiecare), afișate o singură dată la activare.
export function generateBackupCodes(count: number = BACKUP_CODE_COUNT): string[] {
  return Array.from({ length: count }, () => {
    const hex = randomBytes(5).toString('hex')
    return `${hex.slice(0, 5)}-${hex.slice(5)}`
  })
}

// Normalizează (fără spații/cratime, lowercase) și ia amprenta — stocăm doar amprentele.
export function hashBackupCode(code: string): string {
  return sha256(code.toLowerCase().replace(/[\s-]/g, ''))
}

type TwoFactorUser = { id: string; totpSecret: string | null; totpBackupCodes: string }

// Verifică un cod 2FA: întâi TOTP, apoi (dacă nu se potrivește) un cod de rezervă, pe care îl
// consumă. Întoarce true dacă oricare s-a potrivit.
export async function verifyTwoFactor(user: TwoFactorUser, code: string): Promise<boolean> {
  const clean = (code ?? '').trim()
  if (!clean) return false
  if (user.totpSecret && verifyTotp(user.totpSecret, clean)) return true

  let hashes: string[] = []
  try {
    const parsed = JSON.parse(user.totpBackupCodes)
    if (Array.isArray(parsed)) hashes = parsed.filter((h): h is string => typeof h === 'string')
  } catch {
    hashes = []
  }
  const target = hashBackupCode(clean)
  if (!hashes.includes(target)) return false
  // Consum unic: scoatem codul folosit.
  await prisma.user.update({
    where: { id: user.id },
    data: { totpBackupCodes: JSON.stringify(hashes.filter((h) => h !== target)) },
  })
  return true
}
