'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Home, KeyRound, Check } from 'lucide-react'
import FormField from '@/components/ui/FormField'
import OtpInput from '@/components/ui/OtpInput'
import Button from '@/components/ui/Button'
import { useCooldown } from '@/hooks/useCooldown'
import type { UserRole } from '@/lib/types/roles'

const steps = ['Informații cont', 'Parolă', 'Verificare telefon', 'Finalizare']

const roleOptions: { value: UserRole; title: string; description: string; icon: typeof Home }[] = [
  { value: 'CLIENT', title: 'Client', description: 'Caut o locuință: trimit oferte, semnez contracte și plătesc chiria online.', icon: KeyRound },
  { value: 'OWNER', title: 'Proprietar', description: 'Dețin proprietăți: primesc oferte, gestionez contracte și încasez chirii.', icon: Home },
]

const REDIRECT_SECONDS = 5

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('CLIENT')
  const [accountType, setAccountType] = useState<'PERSON' | 'COMPANY'>('PERSON')
  const [companyName, setCompanyName] = useState('')
  const [companyCui, setCompanyCui] = useState('')
  const [companyReg, setCompanyReg] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')
  const [companyVatPayer, setCompanyVatPayer] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS)
  const resendCooldown = useCooldown(30)

  useEffect(() => {
    if (!registered) return
    if (countdown <= 0) {
      router.push('/dashboard')
      return
    }
    const timer = setTimeout(() => setCountdown((value) => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [registered, countdown, router])

  const handleNext = () => {
    if (step === 0) {
      if (!firstName || !lastName || !email) {
        toast.error('Completează prenumele, numele de familie și email-ul pentru a continua.')
        return
      }
      if (accountType === 'COMPANY' && (!companyName || !companyCui || !companyReg)) {
        toast.error('Completează datele firmei: denumire, CUI și nr. de înregistrare.')
        return
      }
    }
    if (step === 1 && (password.length < 8 || password !== confirmPassword)) {
      toast.error('Parola trebuie să aibă cel puțin 8 caractere și să se potrivească.')
      return
    }
    if (step === 2 && !phoneVerified) {
      toast.error('Verifică numărul de telefon prin codul OTP înainte de a continua.')
      return
    }
    setStep(Math.min(step + 1, steps.length - 1))
  }

  const handleBack = () => setStep(Math.max(step - 1, 0))

  const handleSendPhoneOtp = async () => {
    if (!phone) {
      toast.error('Completează numărul de telefon înainte de a trimite codul.')
      return
    }
    setLoading(true)
    try {
      const response = await fetch('/api/auth/phone-otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'A apărut o eroare.')
      setOtpSent(true)
      resendCooldown.start()
      toast.success('Cod trimis prin SMS. Introdu cele 6 cifre.')
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyPhoneOtp = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/phone-otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otp }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'A apărut o eroare.')
      setPhoneVerified(true)
      toast.success('Numărul de telefon a fost verificat.')
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (registered) {
      router.push('/dashboard')
      return
    }

    if (step < 3) {
      handleNext()
      return
    }

    if (!consent) {
      toast.error('Trebuie să accepți termenii și politica de confidențialitate pentru a continua.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          role,
          phone,
          accountType,
          ...(accountType === 'COMPANY'
            ? { companyName, companyCui, companyReg, companyAddress: companyAddress || undefined, companyVatPayer }
            : {}),
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'A apărut o eroare.')
      toast.success(`Cont creat! Bine ai venit, ${data.user.firstName}.`)
      setRegistered(true)
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (registered) {
    return (
      <div className="step-transition space-y-6">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-[var(--text)] dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <h3 className="text-xl font-semibold">Contul a fost creat!</h3>
          <p className="mt-3 text-base text-[var(--muted)]">
            Te-ai înregistrat cu succes ca {role === 'OWNER' ? 'proprietar' : 'client'}. Vei fi redirecționat către dashboard în{' '}
            <span className="font-semibold text-[var(--text)]">{countdown}</span> {countdown === 1 ? 'secundă' : 'secunde'}.
          </p>
        </div>
        <button type="button" onClick={() => router.push('/dashboard')} className="btn-primary w-full py-4 text-sm">
          Mergi acum la dashboard
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[var(--text)]">Creează-ți contul</h1>
        <p className="mt-2 text-base text-[var(--muted)]">
          Ai deja cont?{' '}
          <a href="/auth/login" className="font-semibold text-[var(--brand)]">Conectează-te</a>
        </p>
      </div>

      <div className="rounded-3xl bg-[var(--surface)] p-5">
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-3">
          {steps.map((label, index) => {
            const done = index < step
            const active = index === step
            return (
              <div key={label} className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!done}
                  onClick={() => done && setStep(index)}
                  title={done ? `Înapoi la „${label}”` : undefined}
                  className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? 'border-[var(--brand)] bg-[var(--brand)] text-white'
                      : done
                        ? 'cursor-pointer border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:border-emerald-500/60'
                        : 'cursor-default border-[var(--border)] text-[var(--muted)]'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-2xs ${
                      active ? 'bg-white/20' : done ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-[var(--border)]/40'
                    }`}
                  >
                    {done ? <Check size={12} strokeWidth={3} /> : index + 1}
                  </span>
                  <span className="whitespace-nowrap">{label}</span>
                </button>
                {index < steps.length - 1 ? (
                  <span className={`h-px w-4 shrink-0 ${done ? 'bg-emerald-300 dark:bg-emerald-500/40' : 'bg-[var(--border)]'}`} />
                ) : null}
              </div>
            )
          })}
        </div>

        <div key={step} className="step-transition">
          {step === 0 && (
            <div className="space-y-5">
              <div className="flex gap-2 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-2 text-sm">
                {([['PERSON', 'Persoană fizică'], ['COMPANY', 'Persoană juridică']] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setAccountType(value)}
                    className={`flex-1 rounded-full px-5 py-2.5 font-semibold transition ${accountType === value ? 'bg-[var(--brand)] text-white' : 'text-[var(--muted)] hover:text-[var(--brand)]'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {roleOptions.map((option) => {
                  const Icon = option.icon
                  const selected = role === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRole(option.value)}
                      className={`rounded-3xl border p-5 text-left transition ${selected ? 'border-[var(--brand)] bg-[var(--brand-soft)]' : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--brand)]'}`}
                    >
                      <Icon size={22} className={selected ? 'text-[var(--brand)]' : 'text-[var(--muted)]'} />
                      <p className="mt-3 font-semibold">{option.title}</p>
                      <p className="mt-2 text-sm leading-5 text-[var(--muted)]">{option.description}</p>
                    </button>
                  )
                })}
              </div>

              {accountType === 'COMPANY' ? (
                <div className="space-y-5 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Date firmă</p>
                  <FormField label="Denumire firmă" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Exemplu SRL" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="CUI / CIF" value={companyCui} onChange={(e) => setCompanyCui(e.target.value)} placeholder="RO12345678" />
                    <FormField label="Nr. înregistrare (ORC)" value={companyReg} onChange={(e) => setCompanyReg(e.target.value)} placeholder="J40/1234/2020" />
                  </div>
                  <FormField label="Adresă sediu (opțional)" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} placeholder="Str. Exemplu nr. 1, București" />
                  <label className="flex cursor-pointer items-center gap-3 text-sm text-[var(--muted)]">
                    <input type="checkbox" checked={companyVatPayer} onChange={(e) => setCompanyVatPayer(e.target.checked)} className="h-4 w-4 accent-[var(--brand)]" />
                    Plătitor de TVA
                  </label>
                </div>
              ) : null}

              <FormField label={accountType === 'COMPANY' ? 'Prenume reprezentant legal' : 'Prenume'} value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="Ion" />
              <FormField label={accountType === 'COMPANY' ? 'Nume reprezentant legal' : 'Nume de familie'} value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="Popescu" />
              <FormField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="exemplu@domeniu.ro" />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <FormField
                label="Parolă"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                error={password && password.length < 8 ? 'Parola trebuie să aibă cel puțin 8 caractere.' : undefined}
              />
              <FormField
                label="Confirmă parola"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="••••••••"
                error={confirmPassword && confirmPassword !== password ? 'Parolele nu se potrivesc.' : undefined}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <FormField
                label="Număr de telefon"
                type="tel"
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value)
                  setOtpSent(false)
                  setPhoneVerified(false)
                  setOtp('')
                }}
                placeholder="07XX XXX XXX"
                disabled={phoneVerified}
              />
              {phoneVerified ? (
                <p className="flex items-center gap-2 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <Check size={16} strokeWidth={3} className="shrink-0" />
                  Numărul de telefon a fost verificat.
                </p>
              ) : (
                <>
                  <Button type="button" variant="outline" loading={loading} disabled={resendCooldown.active} onClick={handleSendPhoneOtp} className="w-full py-4 text-sm">
                    {resendCooldown.active ? `Retrimite în ${resendCooldown.remaining}s` : otpSent ? 'Retrimite codul SMS' : 'Trimite cod SMS'}
                  </Button>
                  {otpSent ? (
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                          Cod OTP
                        </label>
                        <OtpInput value={otp} onChange={setOtp} />
                      </div>
                      <Button type="button" loading={loading} disabled={otp.length < 6} onClick={handleVerifyPhoneOtp} className="w-full py-4 text-sm">
                        Verifică codul
                      </Button>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-base text-[var(--muted)] leading-7">
                Verifică datele și continuă pentru a finaliza înregistrarea.
              </p>
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 text-sm text-[var(--text)]">
                <p className="font-semibold">Rezumat cont</p>
                <p className="mt-3">Tip: {accountType === 'COMPANY' ? 'Persoană juridică' : 'Persoană fizică'} · {role === 'OWNER' ? 'Proprietar' : 'Client'}</p>
                {accountType === 'COMPANY' ? (
                  <>
                    <p>Firmă: {companyName || '—'}</p>
                    <p>CUI: {companyCui || '—'} · Reg: {companyReg || '—'}</p>
                    <p>Reprezentant: {firstName || '—'} {lastName || '—'}</p>
                  </>
                ) : (
                  <>
                    <p>Prenume: {firstName || '—'}</p>
                    <p>Nume de familie: {lastName || '—'}</p>
                  </>
                )}
                <p>Email: {email || '—'}</p>
                <p>Telefon: {phone || '—'} {phoneVerified ? '(verificat)' : ''}</p>
                <p>Parolă: {password ? 'Setată' : 'Nedefinită'}</p>
              </div>
              <label className="flex cursor-pointer items-start gap-3 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 text-sm leading-6 text-[var(--muted)]">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                  className="mt-1 h-4 w-4 accent-[var(--brand)]"
                />
                <span>
                  Am citit și accept{' '}
                  <a href="/termeni" target="_blank" className="font-semibold text-[var(--brand)]">termenii și condițiile</a> și{' '}
                  <a href="/confidentialitate" target="_blank" className="font-semibold text-[var(--brand)]">politica de confidențialitate</a>.
                </span>
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="outline" onClick={handleBack} disabled={step === 0 || loading} className="w-full py-4 text-sm sm:w-auto">
          Înapoi
        </Button>
        <Button type="submit" loading={loading} className="w-full py-4 text-sm sm:w-auto">
          {step === 3 ? 'Creează cont' : 'Continuă'}
        </Button>
      </div>
    </form>
  )
}
