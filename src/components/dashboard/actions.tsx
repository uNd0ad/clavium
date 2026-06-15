'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import { useUnreadCount, useSetUnreadCount } from './NotificationContext'
import { respondToOfferAction } from '@/app/actions/offers'
import { signContractAction, payRentAction, paySaleAction } from '@/app/actions/contracts'
import { updatePropertyStatusAction } from '@/app/actions/properties'
import { markNotificationsReadAction } from '@/app/actions/notifications'

type ActionResult = { ok: boolean; error?: string }
type RunOptions = { success?: string; successAction?: { label: string; href: string } }

function useAction() {
  const router = useRouter()
  const [loading, startTransition] = useTransition()

  const run = (action: () => Promise<ActionResult>, opts?: RunOptions) =>
    new Promise<boolean>((resolve) => {
      startTransition(async () => {
        const res = await action()
        if (res.ok) {
          if (opts?.success) {
            const sa = opts.successAction
            toast.success(opts.success, sa ? { action: { label: sa.label, onClick: () => router.push(sa.href) } } : undefined)
          }
          resolve(true)
        } else {
          toast.error(res.error || 'A apărut o eroare.')
          resolve(false)
        }
      })
    })

  return { run, loading }
}

export function OfferActions({ offerId }: { offerId: string }) {
  const { run, loading } = useAction()

  const act = (action: 'accept' | 'reject') =>
    run(() => respondToOfferAction(offerId, action), {
      success: action === 'accept' ? 'Ofertă acceptată — contractul a fost creat.' : 'Ofertă respinsă.',
      successAction: action === 'accept' ? { label: 'Vezi contractul', href: '/dashboard/contracte' } : undefined,
    })

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      <Button type="button" loading={loading} onClick={() => act('accept')} className="px-5 py-2.5 text-xs">
        Acceptă
      </Button>
      <Button type="button" variant="outline" disabled={loading} onClick={() => act('reject')} className="px-5 py-2.5 text-xs">
        Respinge
      </Button>
    </div>
  )
}

type DueType = 'CHIRIE' | 'AVANS' | 'REST' | null

const PAY_LABEL: Record<'CHIRIE' | 'AVANS' | 'REST', string> = {
  CHIRIE: 'Plătește chiria',
  AVANS: 'Plătește avansul',
  REST: 'Plătește diferența',
}

export function ContractActions({
  contractId,
  canSign,
  canPay,
  dueAmount,
  dueType = 'CHIRIE',
}: {
  contractId: string
  canSign: boolean
  canPay: boolean
  dueAmount: string | null
  dueType?: DueType
}) {
  const { run, loading } = useAction()

  if (!canSign && !canPay) return null

  const isSalePayment = dueType === 'AVANS' || dueType === 'REST'
  const payLabel = `${PAY_LABEL[dueType ?? 'CHIRIE']} (${dueAmount})`
  const paySuccess = isSalePayment ? 'Plata a fost efectuată.' : 'Plata chiriei a fost efectuată.'

  return (
    <div className="mt-4 space-y-3">
      {canSign ? (
        <p className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-soft)] px-4 py-1.5 text-xs font-semibold text-[var(--brand)]">
          Rândul tău să semnezi
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        {canSign ? (
          <Button
            type="button"
            loading={loading}
            onClick={() => run(() => signContractAction(contractId), { success: 'Contract semnat cu QES.' })}
            className="px-5 py-2.5 text-xs"
          >
            Semnează cu QES
          </Button>
        ) : null}
        {canPay ? (
          <Button
            type="button"
            loading={loading}
            onClick={() =>
              run(() => (isSalePayment ? paySaleAction(contractId) : payRentAction(contractId)), { success: paySuccess })
            }
            className="px-5 py-2.5 text-xs"
          >
            {payLabel}
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export function PropertyStatusToggle({ propertyId, status }: { propertyId: string; status: string }) {
  const { run, loading } = useAction()
  // Comutarea listării are sens doar între Disponibilă și Inactivă.
  if (status !== 'Disponibilă' && status !== 'Inactivă') return null
  const inactive = status === 'Inactivă'

  return (
    <div className="mt-3">
      <Button
        type="button"
        variant="outline"
        loading={loading}
        onClick={() =>
          run(() => updatePropertyStatusAction(propertyId, inactive ? 'DISPONIBILA' : 'INACTIVA'), {
            success: inactive ? 'Listare reactivată.' : 'Listare dezactivată.',
          })
        }
        className="px-5 py-2.5 text-xs"
      >
        {inactive ? 'Reactivează listarea' : 'Dezactivează listarea'}
      </Button>
    </div>
  )
}

export function MarkNotificationsRead({ hasUnread }: { hasUnread: boolean }) {
  const { run, loading } = useAction()
  const count = useUnreadCount()
  const setUnread = useSetUnreadCount()
  if (!hasUnread) return null

  const markRead = async () => {
    // Optimist: ascundem badge-ul imediat; revenim dacă cererea eșuează.
    const previous = count
    setUnread(0)
    const ok = await run(() => markNotificationsReadAction(), { success: 'Notificări marcate ca citite.' })
    if (!ok) setUnread(previous)
  }

  return (
    <Button type="button" variant="outline" loading={loading} onClick={markRead} className="px-5 py-2.5 text-xs">
      Marchează tot ca citit
    </Button>
  )
}
