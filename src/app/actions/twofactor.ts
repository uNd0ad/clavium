'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireActionUser } from '@/lib/actionUser'
import { errorMessage } from '@/lib/apiError'
import { generateTotpSecret, totpAuthUri, verifyTotp } from '@/lib/totp'
import { generateBackupCodes, hashBackupCode, verifyTwoFactor } from '@/lib/twoFactor'
import { recordAuditSafe } from '@/lib/audit'

// Pasul 1: generează un secret TOTP (neconfirmat) și întoarce-l + URI-ul otpauth pentru QR.
// Secretul e salvat, dar 2FA nu e activ până la confirmarea unui cod (confirm2faAction).
export async function begin2faSetupAction() {
  try {
    const sessionUser = await requireActionUser()
    const user = await prisma.user.findUnique({ where: { id: sessionUser.id }, select: { totpEnabled: true, email: true } })
    if (!user) return { ok: false as const, error: 'Utilizatorul nu există.' }
    if (user.totpEnabled) return { ok: false as const, error: 'Autentificarea în doi pași este deja activă.' }

    const secret = generateTotpSecret()
    await prisma.user.update({ where: { id: sessionUser.id }, data: { totpSecret: secret } })
    return { ok: true as const, secret, uri: totpAuthUri(secret, user.email) }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}

// Pasul 2: confirmă cu un cod din aplicație → activează 2FA și întoarce codurile de rezervă
// (afișate o singură dată; stocăm doar amprentele).
export async function confirm2faAction(code: string) {
  try {
    const sessionUser = await requireActionUser()
    const user = await prisma.user.findUnique({ where: { id: sessionUser.id }, select: { totpSecret: true, totpEnabled: true } })
    if (!user || !user.totpSecret) return { ok: false as const, error: 'Începe mai întâi configurarea 2FA.' }
    if (user.totpEnabled) return { ok: false as const, error: 'Autentificarea în doi pași este deja activă.' }
    if (!verifyTotp(user.totpSecret, (code ?? '').trim())) {
      return { ok: false as const, error: 'Cod invalid. Verifică ceasul dispozitivului și reîncearcă.' }
    }

    const backupCodes = generateBackupCodes()
    await prisma.user.update({
      where: { id: sessionUser.id },
      data: { totpEnabled: true, totpBackupCodes: JSON.stringify(backupCodes.map(hashBackupCode)) },
    })
    await recordAuditSafe({ actorId: sessionUser.id, action: 'TWO_FACTOR_ENABLED', entityType: 'USER', entityId: sessionUser.id })
    revalidatePath('/dashboard/profil')
    return { ok: true as const, backupCodes }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}

// Dezactivează 2FA — necesită un cod TOTP valid sau un cod de rezervă (anti-takeover).
export async function disable2faAction(code: string) {
  try {
    const sessionUser = await requireActionUser()
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { id: true, totpSecret: true, totpEnabled: true, totpBackupCodes: true },
    })
    if (!user || !user.totpEnabled) return { ok: false as const, error: 'Autentificarea în doi pași nu este activă.' }
    if (!(await verifyTwoFactor(user, (code ?? '').trim()))) return { ok: false as const, error: 'Cod invalid.' }

    await prisma.user.update({
      where: { id: sessionUser.id },
      data: { totpEnabled: false, totpSecret: null, totpBackupCodes: '[]' },
    })
    await recordAuditSafe({ actorId: sessionUser.id, action: 'TWO_FACTOR_DISABLED', entityType: 'USER', entityId: sessionUser.id })
    revalidatePath('/dashboard/profil')
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}
