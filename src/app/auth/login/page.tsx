'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import FormField from '@/components/ui/FormField'
import OtpInput from '@/components/ui/OtpInput'

const defaultMessage = 'Alege metoda de autentificare.'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'password' | 'otp'>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [status, setStatus] = useState(defaultMessage)
  const [loading, setLoading] = useState(false)

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setStatus('Se verifică...')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'A apărut o eroare.')
      setStatus(`Bine ai venit, ${data.user.firstName}!`)
      router.push('/')
    } catch (error) {
      setStatus((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSend = async () => {
    if (!email) {
      setStatus('Completează adresa de email înainte de a trimite OTP.')
      return
    }
    setLoading(true)
    setStatus('Se trimite codul...')

    try {
      const response = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'A apărut o eroare.')
      setStatus('Codul OTP a fost trimis. Verifică inbox-ul sau continuă să introduci codul.')
    } catch (error) {
      setStatus((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleOtpVerify = async () => {
    setLoading(true)
    setStatus('Se verifică codul OTP...')

    try {
      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'A apărut o eroare.')
      setStatus(`Autentificare reușită. Bun venit, ${data.user.firstName}!`)
      router.push('/')
    } catch (error) {
      setStatus((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4 text-[13px] text-[var(--muted)]">
        <button
          type="button"
          onClick={() => setMode('password')}
          className={`rounded-full px-5 py-2 transition ${mode === 'password' ? 'bg-[var(--brand)] text-white' : 'bg-transparent text-[var(--text)] hover:text-[var(--brand)]'}`}
        >
          Parolă
        </button>
        <button
          type="button"
          onClick={() => setMode('otp')}
          className={`rounded-full px-5 py-2 transition ${mode === 'otp' ? 'bg-[var(--brand)] text-white' : 'bg-transparent text-[var(--text)] hover:text-[var(--brand)]'}`}
        >
          OTP
        </button>
      </div>

      {mode === 'password' ? (
        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          <FormField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="exemplu@domeniu.ro" />
          <FormField label="Parolă" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" />
          <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-[14px]">
            {loading ? 'Se conectează…' : 'Conectează-te'}
          </button>
        </form>
      ) : (
        <div className="space-y-5">
          <FormField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="exemplu@domeniu.ro" />
          <div className="grid gap-4 sm:grid-cols-2">
            <button type="button" onClick={handleOtpSend} disabled={loading} className="btn-outline w-full py-4 text-[14px]">
              {loading ? 'Se trimite…' : 'Trimite cod OTP'}
            </button>
            <button type="button" onClick={handleOtpVerify} disabled={loading || otp.length < 6} className="btn-primary w-full py-4 text-[14px]">
              {loading ? 'Se verifică…' : 'Verifică cod OTP'}
            </button>
          </div>
          <div>
            <label className="mb-2 block text-[13px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Cod OTP
            </label>
            <OtpInput value={otp} onChange={setOtp} />
          </div>
        </div>
      )}

      <p className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
        {status}
      </p>
    </div>
  )
}
