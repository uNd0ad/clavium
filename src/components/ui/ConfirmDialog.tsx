'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Button from './Button'

type ConfirmDialogProps = {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

// Dialog de confirmare stilizat (înlocuiește window.confirm): backdrop, Escape, focus pe acțiune.
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmă',
  cancelLabel = 'Renunță',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    confirmRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    // Blochează scroll-ul în spatele dialogului.
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, onCancel])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-7 shadow-[var(--shadow)]"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-title" className="text-xl font-semibold text-[var(--text)]">
          {title}
        </h2>
        {description ? <p className="mt-3 text-[15px] leading-7 text-[var(--muted)]">{description}</p> : null}
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onCancel} disabled={loading} className="px-6 py-3 text-[13px]">
            {cancelLabel}
          </Button>
          <Button
            ref={confirmRef}
            variant="primary"
            loading={loading}
            onClick={onConfirm}
            className={`px-6 py-3 text-[13px] ${destructive ? '!bg-rose-600 !shadow-[0_20px_45px_rgba(225,29,72,0.18)] hover:!bg-rose-700' : ''}`}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}
