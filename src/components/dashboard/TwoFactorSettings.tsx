'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ShieldCheck, ShieldAlert, Copy, KeyRound } from 'lucide-react'
import Button from '@/components/ui/Button'
import OtpInput from '@/components/ui/OtpInput'
import { begin2faSetupAction, confirm2faAction, disable2faAction } from '@/app/actions/twofactor'

// Formatare lizibilă a secretului base32 (grupuri de 4) pentru introducere manuală în aplicație.
function groupSecret(secret: string): string {
  return secret.replace(/(.{4})/g, '$1 ').trim()
}

export default function TwoFactorSettings({ enabled }: { enabled: boolean }) {
  const router = useRouter()
  const [loading, startTransition] = useTransition()
  const [setup, setSetup] = useState<{ secret: string; uri: string } | null>(null)
  const [code, setCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null)
  const [disabling, setDisabling] = useState(false)

  const copy = (value: string, label: string) => {
    navigator.clipboard?.writeText(value).then(
      () => toast.success(`${label} copiat.`),
      () => toast.error('Nu am putut copia.')
    )
  }

  const begin = () =>
    startTransition(async () => {
      const res = await begin2faSetupAction()
      if (res.ok) {
        setSetup({ secret: res.secret, uri: res.uri })
        setCode('')
      } else toast.error(res.error)
    })

  const confirm = () =>
    startTransition(async () => {
      const res = await confirm2faAction(code)
      if (res.ok) {
        setSetup(null)
        setBackupCodes(res.backupCodes)
        toast.success('Autentificarea în doi pași este activă.')
        router.refresh()
      } else toast.error(res.error)
    })

  const disable = () =>
    startTransition(async () => {
      const res = await disable2faAction(code)
      if (res.ok) {
        setDisabling(false)
        setCode('')
        toast.success('Autentificarea în doi pași a fost dezactivată.')
        router.refresh()
      } else toast.error(res.error)
    })

  return (
    <div className="rounded-4xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
      <div className="flex items-center gap-3">
        {enabled ? <ShieldCheck size={20} className="text-emerald-600" /> : <ShieldAlert size={20} className="text-[var(--muted)]" />}
        <div>
          <h2 className="text-xl font-semibold">Autentificare în doi pași</h2>
          <p className="text-sm text-[var(--muted)]">
            {enabled ? 'Activă — la conectare ți se cere un cod din aplicație.' : 'Adaugă un al doilea factor (aplicație de autentificare) pentru securitate sporită.'}
          </p>
        </div>
      </div>

      {/* Coduri de rezervă afișate o singură dată după activare. */}
      {backupCodes ? (
        <div className="mt-5 rounded-3xl border border-amber-300 bg-amber-50 p-5 dark:border-amber-500/30 dark:bg-amber-500/10">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-200">
            <KeyRound size={15} /> Coduri de rezervă — salvează-le acum
          </p>
          <p className="mt-1 text-xs text-amber-800 dark:text-amber-300/80">
            Fiecare cod funcționează o singură dată dacă pierzi accesul la aplicație. Nu le vei mai putea vedea.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-sm">
            {backupCodes.map((c) => (
              <span key={c} className="rounded-xl bg-[var(--card)] px-3 py-2 text-center">{c}</span>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Button type="button" variant="outline" onClick={() => copy(backupCodes.join('\n'), 'Coduri')} className="px-4 py-2 text-xs">
              <Copy size={13} className="mr-1.5 inline" /> Copiază
            </Button>
            <Button type="button" onClick={() => setBackupCodes(null)} className="px-4 py-2 text-xs">Am salvat codurile</Button>
          </div>
        </div>
      ) : null}

      {/* Flux de configurare: secret + cod de confirmare. */}
      {!enabled && setup ? (
        <div className="mt-5 space-y-4">
          <div className="rounded-3xl bg-[var(--card)] p-5">
            <p className="text-sm text-[var(--muted)]">
              Adaugă o intrare nouă în aplicația de autentificare (Google Authenticator, Authy, 1Password) folosind cheia de mai jos:
            </p>
            <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-[var(--surface)] px-4 py-3">
              <code className="break-all font-mono text-sm">{groupSecret(setup.secret)}</code>
              <button type="button" onClick={() => copy(setup.secret, 'Cheie')} className="shrink-0 text-[var(--brand)]" aria-label="Copiază cheia">
                <Copy size={16} />
              </button>
            </div>
            <a href={setup.uri} className="mt-2 inline-block text-xs font-semibold text-[var(--brand)]">Deschide în aplicație</a>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Cod din aplicație</label>
            <OtpInput value={code} onChange={setCode} />
          </div>
          <div className="flex gap-2">
            <Button type="button" loading={loading} disabled={code.length < 6} onClick={confirm} className="px-5 py-2.5 text-sm">Confirmă și activează</Button>
            <Button type="button" variant="outline" disabled={loading} onClick={() => setSetup(null)} className="px-5 py-2.5 text-sm">Renunță</Button>
          </div>
        </div>
      ) : null}

      {/* Flux de dezactivare: necesită un cod valid. */}
      {enabled && disabling ? (
        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Confirmă cu un cod din aplicație sau un cod de rezervă
            </label>
            <OtpInput value={code} onChange={setCode} />
          </div>
          <div className="flex gap-2">
            <Button type="button" loading={loading} disabled={code.length < 6} onClick={disable} className="px-5 py-2.5 text-sm">Dezactivează 2FA</Button>
            <Button type="button" variant="outline" disabled={loading} onClick={() => { setDisabling(false); setCode('') }} className="px-5 py-2.5 text-sm">Renunță</Button>
          </div>
        </div>
      ) : null}

      {/* Acțiunea principală. */}
      {!setup && !disabling ? (
        <div className="mt-5">
          {enabled ? (
            <Button type="button" variant="outline" onClick={() => { setDisabling(true); setCode('') }} className="px-5 py-2.5 text-sm">Dezactivează</Button>
          ) : (
            <Button type="button" loading={loading} onClick={begin} className="px-5 py-2.5 text-sm">Activează 2FA</Button>
          )}
        </div>
      ) : null}
    </div>
  )
}
