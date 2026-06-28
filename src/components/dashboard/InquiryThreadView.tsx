'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import type { InquiryThread } from '@/lib/inquiries'
import { replyInquiryAction, closeInquiryAction } from '@/app/actions/inquiries'

const timeFmt = new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export default function InquiryThreadView({ thread }: { thread: InquiryThread }) {
  const router = useRouter()
  const [body, setBody] = useState('')
  const [loading, startTransition] = useTransition()
  const closed = thread.status === 'INCHIS'

  const reply = () =>
    startTransition(async () => {
      const res = await replyInquiryAction(thread.id, body)
      if (res.ok) {
        setBody('')
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })

  const close = () =>
    startTransition(async () => {
      const res = await closeInquiryAction(thread.id)
      if (res.ok) {
        toast.success('Conversația a fost închisă.')
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-4xl border border-[var(--border)] bg-[var(--surface)] p-6">
        {thread.messages.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Niciun mesaj în această conversație.</p>
        ) : (
          thread.messages.map((m) => (
            <div key={m.id} className={clsx('flex', m.mine ? 'justify-end' : 'justify-start')}>
              <div
                className={clsx(
                  'max-w-[80%] rounded-3xl px-4 py-3 text-sm',
                  m.mine ? 'bg-[var(--brand)] text-white' : 'bg-[var(--card)] text-[var(--text)]'
                )}
              >
                <p className={clsx('mb-1 text-xs font-semibold', m.mine ? 'text-white/80' : 'text-[var(--muted)]')}>
                  {m.authorName} · {timeFmt.format(m.createdAt)}
                </p>
                <p className="whitespace-pre-line">{m.body}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {closed ? (
        <p className="rounded-2xl bg-[var(--card)] px-4 py-3 text-sm text-[var(--muted)]">
          Conversația este închisă. Trimite un mesaj nou pentru a o redeschide.
        </p>
      ) : null}

      <div className="space-y-3 rounded-4xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Scrie un răspuns…"
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm outline-none transition focus:border-[var(--brand)]"
        />
        <div className="flex flex-wrap gap-3">
          <Button type="button" loading={loading} onClick={reply} disabled={!body.trim()} className="px-5 py-2.5 text-sm">
            Trimite
          </Button>
          {!closed ? (
            <Button type="button" variant="outline" disabled={loading} onClick={close} className="px-5 py-2.5 text-sm">
              Închide conversația
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
