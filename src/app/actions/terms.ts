'use server'

import { revalidatePath } from 'next/cache'
import { requireActionUser } from '@/lib/actionUser'
import { errorMessage } from '@/lib/apiError'
import { recordTermsConsent } from '@/lib/terms'

// Înregistrează acceptarea versiunii curente de Termeni și Condiții de către utilizatorul curent.
export async function acceptTermsAction() {
  try {
    const user = await requireActionUser()
    await recordTermsConsent(user.id)
    revalidatePath('/dashboard', 'layout')
    return { ok: true as const }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}
