'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { Camera, RefreshCw, Check, ShieldCheck, Loader2, CameraOff } from 'lucide-react'
import Button from '@/components/ui/Button'
import { submitKycAction } from '@/app/actions/kyc'
import { loadFaceModels, faceDescriptor, faceDistance } from '@/lib/kycFace'
import { KYC_MATCH_THRESHOLD } from '@/lib/kyc'

type Target = 'id' | 'selfie'

type Capture = { blob: Blob; url: string; descriptor: Float32Array }

const STEP_INFO: Record<Target, { title: string; hint: string }> = {
  id: {
    title: 'Actul de identitate',
    hint: 'Ține CI-ul sau pașaportul în fața camerei, cu poza vizibilă. Lumină bună, fără reflexii.',
  },
  selfie: {
    title: 'Selfie',
    hint: 'Privește direct în cameră, cu fața bine iluminată și descoperită.',
  },
}

export default function KycForm() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [modelsReady, setModelsReady] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [target, setTarget] = useState<Target>('id')
  const [captures, setCaptures] = useState<Partial<Record<Target, Capture>>>({})
  const [analyzing, setAnalyzing] = useState(false)
  const [pending, startTransition] = useTransition()

  // Încarcă modelele de recunoaștere facială (o singură dată).
  useEffect(() => {
    let active = true
    loadFaceModels()
      .then(() => active && setModelsReady(true))
      .catch(() => active && setCameraError('Nu am putut încărca modelele de recunoaștere facială. Reîncarcă pagina.'))
    return () => {
      active = false
    }
  }, [])

  // Pornește camera și o oprește la demontare.
  useEffect(() => {
    let active = true
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
      .then((stream) => {
        if (!active) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
      })
      .catch(() => active && setCameraError('Acordă acces la cameră pentru a continua verificarea.'))
    return () => {
      active = false
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  const capture = useCallback(async () => {
    const video = videoRef.current
    if (!video || !video.videoWidth || !modelsReady) return
    setAnalyzing(true)
    try {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('canvas')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      const descriptor = await faceDescriptor(canvas)
      if (!descriptor) {
        toast.error(
          target === 'id'
            ? 'Nu am detectat o față pe act. Apropie actul și asigură-te că poza e vizibilă.'
            : 'Nu am detectat fața ta. Centrează-te în cadru, la lumină bună.'
        )
        return
      }
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.92))
      if (!blob) throw new Error('blob')

      setCaptures((prev) => {
        const old = prev[target]
        if (old) URL.revokeObjectURL(old.url)
        return { ...prev, [target]: { blob, url: URL.createObjectURL(blob), descriptor } }
      })
      // Avansăm automat la pasul următor dacă încă nu e capturat.
      if (target === 'id' && !captures.selfie) setTarget('selfie')
      else if (target === 'selfie' && !captures.id) setTarget('id')
    } catch {
      toast.error('Captura a eșuat. Mai încearcă o dată.')
    } finally {
      setAnalyzing(false)
    }
  }, [target, modelsReady, captures.id, captures.selfie])

  const both = captures.id && captures.selfie
  const distance = both ? faceDistance(captures.id!.descriptor, captures.selfie!.descriptor) : null
  const willMatch = distance !== null && distance <= KYC_MATCH_THRESHOLD

  const submit = () => {
    if (!captures.id || !captures.selfie || distance === null) return
    startTransition(async () => {
      const form = new FormData()
      form.append('id', new File([captures.id!.blob], 'id.jpg', { type: 'image/jpeg' }))
      form.append('selfie', new File([captures.selfie!.blob], 'selfie.jpg', { type: 'image/jpeg' }))
      form.append('facesDetected', 'true')
      form.append('matchDistance', String(distance))

      const res = await submitKycAction(form)
      if (res.ok && res.status === 'VERIFIED') {
        toast.success('Identitate verificată cu succes.')
        Object.values(captures).forEach((c) => c && URL.revokeObjectURL(c.url))
        router.refresh()
      } else if (res.ok) {
        // REJECTED / PENDING: arătăm motivul și lăsăm utilizatorul să reia.
        toast.error(res.reason || 'Verificarea nu a putut fi confirmată. Reia captura.')
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  if (cameraError) {
    return (
      <p className="flex items-center gap-2 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
        <CameraOff size={16} /> {cameraError}
      </p>
    )
  }

  const info = STEP_INFO[target]

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* Camera live + țintă curentă */}
        <div className="space-y-3">
          <div className="relative aspect-video overflow-hidden rounded-3xl border border-[var(--border)] bg-black">
            <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
            {!modelsReady ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 text-sm text-white">
                <Loader2 size={20} className="animate-spin" />
                Se încarcă modelul de verificare…
              </div>
            ) : null}
          </div>
          <div className="rounded-3xl bg-[var(--surface)] px-4 py-3">
            <p className="text-sm font-semibold text-[var(--text)]">Pasul curent: {info.title}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">{info.hint}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" loading={analyzing} disabled={!modelsReady || pending} onClick={capture} className="px-5 py-2.5 text-xs">
              <Camera size={15} className="mr-1.5 inline" />
              {captures[target] ? `Recapturează ${info.title.toLowerCase()}` : `Capturează ${info.title.toLowerCase()}`}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => setTarget(target === 'id' ? 'selfie' : 'id')}
              className="px-5 py-2.5 text-xs"
            >
              Treci la {target === 'id' ? 'selfie' : 'act'}
            </Button>
          </div>
        </div>

        {/* Capturi + rezultatul potrivirii */}
        <div className="space-y-3">
          {(['id', 'selfie'] as Target[]).map((kind) => {
            const cap = captures[kind]
            return (
              <button
                key={kind}
                type="button"
                onClick={() => setTarget(kind)}
                className={`flex w-full items-center gap-3 rounded-3xl border p-3 text-left transition ${
                  target === kind ? 'border-[var(--brand)]' : 'border-[var(--border)]'
                }`}
              >
                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-2xl bg-[var(--card)]">
                  {cap ? (
                    <Image src={cap.url} alt={STEP_INFO[kind].title} fill sizes="96px" className="object-cover" unoptimized />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[var(--muted)]">
                      <Camera size={16} />
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--text)]">{STEP_INFO[kind].title}</p>
                  <p className={`mt-0.5 inline-flex items-center gap-1 text-xs ${cap ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--muted)]'}`}>
                    {cap ? (
                      <>
                        <Check size={12} strokeWidth={3} /> capturat
                      </>
                    ) : (
                      <>
                        <RefreshCw size={12} /> neîncărcat
                      </>
                    )}
                  </p>
                </div>
              </button>
            )
          })}

          {distance !== null ? (
            <div
              className={`flex items-center gap-2 rounded-3xl border px-4 py-3 text-sm font-medium ${
                willMatch
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                  : 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200'
              }`}
            >
              <ShieldCheck size={16} />
              {willMatch ? 'Fețele par a fi aceeași persoană.' : 'Fețele nu par să corespundă — reia captura.'}
            </div>
          ) : null}
        </div>
      </div>

      <p className="text-xs text-[var(--muted)]">
        Potrivirea facială se calculează local, în browserul tău. Imaginile sunt folosite exclusiv pentru verificare și nu
        sunt afișate public.
      </p>

      <Button type="button" loading={pending} disabled={!both || !modelsReady} onClick={submit} className="px-6 py-2.5 text-sm">
        Trimite spre verificare
      </Button>
    </div>
  )
}
