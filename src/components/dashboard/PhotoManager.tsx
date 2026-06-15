'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { ImagePlus, X } from 'lucide-react'
import { uploadPhotosAction, deletePhotoAction } from '@/app/actions/properties'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

export default function PhotoManager({ propertyId, photos }: { propertyId: string; photos: string[] }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    setLoading(true)
    const form = new FormData()
    Array.from(files).forEach((file) => form.append('photos', file))
    const res = await uploadPhotosAction(propertyId, form)
    if (res.ok) toast.success(files.length > 1 ? 'Fotografii încărcate.' : 'Fotografie încărcată.')
    else toast.error(res.error)
    setLoading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const confirmRemove = async () => {
    if (!pendingDelete) return
    setLoading(true)
    const res = await deletePhotoAction(propertyId, pendingDelete)
    if (res.ok) toast.success('Fotografie ștearsă.')
    else toast.error(res.error)
    setLoading(false)
    setPendingDelete(null)
  }

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-2">
        {photos.map((url, index) => (
          <div key={url} className="group relative h-16 w-20 overflow-hidden rounded-xl border border-[var(--border)]">
            <Image src={url} alt="Fotografie proprietate" fill sizes="80px" className="object-cover" />
            {index === 0 ? (
              <span className="absolute bottom-0 left-0 right-0 bg-[var(--brand)]/85 py-0.5 text-center text-2xs font-semibold uppercase tracking-wide text-white">
                Copertă
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => setPendingDelete(url)}
              disabled={loading}
              aria-label="Șterge fotografia"
              className="absolute right-1 top-1 hidden rounded-full bg-[var(--card)] p-0.5 text-rose-700 shadow group-hover:block dark:text-rose-400"
            >
              <X size={13} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="flex h-16 w-20 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[var(--border)] text-2xs text-[var(--muted)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
        >
          <ImagePlus size={16} />
          {loading ? '...' : 'Foto'}
        </button>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={upload} />
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Ștergi fotografia?"
        description="Acțiunea nu poate fi anulată. Fotografia va fi eliminată din listare."
        confirmLabel="Șterge"
        cancelLabel="Renunță"
        destructive
        loading={loading}
        onConfirm={confirmRemove}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
