'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { Camera, Check, ShieldCheck, Loader2, SwitchCamera, ImagePlus, Info } from 'lucide-react'
import Button from '@/components/ui/Button'
import { submitKycAction } from '@/app/actions/kyc'
import { loadFaceModels, faceDescriptor, faceDistance } from '@/lib/kycFace'
import { KYC_MATCH_THRESHOLD } from '@/lib/kyc'

type Target = 'id' | 'selfie'
type Capture = { blob: Blob; url: string; descriptor: Float32Array }
type Mode = 'live' | 'upload'

const STEP_INFO: Record<Target, { title: string; hint: string; capture: 'environment' | 'user' }> = {
  id: {
    title: 'Actul de identitate',
    hint: 'Fotografiază CI-ul sau pașaportul, cu poza vizibilă. Lumină bună, fără reflexii.',
    capture: 'environment',
  },
  selfie: {
    title: 'Selfie',
    hint: 'Fața bine iluminată și descoperită, privind direct spre cameră.',
    capture: 'user',
  },
}

// Codează un canvas ca JPEG (normalizează formatul, indiferent de sursă — webcam sau foto telefon).
function canvasToJpeg(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.92))
}

// Desenează un fișier imagine (foto din cameră nativă) pe un canvas, pentru analiză + re-encodare.
function fileToCanvas(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      URL.revokeObjectURL(url)
      if (!ctx) return reject(new Error('canvas'))
      ctx.drawImage(img, 0, 0)
      resolve(canvas)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('image'))
    }
    img.src = url
  })
}

export default function KycForm() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputs = useRef<Partial<Record<Target, HTMLInputElement | null>>>({})

  const [modelsReady, setModelsReady] = useState(false)
  const [mode, setMode] = useState<Mode>('live')
  const [liveNote, setLiveNote] = useState<string | null>(null)
  const [target, setTarget] = useState<Target>('id')
  const [captures, setCaptures] = useState<Partial<Record<Target, Capture>>>({})
  const [analyzing, setAnalyzing] = useState(false)
  const [consent, setConsent] = useState(false)
  const [pending, startTransition] = useTransition()
  // Camera activă în mod live: spate (potrivit pentru act) sau față (selfie). Ignorat pe desktop.
  const [facing, setFacing] = useState<'environment' | 'user'>('environment')

  // Încarcă modelele de recunoaștere facială (o singură dată).
  useEffect(() => {
    let active = true
    loadFaceModels()
      .then(() => active && setModelsReady(true))
      .catch(() => active && toast.error('Nu am putut încărca modelul de verificare. Reîncarcă pagina.'))
    return () => {
      active = false
    }
  }, [])

  // Pornește camera live; dacă nu e disponibilă (context nesecurizat pe telefon, permisiune
  // refuzată, fără cameră), cădem automat pe captura foto nativă (input file capture), care
  // funcționează și pe HTTP fără HTTPS.
  useEffect(() => {
    let active = true
    const request = navigator.mediaDevices?.getUserMedia
      ? navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        })
      : Promise.reject(new Error('insecure'))

    request
      .then((stream) => {
        if (!active) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        setMode('live')
        setLiveNote(null)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
      })
      .catch((err: Error & { name?: string }) => {
        if (!active) return
        setMode('upload')
        setLiveNote(
          err?.message === 'insecure'
            ? 'Camera live necesită HTTPS. Pe telefon, folosește captura foto nativă de mai jos — funcționează fără HTTPS.'
            : err?.name === 'NotAllowedError'
              ? 'Acces la cameră refuzat. Poți face pozele cu camera telefonului mai jos.'
              : 'Camera live nu este disponibilă. Folosește captura foto de mai jos.'
        )
      })
    return () => {
      active = false
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [facing])

  // Acceptă o captură (din webcam sau din foto): detectează fața, o stochează ca JPEG + embedding.
  const acceptCapture = useCallback(
    async (canvas: HTMLCanvasElement, t: Target): Promise<void> => {
      const descriptor = await faceDescriptor(canvas)
      if (!descriptor) {
        toast.error(
          t === 'id'
            ? 'Nu am detectat o față pe act. Apropie actul și asigură-te că poza e vizibilă.'
            : 'Nu am detectat fața ta. Centrează-te în cadru, la lumină bună.'
        )
        return
      }
      const blob = await canvasToJpeg(canvas)
      if (!blob) {
        toast.error('Captura a eșuat. Mai încearcă o dată.')
        return
      }
      setCaptures((prev) => {
        const old = prev[t]
        if (old) URL.revokeObjectURL(old.url)
        return { ...prev, [t]: { blob, url: URL.createObjectURL(blob), descriptor } }
      })
      // Avansăm automat la pasul rămas.
      if (t === 'id' && !captures.selfie) setTarget('selfie')
      else if (t === 'selfie' && !captures.id) setTarget('id')
    },
    [captures.id, captures.selfie]
  )

  // Captură din webcam-ul live.
  const captureLive = useCallback(async () => {
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
      await acceptCapture(canvas, target)
    } catch {
      toast.error('Captura a eșuat. Mai încearcă o dată.')
    } finally {
      setAnalyzing(false)
    }
  }, [target, modelsReady, acceptCapture])

  // Captură din foto făcută cu camera nativă a telefonului (input file capture) — merge pe HTTP.
  const captureFile = useCallback(
    async (t: Target, file: File | undefined) => {
      if (!file || !modelsReady) return
      setAnalyzing(true)
      try {
        const canvas = await fileToCanvas(file)
        await acceptCapture(canvas, t)
      } catch {
        toast.error('Nu am putut citi imaginea. Încearcă din nou.')
      } finally {
        setAnalyzing(false)
      }
    },
    [modelsReady, acceptCapture]
  )

  const both = captures.id && captures.selfie
  const distance = both ? faceDistance(captures.id!.descriptor, captures.selfie!.descriptor) : null
  const willMatch = distance !== null && distance <= KYC_MATCH_THRESHOLD

  const submit = () => {
    if (!captures.id || !captures.selfie || distance === null || !consent) return
    startTransition(async () => {
      const form = new FormData()
      form.append('id', new File([captures.id!.blob], 'id.jpg', { type: 'image/jpeg' }))
      form.append('selfie', new File([captures.selfie!.blob], 'selfie.jpg', { type: 'image/jpeg' }))
      form.append('facesDetected', 'true')
      form.append('matchDistance', String(distance))
      form.append('consent', 'true')

      const res = await submitKycAction(form)
      if (res.ok && res.status === 'VERIFIED') {
        toast.success('Identitate verificată cu succes.')
        Object.values(captures).forEach((c) => c && URL.revokeObjectURL(c.url))
        router.refresh()
      } else if (res.ok) {
        toast.error(res.reason || 'Verificarea nu a putut fi confirmată. Reia captura.')
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  const info = STEP_INFO[target]

  return (
    <div className="space-y-5">
      {liveNote ? (
        <p className="flex items-start gap-2 rounded-3xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs font-medium text-sky-900 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200">
          <Info size={15} className="mt-0.5 shrink-0" /> {liveNote}
        </p>
      ) : null}

      {mode === 'live' ? (
        // ── Mod live (desktop / HTTPS): webcam cu auto-detecție ──
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
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
              <Button type="button" loading={analyzing} disabled={!modelsReady || pending} onClick={captureLive} className="px-5 py-2.5 text-xs">
                <Camera size={15} className="mr-1.5 inline" />
                {captures[target] ? `Recapturează ${info.title.toLowerCase()}` : `Capturează ${info.title.toLowerCase()}`}
              </Button>
              <Button type="button" variant="outline" disabled={pending} onClick={() => setTarget(target === 'id' ? 'selfie' : 'id')} className="px-5 py-2.5 text-xs">
                Treci la {target === 'id' ? 'selfie' : 'act'}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={pending || analyzing}
                onClick={() => setFacing((f) => (f === 'environment' ? 'user' : 'environment'))}
                className="px-5 py-2.5 text-xs"
              >
                <SwitchCamera size={15} className="mr-1.5 inline" />
                {facing === 'environment' ? 'Cameră față' : 'Cameră spate'}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {(['id', 'selfie'] as Target[]).map((kind) => (
              <CaptureSummary key={kind} kind={kind} cap={captures[kind]} active={target === kind} onClick={() => setTarget(kind)} />
            ))}
            <MatchBadge distance={distance} willMatch={willMatch} />
          </div>
        </div>
      ) : (
        // ── Mod foto (telefon / HTTP): captură cu camera nativă prin input file ──
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {(['id', 'selfie'] as Target[]).map((kind) => {
              const cap = captures[kind]
              const step = STEP_INFO[kind]
              return (
                <div key={kind} className="flex flex-col rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4">
                  <p className="text-sm font-semibold text-[var(--text)]">{step.title}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">{step.hint}</p>
                  <button
                    type="button"
                    onClick={() => fileInputs.current[kind]?.click()}
                    disabled={!modelsReady || analyzing || pending}
                    className="group relative mt-3 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[var(--border)] text-[var(--muted)] transition hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:opacity-60"
                  >
                    {cap ? (
                      <>
                        <Image src={cap.url} alt={step.title} fill sizes="320px" className="object-cover" unoptimized />
                        <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-2xs font-semibold text-white">
                          <Check size={11} strokeWidth={3} /> capturat
                        </span>
                      </>
                    ) : (
                      <span className="flex flex-col items-center gap-1 text-xs">
                        {analyzing ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} />}
                        {modelsReady ? 'Deschide camera' : 'Se încarcă…'}
                      </span>
                    )}
                  </button>
                  <input
                    ref={(el) => {
                      fileInputs.current[kind] = el
                    }}
                    type="file"
                    accept="image/*"
                    capture={step.capture}
                    hidden
                    onChange={(e) => {
                      captureFile(kind, e.target.files?.[0])
                      e.target.value = ''
                    }}
                  />
                </div>
              )
            })}
          </div>
          <MatchBadge distance={distance} willMatch={willMatch} />
        </div>
      )}

      <p className="text-xs text-[var(--muted)]">
        Potrivirea facială se calculează local, în browserul tău. Imaginile sunt folosite exclusiv pentru verificare și nu
        sunt afișate public.
      </p>

      <label className="flex cursor-pointer items-start gap-3 rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-xs text-[var(--muted)]">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]"
        />
        <span>
          Îmi dau consimțământul explicit pentru prelucrarea datelor mele biometrice (imaginea feței) în scopul verificării
          identității, conform art. 9 GDPR. Imaginile brute sunt păstrate cel mult 30 de zile după verificare, apoi sunt
          șterse automat; rămâne doar dovada verificării.
        </span>
      </label>

      <Button type="button" loading={pending} disabled={!both || !modelsReady || !consent} onClick={submit} className="px-6 py-2.5 text-sm">
        Trimite spre verificare
      </Button>
    </div>
  )
}

function CaptureSummary({ kind, cap, active, onClick }: { kind: Target; cap?: Capture; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-3xl border p-3 text-left transition ${active ? 'border-[var(--brand)]' : 'border-[var(--border)]'}`}
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
            'neîncărcat'
          )}
        </p>
      </div>
    </button>
  )
}

function MatchBadge({ distance, willMatch }: { distance: number | null; willMatch: boolean }) {
  if (distance === null) return null
  return (
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
  )
}
