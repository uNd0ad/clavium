'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

function useAction() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const run = async (url: string, init?: RequestInit) => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(url, init)
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'A apărut o eroare.')
      router.refresh()
      return true
    } catch (err) {
      setError((err as Error).message)
      return false
    } finally {
      setLoading(false)
    }
  }

  return { run, loading, error }
}

export function OfferActions({ offerId }: { offerId: string }) {
  const { run, loading, error } = useAction()

  const act = (action: 'accept' | 'reject') =>
    run(`/api/offers/${offerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })

  return (
    <div className="mt-4 space-y-2">
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => act('accept')} disabled={loading} className="btn-primary px-5 py-2.5 text-[12px]">
          Acceptă
        </button>
        <button type="button" onClick={() => act('reject')} disabled={loading} className="btn-outline px-5 py-2.5 text-[12px]">
          Respinge
        </button>
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  )
}

export function ContractActions({ contractId, canSign, canPay, dueAmount }: { contractId: string; canSign: boolean; canPay: boolean; dueAmount: string | null }) {
  const { run, loading, error } = useAction()

  if (!canSign && !canPay) return error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null

  return (
    <div className="mt-4 space-y-2">
      <div className="flex flex-wrap gap-3">
        {canSign ? (
          <button
            type="button"
            onClick={() => run(`/api/contracts/${contractId}/sign`, { method: 'POST' })}
            disabled={loading}
            className="btn-primary px-5 py-2.5 text-[12px]"
          >
            {loading ? 'Se semnează…' : 'Semnează cu QES'}
          </button>
        ) : null}
        {canPay ? (
          <button
            type="button"
            onClick={() => run(`/api/contracts/${contractId}/pay`, { method: 'POST' })}
            disabled={loading}
            className="btn-primary px-5 py-2.5 text-[12px]"
          >
            {loading ? 'Se procesează…' : `Plătește chiria (${dueAmount})`}
          </button>
        ) : null}
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  )
}

export function PropertyStatusToggle({ propertyId, status }: { propertyId: string; status: string }) {
  const { run, loading, error } = useAction()
  if (status === 'Închiriată') return null
  const inactive = status === 'Inactivă'

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() =>
          run(`/api/properties/${propertyId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: inactive ? 'DISPONIBILA' : 'INACTIVA' }),
          })
        }
        disabled={loading}
        className="btn-outline px-5 py-2.5 text-[12px]"
      >
        {inactive ? 'Reactivează listarea' : 'Dezactivează listarea'}
      </button>
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
    </div>
  )
}

export function MarkNotificationsRead({ hasUnread }: { hasUnread: boolean }) {
  const { run, loading } = useAction()
  if (!hasUnread) return null

  return (
    <button
      type="button"
      onClick={() => run('/api/notifications/read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })}
      disabled={loading}
      className="btn-outline px-5 py-2.5 text-[12px]"
    >
      Marchează tot ca citit
    </button>
  )
}
