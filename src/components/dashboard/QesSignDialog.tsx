'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import { signContractAction } from '@/app/actions/contracts'

// Convertește un fișier de certificat (PEM sau DER binar) în PEM.
async function fileToPem(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  const text = new TextDecoder().decode(bytes)
  if (text.includes('-----BEGIN')) return text
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  const b64 = (btoa(bin).match(/.{1,64}/g) ?? []).join('\n')
  return `-----BEGIN CERTIFICATE-----\n${b64}\n-----END CERTIFICATE-----`
}

// Semnatarul își păstrează cheia privată: semnează amprenta documentului cu tokenul/aplicația
// lui QES, apoi încarcă certificatul + semnătura. Serverul verifică (vezi qesVerify.ts).
export function QesSignDialog({ contractId, documentHash }: { contractId: string; documentHash: string }) {
  const [open, setOpen] = useState(false)
  const [certFile, setCertFile] = useState<File | null>(null)
  const [chainFiles, setChainFiles] = useState<FileList | null>(null)
  const [signature, setSignature] = useState('')
  const [loading, startTransition] = useTransition()
  const router = useRouter()

  function submit() {
    if (!certFile || !signature.trim()) {
      toast.error('Încarcă certificatul și introdu semnătura.')
      return
    }
    startTransition(async () => {
      const certificatePem = await fileToPem(certFile)
      const chainPem = chainFiles && chainFiles.length ? await Promise.all(Array.from(chainFiles).map(fileToPem)) : undefined
      const res = await signContractAction(contractId, { certificatePem, signatureValue: signature.trim(), chainPem })
      if (res.ok) {
        toast.success('Contract semnat cu QES.')
        setOpen(false)
        router.refresh()
      } else {
        toast.error(res.error || 'Semnarea a eșuat.')
      }
    })
  }

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)} className="px-5 py-2.5 text-xs">
        Semnează cu QES
      </Button>
    )
  }

  return (
    <div className="w-full space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5">
      <div>
        <p className="text-sm font-semibold text-[var(--text)]">Semnează cu certificat calificat</p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Semnează amprenta de mai jos cu certificatul tău calificat (token/aplicație QES), apoi încarcă certificatul și semnătura.
        </p>
      </div>

      <div>
        <span className="text-2xs font-semibold uppercase tracking-wide text-[var(--muted)]">Amprenta documentului (SHA-256)</span>
        <div className="mt-1 flex items-center gap-2">
          <code className="flex-1 break-all rounded-xl bg-[var(--surface)] px-3 py-2 font-mono text-2xs text-[var(--text)]">{documentHash}</code>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(documentHash)
              toast.success('Amprentă copiată.')
            }}
            className="shrink-0 rounded-full border border-[var(--border)] px-3 py-1.5 text-2xs font-semibold text-[var(--text)]"
          >
            Copiază
          </button>
        </div>
      </div>

      <label className="block">
        <span className="text-2xs font-semibold uppercase tracking-wide text-[var(--muted)]">Certificat (.pem / .cer / .crt)</span>
        <input
          type="file"
          accept=".pem,.cer,.crt,.der"
          onChange={(e) => setCertFile(e.target.files?.[0] ?? null)}
          className="mt-1 block w-full text-xs text-[var(--text)] file:mr-3 file:rounded-full file:border-0 file:bg-[var(--brand-soft)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[var(--brand)]"
        />
      </label>

      <label className="block">
        <span className="text-2xs font-semibold uppercase tracking-wide text-[var(--muted)]">Lanț intermediar (opțional)</span>
        <input
          type="file"
          multiple
          accept=".pem,.cer,.crt,.der"
          onChange={(e) => setChainFiles(e.target.files)}
          className="mt-1 block w-full text-xs text-[var(--text)] file:mr-3 file:rounded-full file:border-0 file:bg-[var(--brand-soft)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[var(--brand)]"
        />
      </label>

      <label className="block">
        <span className="text-2xs font-semibold uppercase tracking-wide text-[var(--muted)]">Semnătura (base64)</span>
        <textarea
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          rows={3}
          placeholder="Semnătura în base64, produsă peste amprenta de mai sus"
          className="mt-1 block w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-mono text-2xs text-[var(--text)]"
        />
      </label>

      <div className="flex items-center gap-3">
        <Button type="button" loading={loading} onClick={submit} className="px-5 py-2.5 text-xs">
          Trimite semnătura
        </Button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-full px-4 py-2 text-xs font-semibold text-[var(--muted)]">
          Anulează
        </button>
      </div>
    </div>
  )
}
