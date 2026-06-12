'use client'

import { Suspense, useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import FormField from '@/components/ui/FormField'

function ResetForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState(
    token ? 'Setează parola nouă.' : 'Introdu adresa de email și îți trimitem un link de resetare.'
  )
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setStatus('Se trimite...')
    try {
      const response = await fetch('/api/auth/reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'A apărut o eroare.')
      setDone(true)
      setStatus('Dacă există un cont cu această adresă, vei primi un email cu linkul de resetare.')
    } catch (error) {
      setStatus((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (password !== confirmPassword) {
      setStatus('Parolele nu se potrivesc.')
      return
    }
    setLoading(true)
    setStatus('Se resetează parola...')
    try {
      const response = await fetch('/api/auth/reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'A apărut o eroare.')
      setStatus('Parola a fost resetată. Te poți autentifica.')
      setTimeout(() => router.push('/auth/login'), 1500)
    } catch (error) {
      setStatus((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {token ? (
        <form onSubmit={handleConfirm} className="space-y-5">
          <FormField label="Parola nouă" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          <FormField label="Confirmă parola" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
          <button type="submit" disabled={loading || password.length < 8} className="btn-primary w-full py-4 text-[14px]">
            {loading ? 'Se resetează…' : 'Resetează parola'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRequest} className="space-y-5">
          <FormField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="exemplu@domeniu.ro" required />
          <button type="submit" disabled={loading || done} className="btn-primary w-full py-4 text-[14px]">
            {loading ? 'Se trimite…' : 'Trimite link de resetare'}
          </button>
        </form>
      )}

      <p className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">{status}</p>

      <p className="text-sm text-[var(--muted)]">
        <a href="/auth/login" className="font-semibold text-[var(--brand)]">Înapoi la autentificare</a>
      </p>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  )
}
