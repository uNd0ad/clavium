'use client'

import { Suspense, useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'

function ResetForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/auth/reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'A apărut o eroare.')
      setDone(true)
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (password !== confirmPassword) {
      toast.error('Parolele nu se potrivesc.')
      return
    }
    setLoading(true)
    try {
      const response = await fetch('/api/auth/reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'A apărut o eroare.')
      toast.success('Parola a fost resetată. Te poți autentifica.')
      setTimeout(() => router.push('/auth/login'), 1200)
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-[var(--text)]">{token ? 'Setează o parolă nouă' : 'Resetează parola'}</h1>
        <p className="mt-2 text-[15px] text-[var(--muted)]">
          {token ? 'Alege o parolă nouă pentru contul tău.' : 'Introdu adresa de email și îți trimitem un link de resetare.'}
        </p>
      </div>

      {done ? (
        <p className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5 text-sm font-semibold text-emerald-800">
          Dacă există un cont cu această adresă, vei primi un email cu linkul de resetare.
        </p>
      ) : token ? (
        <form onSubmit={handleConfirm} className="space-y-5">
          <FormField label="Parola nouă" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          <FormField label="Confirmă parola" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
          <Button type="submit" loading={loading} disabled={password.length < 8} className="w-full py-4 text-[14px]">
            Resetează parola
          </Button>
        </form>
      ) : (
        <form onSubmit={handleRequest} className="space-y-5">
          <FormField label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="exemplu@domeniu.ro" required />
          <Button type="submit" loading={loading} className="w-full py-4 text-[14px]">
            Trimite link de resetare
          </Button>
        </form>
      )}

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
