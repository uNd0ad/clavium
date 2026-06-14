'use client'

import { useCallback, useEffect, useState, type TouchEvent } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

// Galerie cu lightbox: click pentru full-screen, săgeți/tastatură pentru navigare, swipe pe mobil.
export default function PropertyGallery({ photos, title }: { photos: string[]; title: string }) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)

  const close = useCallback(() => setOpen(false), [])
  const prev = useCallback(() => setIndex((i) => (i - 1 + photos.length) % photos.length), [photos.length])
  const next = useCallback(() => setIndex((i) => (i + 1) % photos.length), [photos.length])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
      if (event.key === 'ArrowLeft') prev()
      if (event.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [open, close, prev, next])

  const onTouchEnd = (event: TouchEvent) => {
    if (touchStart === null) return
    const delta = event.changedTouches[0].clientX - touchStart
    if (Math.abs(delta) > 50) {
      if (delta > 0) prev()
      else next()
    }
    setTouchStart(null)
  }

  if (photos.length === 0) return null

  const navButton = 'absolute top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20'

  return (
    <>
      <div className={`grid gap-3 ${photos.length > 1 ? 'grid-cols-2' : ''}`}>
        {photos.map((url, i) => (
          <button
            type="button"
            key={url}
            onClick={() => {
              setIndex(i)
              setOpen(true)
            }}
            aria-label={`Deschide fotografia ${i + 1}`}
            className={`group relative overflow-hidden rounded-[24px] ${i === 0 && photos.length > 1 ? 'col-span-2 h-80' : i === 0 ? 'h-80' : 'h-44'}`}
          >
            <Image
              src={url}
              alt={`${title} — fotografia ${i + 1}`}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              priority={i === 0}
            />
          </button>
        ))}
      </div>

      {open && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4"
              role="dialog"
              aria-modal="true"
              aria-label={`${title} — galerie`}
              onClick={close}
              onTouchStart={(event) => setTouchStart(event.touches[0].clientX)}
              onTouchEnd={onTouchEnd}
            >
              <button type="button" onClick={close} aria-label="Închide" className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20">
                <X size={22} />
              </button>

              <div className="relative h-[82vh] w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
                <Image src={photos[index]} alt={`${title} — fotografia ${index + 1}`} fill sizes="100vw" className="object-contain" />
              </div>

              {photos.length > 1 ? (
                <>
                  <button type="button" onClick={(event) => { event.stopPropagation(); prev() }} aria-label="Fotografia anterioară" className={`${navButton} left-4`}>
                    <ChevronLeft size={26} />
                  </button>
                  <button type="button" onClick={(event) => { event.stopPropagation(); next() }} aria-label="Fotografia următoare" className={`${navButton} right-4`}>
                    <ChevronRight size={26} />
                  </button>
                  <p className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-[13px] font-semibold text-white">
                    {index + 1} / {photos.length}
                  </p>
                </>
              ) : null}
            </div>,
            document.body
          )
        : null}
    </>
  )
}
