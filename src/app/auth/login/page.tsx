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
  // Provocarea 2FA: ce flux a cerut-o (parolă / OTP) + codul al doilea factor.
  const [needs2fa, setNeeds2fa] = useState<LoginTab | null>(null)
  const [totpCode, setTotpCode] = useState('')
  const resendCooldown = useCooldown(30)

  const switchMode = (next: LoginTab) => {
    window.localStorage.setItem(LOGIN_TAB_KEY, next)
    // `storage` nu se declanșează în tab-ul curent — îl emitem manual ca store-ul să re-citească.
    window.dispatchEvent(new StorageEvent('storage', { key: LOGIN_TAB_KEY }))
  }

  const submitPassword = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, totpCode: totpCode || undefined }),
      })
      const data = await response.json()
      if (data.twoFactorRequired) {
        setNeeds2fa('password')
        return
      }
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

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void submitPassword()
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
        body: JSON.stringify({ email, code: otp, totpCode: totpCode || undefined }),
      })
      const data = await response.json()
      if (data.twoFactorRequired) {
        setNeeds2fa('otp')
        return
      }
      if (!response.ok) throw new Error(data.error || 'A apărut o eroare.')
      toast.success(`Autentificare reușită. Bun venit, ${data.user.firstName}!`)
      router.push('/dashboard')
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  // Confirmarea celui de-al doilea factor: re-trimitem fluxul originar, acum cu codul 2FA.
  const confirm2fa = () => {
    if (needs2fa === 'password') void submitPassword()
    else void handleOtpVerify()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-[var(--text)]">Bine ai revenit</h1>
        <p className="mt-2 text-base text-[var(--muted)]">
          Nu ai cont încă?{' '}
          <a href="/auth/register" className="font-semibold text-[var(--brand)]">Înregistrează-te gratuit</a>
        </p>
      </div>

      {needs2fa ? (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text)]">Verificare în doi pași</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Introdu codul din aplicația de autentificare (sau un cod de rezervă).
            </p>
          </div>
          <FormField
            label="Cod de autentificare"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={totpCode}
            onChange={(event) => setTotpCode(event.target.value)}
            placeholder="123456"
          />
          <Button type="button" loading={loading} disabled={totpCode.trim().length < 6} onClick={confirm2fa} className="w-full py-4 text-sm">
            Confirmă
          </Button>
          <button
            type="button"
            onClick={() => { setNeeds2fa(null); setTotpCode('') }}
            className="text-sm font-semibold text-[var(--brand)]"
          >
            Înapoi
          </button>
        </div>
      ) : (
        <>
      <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
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
          <Button type="submit" loading={loading} className="w-full py-4 text-sm">
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
            <Button type="button" variant="outline" loading={loading} disabled={resendCooldown.active} onClick={handleOtpSend} className="w-full py-4 text-sm">
              {resendCooldown.active ? `Retrimite în ${resendCooldown.remaining}s` : otpSent ? 'Retrimite codul' : 'Trimite cod OTP'}
            </Button>
            <Button type="button" loading={loading} disabled={otp.length < 6} onClick={handleOtpVerify} className="w-full py-4 text-sm">
              Verifică cod OTP
            </Button>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Cod OTP
            </label>
            <OtpInput value={otp} onChange={setOtp} />
          </div>
        </div>
      )}
        </>
      )}
    </div>
  )
}
