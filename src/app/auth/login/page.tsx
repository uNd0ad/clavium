'use client'

import { useState, useSyncExternalStore, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import FormField from '@/components/ui/FormField'
import OtpInput from '@/components/ui/OtpInput'
import Button from '@/components/ui/Button'
import { useCooldown } from '@/hooks/useCooldown'

const LOGIN_TAB_KEY = 'clavium_login_tab'
type LoginTab = 'password' | 'otp'

// Citim tab-ul memorat dintr-un „external store” (localStorage) prin useSyncExternalStore,
// nu printr-un useEffect cu setState — evită atât renderurile în cascadă, cât și flash-ul
// de hidratare (serverul randează mereu 'password', clientul corectează imediat).
function subscribeTab(onChange: () => void) {
  window.addEventListener('storage', onChange)
  return () => window.removeEventListener('storage', onChange)
}

function readTab(): LoginTab {
  return window.localStorage.getItem(LOGIN_TAB_KEY) === 'otp' ? 'otp' : 'password'
}

export default function LoginPage() {
  const router = useRouter()
  const mode = useSyncExternalStore(subscribeTab, readTab, () => 'password' as LoginTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const resendCooldown = useCooldown(30)

  const switchMode = (next: LoginTab) => {
    window.localStorage.setItem(LOGIN_TAB_KEY, next)
    // `storage` nu se declanșează în tab-ul curent — îl emitem manual ca store-ul să re-citească.
    window.dispatchEvent(new StorageEvent('storage', { key: LOGIN_TAB_KEY }))
  }

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (!response.ok) {
        toast.error(data.error || 'Email sau parolă incorectă.')
        return
      }
      toast.success(`Bine ai venit, ${data.user.firstName}!`)
      router.push('/dashboard')
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSend = async () => {
    if (!email) {
      toast.error('Completează adresa de email înainte de a trimite codul.')
      return
    }
    setLoading(true)
    try {
      const response = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'A apărut o eroare.')
      setOtpSent(true)
      resendCooldown.start()
      toast.success('Cod trimis. Verifică inbox-ul și introdu cele 6 cifre.')
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleOtpVerify = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'A apărut o eroare.')
      toast.success(`Autentificare reușită. Bun venit, ${data.user.firstName}!`)
      router.push('/dashboard')
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-[var(--text)]">Bine ai revenit</h1>
        <p className="mt-2 text-[15px] text-[var(--muted)]">
          Nu ai cont încă?{' '}
          <a href="/auth/register" className="font-semibold text-[var(--brand)]">Înregistrează-te gratuit</a>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4 text-[13px] text-[var(--muted)]">
        <button
          type="button"
          onClick={() => switchMode('password')}
          className={`rounded-full px-5 py-2 transition ${mode === 'password' ? 'bg-[var(--brand)] text-white' : 'bg-transparent text-[var(--text)] hover:text-[var(--brand)]'}`}
        >
          Parolă
        </button>
        <button
          type="button"
          onClick={() => switchMode('otp')}
          className={`rounded-full px-5 py-2 transition ${mode === 'otp' ? 'bg-[var(--brand)] text-white' : 'bg-transparent text-[var(--text)] hover:text-[var(--brand)]'}`}
        >
          OTP
        </button>
      </div>

      {mode === 'password' ? (
        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          <FormField label="Email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="exemplu@domeniu.ro" />
          <FormField label="Parolă" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" />
          <Button type="submit" loading={loading} className="w-full py-4 text-[14px]">
            Conectează-te
          </Button>
          <p className="text-sm text-[var(--muted)]">
            <a href="/auth/reset-parola" className="font-semibold text-[var(--brand)]">Ai uitat parola?</a>
          </p>
        </form>
      ) : (
        <div className="space-y-5">
          <FormField label="Email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="exemplu@domeniu.ro" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Button type="button" variant="outline" loading={loading} disabled={resendCooldown.active} onClick={handleOtpSend} className="w-full py-4 text-[14px]">
              {resendCooldown.active ? `Retrimite în ${resendCooldown.remaining}s` : otpSent ? 'Retrimite codul' : 'Trimite cod OTP'}
            </Button>
            <Button type="button" loading={loading} disabled={otp.length < 6} onClick={handleOtpVerify} className="w-full py-4 text-[14px]">
              Verifică cod OTP
            </Button>
          </div>
          <div>
            <label className="mb-2 block text-[13px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Cod OTP
            </label>
            <OtpInput value={otp} onChange={setOtp} />
          </div>
        </div>
      )}
    </div>
  )
}
