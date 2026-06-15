'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import FormField from '@/components/ui/FormField'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { updateProfileAction, changePasswordAction, deactivateAccountAction } from '@/app/actions/profile'

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
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const runAction = async (action: () => Promise<{ ok: boolean; error?: string }>, success?: string) => {
    setLoading(true)
    const res = await action()
    if (res.ok) {
      if (success) toast.success(success)
    } else {
      toast.error(res.error || 'A apărut o eroare.')
    }
    setLoading(false)
    return res.ok
  }

  const handleProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    runAction(() => updateProfileAction({ firstName, lastName, phone: phone || undefined }), 'Profilul a fost actualizat.')
  }

  const handlePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const ok = await runAction(
      () => changePasswordAction({ currentPassword, newPassword }),
      'Parola a fost schimbată. Celelalte sesiuni au fost deconectate.'
    )
    if (ok) {
      setCurrentPassword('')
      setNewPassword('')
    }
  }

  // Retrimiterea emailului de verificare rămâne pe ruta de auth (trimite email + rate limit).
  const handleResendVerification = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/verify-email/send', { method: 'POST' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'A apărut o eroare.')
      toast.success('Email de verificare trimis. Verifică inbox-ul (sau consola serverului în dev).')
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivate = async () => {
    const ok = await runAction(() => deactivateAccountAction())
    if (ok) {
      setConfirmOpen(false)
      toast.success('Contul a fost dezactivat.')
      router.push('/')
    }
  }

  return (
    <div className="space-y-6">
      {!emailVerified ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm dark:border-amber-500/30 dark:bg-amber-500/10">
          <p className="font-semibold text-amber-800 dark:text-amber-300">Adresa de email nu este verificată.</p>
          <Button type="button" variant="outline" loading={loading} onClick={handleResendVerification} className="px-5 py-2.5 text-xs">
            Retrimite emailul de verificare
          </Button>
        </div>
      ) : null}

      <form onSubmit={handleProfile} className="space-y-4 rounded-4xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="text-xl font-semibold">Editează profilul</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Prenume" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          <FormField label="Nume de familie" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>
        <FormField label="Telefon" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XX XXX XXX" />
        <p className="text-sm text-[var(--muted)]">Schimbarea numărului de telefon necesită o nouă verificare OTP.</p>
        <Button type="submit" loading={loading} className="px-6 py-3 text-sm">
          Salvează modificările
        </Button>
      </form>

      <form onSubmit={handlePassword} className="space-y-4 rounded-4xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="text-xl font-semibold">Schimbă parola</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Parola actuală" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          <FormField label="Parola nouă" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        </div>
        <Button type="submit" loading={loading} disabled={newPassword.length < 8} className="px-6 py-3 text-sm">
          Schimbă parola
        </Button>
      </form>

      <div className="rounded-4xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="text-xl font-semibold">Datele tale (GDPR)</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Descarcă o copie a tuturor datelor asociate contului tău.</p>
        <a href="/api/profile/export" className="btn-outline mt-4 inline-flex px-6 py-3 text-sm">
          Descarcă datele mele (JSON)
        </a>
      </div>

      <div className="rounded-4xl border border-rose-200 bg-rose-50/50 p-6 dark:border-rose-500/30 dark:bg-rose-500/10">
        <h2 className="text-xl font-semibold text-rose-800 dark:text-rose-300">Danger zone</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Dezactivarea contului este permanentă — nu te vei mai putea autentifica.</p>
        <button type="button" onClick={() => setConfirmOpen(true)} disabled={loading} className="mt-4 rounded-full border border-rose-300 bg-[var(--card)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-rose-800 transition hover:bg-rose-100 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-500/15">
          Dezactivează contul
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Dezactivează contul"
        description="Ești sigur? Contul va fi dezactivat permanent și nu te vei mai putea autentifica."
        confirmLabel="Da, dezactivează"
        cancelLabel="Renunță"
        destructive
        loading={loading}
        onConfirm={handleDeactivate}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
