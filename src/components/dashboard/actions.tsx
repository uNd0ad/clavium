'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import { useUnreadCount, useSetUnreadCount } from './NotificationContext'

function useAction() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const run = async (url: string, init?: RequestInit, success?: string, successAction?: { label: string; href: string }) => {
    setLoading(true)
    try {
      const response = await fetch(url, init)
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'A apărut o eroare.')
      if (success) {
        toast.success(
          success,
          successAction ? { action: { label: successAction.label, onClick: () => router.push(successAction.href) } } : undefined
        )
      }
      router.refresh()
      return true
    } catch (err) {
      toast.error((err as Error).message)
      return false
    } finally {
      setLoading(false)
    }
  }

  return { run, loading }
}

export function OfferActions({ offerId }: { offerId: string }) {
  const { run, loading } = useAction()

  const act = (action: 'accept' | 'reject') =>
    run(
      `/api/offers/${offerId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      },
      action === 'accept' ? 'Ofertă acceptată — contractul a fost creat.' : 'Ofertă respinsă.',
      action === 'accept' ? { label: 'Vezi contractul', href: '/dashboard/contracte' } : undefined
    )

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      <Button type="button" loading={loading} onClick={() => act('accept')} className="px-5 py-2.5 text-[12px]">
        Acceptă
      </Button>
      <Button type="button" variant="outline" disabled={loading} onClick={() => act('reject')} className="px-5 py-2.5 text-[12px]">
        Respinge
      </Button>
    </div>
  )
}

export function ContractActions({ contractId, canSign, canPay, dueAmount }: { contractId: string; canSign: boolean; canPay: boolean; dueAmount: string | null }) {
  const { run, loading } = useAction()

  if (!canSign && !canPay) return null

  return (
    <div className="mt-4 space-y-3">
      {canSign ? (
        <p className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-soft)] px-4 py-1.5 text-[12px] font-semibold text-[var(--brand)]">
          Rândul tău să semnezi
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        {canSign ? (
          <Button
            type="button"
            loading={loading}
            onClick={() => run(`/api/contracts/${contractId}/sign`, { method: 'POST' }, 'Contract semnat cu QES.')}
            className="px-5 py-2.5 text-[12px]"
          >
            Semnează cu QES
          </Button>
        ) : null}
        {canPay ? (
          <Button
            type="button"
            loading={loading}
            onClick={() => run(`/api/contracts/${contractId}/pay`, { method: 'POST' }, 'Plata chiriei a fost efectuată.')}
            className="px-5 py-2.5 text-[12px]"
          >
            {`Plătește chiria (${dueAmount})`}
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export function PropertyStatusToggle({ propertyId, status }: { propertyId: string; status: string }) {
  const { run, loading } = useAction()
  if (status === 'Închiriată') return null
  const inactive = status === 'Inactivă'

  return (
    <div className="mt-3">
      <Button
        type="button"
        variant="outline"
        loading={loading}
        onClick={() =>
          run(
            `/api/properties/${propertyId}`,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: inactive ? 'DISPONIBILA' : 'INACTIVA' }),
            },
            inactive ? 'Listare reactivată.' : 'Listare dezactivată.'
          )
        }
        className="px-5 py-2.5 text-[12px]"
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
    const ok = await run('/api/notifications/read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }, 'Notificări marcate ca citite.')
    if (!ok) setUnread(previous)
  }

  return (
    <Button type="button" variant="outline" loading={loading} onClick={markRead} className="px-5 py-2.5 text-[12px]">
      Marchează tot ca citit
    </Button>
  )
}
