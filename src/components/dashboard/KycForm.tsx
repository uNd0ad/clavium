'use client'

import { useRef, useState, useTransition, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { UploadCloud, Check } from 'lucide-react'
import Button from '@/components/ui/Button'
import { submitKycAction } from '@/app/actions/kyc'

type Kind = 'id_front' | 'id_back' | 'selfie'

const STEPS: { kind: Kind; title: string; hint: string }[] = [
  { kind: 'id_front', title: 'Act de identitate — față', hint: 'CI sau pașaport, fața cu poza. Text lizibil, fără reflexii.' },
  { kind: 'id_back', title: 'Act de identitate — verso', hint: 'Spatele actului de identitate.' },
  { kind: 'selfie', title: 'Selfie', hint: 'O fotografie clară a feței tale, bine iluminată.' },
]

const ACCEPT = 'image/jpeg,image/png,image/webp'
const MAX_BYTES = 8 * 1024 * 1024

type Slot = { file: File; preview: string }

export default function KycForm() {
  const router = useRouter()
  const [slots, setSlots] = useState<Partial<Record<Kind, Slot>>>({})
  const [pending, startTransition] = useTransition()
  const inputs = useRef<Partial<Record<Kind, HTMLInputElement | null>>>({})

  const pick = (kind: Kind) => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > MAX_BYTES) {
      toast.error('Fișierul poate avea maxim 8 MB.')
      event.target.value = ''
      return
    }
    setSlots((prev) => {
      // Eliberăm preview-ul anterior, dacă exista, ca să nu acumulăm obiecte URL.
      const old = prev[kind]
      if (old) URL.revokeObjectURL(old.preview)
      return { ...prev, [kind]: { file, preview: URL.createObjectURL(file) } }
    })
  }

  const allReady = STEPS.every((s) => slots[s.kind])

  const submit = () => {
    if (!allReady) return
    startTransition(async () => {
      const form = new FormData()
      for (const step of STEPS) form.append(step.kind, slots[step.kind]!.file)
      const res = await submitKycAction(form)
      if (res.ok) {
        toast.success(
          res.status === 'VERIFIED'
            ? 'Identitate verificată cu succes.'
            : 'Documente trimise — verificarea este în curs.'
        )
        // Curățăm preview-urile și reîmprospătăm: bannerul și statutul se actualizează.
        Object.values(slots).forEach((s) => s && URL.revokeObjectURL(s.preview))
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {STEPS.map((step) => {
          const slot = slots[step.kind]
          return (
            <div key={step.kind} className="flex flex-col rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4">
              <p className="text-sm font-semibold text-[var(--text)]">{step.title}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{step.hint}</p>
              <button
                type="button"
                onClick={() => inputs.current[step.kind]?.click()}
                disabled={pending}
                className="group relative mt-3 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[var(--border)] text-[var(--muted)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
              >
                {slot ? (
                  <>
                    <Image src={slot.preview} alt={step.title} fill sizes="240px" className="object-cover" unoptimized />
                    <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-2xs font-semibold text-white">
                      <Check size={11} strokeWidth={3} /> încărcat
                    </span>
                  </>
                ) : (
                  <span className="flex flex-col items-center gap-1 text-xs">
                    <UploadCloud size={20} />
                    Încarcă
                  </span>
                )}
              </button>
              <input
                ref={(el) => {
                  inputs.current[step.kind] = el
                }}
                type="file"
                accept={ACCEPT}
                hidden
                onChange={pick(step.kind)}
              />
            </div>
          )
        })}
      </div>

      <p className="text-xs text-[var(--muted)]">
        Documentele tale sunt folosite exclusiv pentru verificarea identității și nu sunt afișate public.
      </p>

      <Button type="button" loading={pending} disabled={!allReady} onClick={submit} className="px-6 py-2.5 text-sm">
        Trimite spre verificare
      </Button>
    </div>
  )
}
