'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import FormField from '@/components/ui/FormField'

type ProfileFormsProps = {
  firstName: string
  lastName: string
  phone: string
  emailVerified: boolean
}

export default function ProfileForms({ firstName: initialFirst, lastName: initialLast, phone: initialPhone, emailVerified }: ProfileFormsProps) {
  const router = useRouter()
  const [firstName, setFirstName] = useState(initialFirst)
  const [lastName, setLastName] = useState(initialLast)
  const [phone, setPhone] = useState(initialPhone)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const post = async (url: string, init: RequestInit, success: string) => {
    setLoading(true)
    setStatus('')
    try {
      const response = await fetch(url, init)
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'A apărut o eroare.')
      setStatus(success)
      router.refresh()
      return true
    } catch (error) {
      setStatus((error as Error).message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    post(
      '/api/profile',
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, phone: phone || undefined }),
      },
      'Profilul a fost actualizat.'
    )
  }

  const handlePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const ok = await post(
      '/api/profile/password',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      },
      'Parola a fost schimbată. Celelalte sesiuni au fost deconectate.'
    )
    if (ok) {
      setCurrentPassword('')
      setNewPassword('')
    }
  }

  const handleResendVerification = () =>
    post('/api/auth/verify-email/send', { method: 'POST' }, 'Email de verificare trimis. Verifică inbox-ul (sau consola serverului în dev).')

  const handleDeactivate = async () => {
    if (!window.confirm('Sigur vrei să dezactivezi contul? Nu te vei mai putea autentifica.')) return
    const ok = await post('/api/profile', { method: 'DELETE' }, '')
    if (ok) {
      router.push('/')
    }
  }

  return (
    <div className="space-y-6">
      {!emailVerified ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-amber-200 bg-amber-50 p-5 text-sm">
          <p className="font-semibold text-amber-800">Adresa de email nu este verificată.</p>
          <button type="button" onClick={handleResendVerification} disabled={loading} className="btn-outline px-5 py-2.5 text-[12px]">
            Retrimite emailul de verificare
          </button>
        </div>
      ) : null}

      <form onSubmit={handleProfile} className="space-y-4 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="text-xl font-semibold">Editează profilul</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Prenume" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          <FormField label="Nume de familie" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>
        <FormField label="Telefon" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XX XXX XXX" />
        <p className="text-[13px] text-[var(--muted)]">Schimbarea numărului de telefon necesită o nouă verificare OTP.</p>
        <button type="submit" disabled={loading} className="btn-primary px-6 py-3 text-[13px]">
          {loading ? 'Se salvează…' : 'Salvează modificările'}
        </button>
      </form>

      <form onSubmit={handlePassword} className="space-y-4 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="text-xl font-semibold">Schimbă parola</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Parola actuală" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          <FormField label="Parola nouă" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading || newPassword.length < 8} className="btn-primary px-6 py-3 text-[13px]">
          {loading ? 'Se schimbă…' : 'Schimbă parola'}
        </button>
      </form>

      <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="text-xl font-semibold">Datele tale (GDPR)</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Descarcă o copie a tuturor datelor asociate contului tău.</p>
        <a href="/api/profile/export" className="btn-outline mt-4 inline-flex px-6 py-3 text-[13px]">
          Descarcă datele mele (JSON)
        </a>
      </div>

      <div className="rounded-[32px] border border-rose-200 bg-rose-50/50 p-6">
        <h2 className="text-xl font-semibold text-rose-800">Danger zone</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Dezactivarea contului este permanentă — nu te vei mai putea autentifica.</p>
        <button type="button" onClick={handleDeactivate} disabled={loading} className="mt-4 rounded-full border border-rose-300 bg-white px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-rose-800 transition hover:bg-rose-100">
          Dezactivează contul
        </button>
      </div>

      {status ? (
        <p className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">{status}</p>
      ) : null}
    </div>
  )
}
