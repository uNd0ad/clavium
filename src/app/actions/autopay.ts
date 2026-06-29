'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireActionUser } from '@/lib/actionUser'
import { errorMessage } from '@/lib/apiError'

// Chiriașul activează/dezactivează plata automată a chiriei pe un contract activ.
export async function setAutopayAction(contractId: string, enabled: boolean) {
  try {
    const user = await requireActionUser()
    const contract = await prisma.contract.findUnique({ where: { id: contractId }, select: { tenantId: true, type: true, status: true } })
    if (!contract) return { ok: false as const, error: 'Contractul nu există.' }
    if (contract.tenantId !== user.id) return { ok: false as const, error: 'Doar chiriașul poate gestiona plata automată.' }
    if (contract.type !== 'INCHIRIERE') return { ok: false as const, error: 'Plata automată se aplică doar contractelor de închiriere.' }
    if (!['ACTIV', 'SEMNAT'].includes(contract.status)) {
      return { ok: false as const, error: 'Plata automată se poate seta doar pe un contract activ.' }
    }

    await prisma.contract.update({ where: { id: contractId }, data: { autopayEnabled: enabled } })
    revalidatePath(`/dashboard/contracte/${contractId}`)
    return { ok: true as const, enabled }
  } catch (err) {
    return { ok: false as const, error: errorMessage(err) }
  }
}
