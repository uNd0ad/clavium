'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import { adminSetKycStatusAction, adminModeratePropertyAction, adminRefundPaymentAction } from '@/app/actions/admin'

// Suprascriere KYC (suport).
export function KycOverrideControls({ userId, current }: { userId: string; current: string }) {
  const router = useRouter()
  const [loading, startTransition] = useTransition()

  const set = (status: string) =>
    startTransition(async () => {
      const res = await adminSetKycStatusAction(userId, status)
      if (res.ok) {
        toast.success('Stare KYC actualizată.')
        router.refresh()
      } else toast.error(res.error)
    })

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-[var(--muted)]">Stare curentă: <span className="font-semibold text-[var(--text)]">{current}</span></span>
      <Button type="button" variant="outline" loading={loading} onClick={() => set('VERIFIED')} className="px-4 py-2 text-xs">Verifică</Button>
      <Button type="button" variant="outline" disabled={loading} onClick={() => set('REJECTED')} className="px-4 py-2 text-xs">Respinge</Button>
      <Button type="button" variant="outline" disabled={loading} onClick={() => set('UNVERIFIED')} className="px-4 py-2 text-xs">Resetează</Button>
    </div>
  )
}

// Moderare listare (ascunde / reactivează).
export function PropertyModerateControl({ propertyId, hidden }: { propertyId: string; hidden: boolean }) {
  const router = useRouter()
  const [loading, startTransition] = useTransition()

  const act = () =>
    startTransition(async () => {
      const res = await adminModeratePropertyAction(propertyId, hidden ? 'restore' : 'hide')
      if (res.ok) {
        toast.success(hidden ? 'Listare reactivată.' : 'Listare ascunsă.')
        router.refresh()
      } else toast.error(res.error)
    })

  return (
    <Button type="button" variant="outline" loading={loading} onClick={act} className="px-4 py-2 text-xs">
      {hidden ? 'Reactivează' : 'Ascunde'}
    </Button>
  )
}

// Rambursare plată.
export function RefundControl({ paymentId }: { paymentId: string }) {
  const router = useRouter()
  const [loading, startTransition] = useTransition()

  const refund = () =>
    startTransition(async () => {
      const res = await adminRefundPaymentAction(paymentId)
      if (res.ok) {
        toast.success('Rambursare efectuată.')
        router.refresh()
      } else toast.error(res.error)
    })

  return (
    <Button type="button" variant="outline" loading={loading} onClick={refund} className="px-4 py-2 text-xs">
      Rambursează
    </Button>
  )
}
