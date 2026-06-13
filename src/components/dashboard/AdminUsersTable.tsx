'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import StatusBadge from '@/components/dashboard/StatusBadge'

export type AdminUserRow = {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
  isSelf: boolean
}

const ROLES = ['CLIENT', 'OWNER', 'ADMIN'] as const

export default function AdminUsersTable({ users }: { users: AdminUserRow[] }) {
  const router = useRouter()
  const [busyId, setBusyId] = useState<string | null>(null)

  const update = async (id: string, body: { role?: string; isActive?: boolean }) => {
    setBusyId(id)
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'A apărut o eroare.')
      toast.success('Utilizator actualizat.')
      router.refresh()
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div key={user.id} className="rounded-[24px] border border-[var(--border)] bg-white p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-semibold">
                {user.name} {user.isSelf ? <span className="text-[12px] font-normal text-[var(--muted)]">(tu)</span> : null}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">{user.email} · membru din {user.createdAt}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge label={user.isActive ? 'Activ' : 'Dezactivat'} variant={user.isActive ? 'success' : 'danger'} />
              <select
                value={user.role}
                disabled={user.isSelf || busyId === user.id}
                onChange={(event) => update(user.id, { role: event.target.value })}
                className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-[13px] font-semibold outline-none transition focus:border-[var(--brand)]"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <button
                type="button"
                disabled={user.isSelf || busyId === user.id}
                onClick={() => update(user.id, { isActive: !user.isActive })}
                className="btn-outline px-5 py-2 text-[12px]"
              >
                {user.isActive ? 'Dezactivează' : 'Reactivează'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
