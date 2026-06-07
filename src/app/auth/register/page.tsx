'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import FormField from '@/components/ui/FormField'

const steps = ['Informații cont', 'Parolă', 'Detalii', 'Finalizare']

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState('Completează pașii pentru a crea contul.')
  const [loading, setLoading] = useState(false)

  const handleNext = () => {
    if (step === 0 && (!name || !email)) {
      setStatus('Completează numele și email-ul pentru a continua.')
      return
    }
    if (step === 1 && (password.length < 8 || password !== confirmPassword)) {
      setStatus('Parola trebuie să aibă cel puțin 8 caractere și să se potrivească.')
      return
    }
    setStatus('')
    setStep(Math.min(step + 1, steps.length - 1))
  }

  const handleBack = () => setStep(Math.max(step - 1, 0))

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (step === 3) {
      router.push('/')
      return
    }

    if (step < 2) {
      handleNext()
      return
    }

    setLoading(true)
    setStatus('Se creează contul...')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'A apărut o eroare.')
      setStep(3)
      setStatus(`Cont creat! Bine ai venit, ${data.user.name}.`)
      router.push('/')
    } catch (error) {
      setStatus((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="rounded-[24px] bg-[var(--surface)] p-5">
        <div className="mb-6 flex items-center gap-4 overflow-x-auto pb-3">
          {steps.map((label, index) => (
            <div key={label} className={`min-w-[8rem] rounded-full border px-4 py-2 text-center text-[13px] font-semibold transition ${index === step ? 'border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--text)]' : 'border-[var(--border)] text-[var(--muted)]'}`}>
              {label}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-5">
            <FormField label="Nume complet" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ion Popescu" />
            <FormField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="exemplu@domeniu.ro" />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <FormField label="Parolă" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" />
            <FormField label="Confirmă parola" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="••••••••" />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-[15px] text-[var(--muted)] leading-7">
              Ai ales un cont Clavium.ro care te va ajuta să cauți, negociezi și semnezi contracte online. Verifică datele și continuă pentru a finaliza înregistrarea.
            </p>
            <div className="rounded-[24px] border border-[var(--border)] bg-white p-5 text-sm text-[var(--text)]">
              <p className="font-semibold">Rezumat cont</p>
              <p className="mt-3">Nume: {name || '—'}</p>
              <p>Email: {email || '—'}</p>
              <p>Parolă: {password ? 'Setată' : 'Nedefinită'}</p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-6 text-[var(--text)]">
            <h3 className="text-xl font-semibold">Contul a fost creat!</h3>
            <p className="mt-3 text-[15px] text-[var(--muted)]">Te-ai înregistrat cu succes și poți folosi acum autentificarea prin parolă sau OTP.</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={handleBack} disabled={step === 0 || loading} className="btn-outline w-full py-4 text-[14px] sm:w-auto">
          Înapoi
        </button>
        <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-[14px] sm:w-auto">
          {step === 3 ? 'Gata' : step === 2 ? 'Creează cont' : 'Continuă'}
        </button>
      </div>

      <p className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
        {status}
      </p>
    </form>
  )
}
