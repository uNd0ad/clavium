'use client'

import { useState, useTransition, type FormEvent, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import clsx from 'clsx'
import { ChevronDown, Send } from 'lucide-react'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import StatusBadge from './StatusBadge'
import { markTicketReadAction, replyToTicketAction, setTicketStatusAction } from '@/app/actions/tickets'
import type { TicketView } from '@/lib/dashboardData'

const MANAGER_STATUSES = [
  { value: 'DESCHIS', label: 'Deschis' },
  { value: 'IN_LUCRU', label: 'În lucru' },
  { value: 'REZOLVAT', label: 'Rezolvat' },
  { value: 'INCHIS', label: 'Închis' },
]

export default function TicketCard({ ticket }: { ticket: TicketView }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reply, setReply] = useState('')
  const [confirmClose, setConfirmClose] = useState(false)
  const [pending, startTransition] = useTransition()

  const closed = ticket.statusCode === 'INCHIS'
  const resolved = ticket.statusCode === 'REZOLVAT'

  const run = (action: () => Promise<{ ok: boolean; error?: string }>, success: string) =>
    startTransition(async () => {
      const res = await action()
      if (res.ok) {
        toast.success(success)
        router.refresh()
      } else {
        toast.error(res.error || 'A apărut o eroare.')
      }
    })

  const handleReply = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!reply.trim()) return
    startTransition(async () => {
      const res = await replyToTicketAction(ticket.id, { body: reply })
      if (res.ok) {
        setReply('')
        router.refresh()
      } else {
        toast.error(res.error || 'A apărut o eroare.')
      }
    })
  }

  const changeStatus = (status: string, success: string) =>
    run(() => setTicketStatusAction(ticket.id, { status }), success)

  // La deschiderea unui tichet cu răspuns nou, îl marcăm ca citit (golește indicatorul).
  const toggleOpen = () => {
    const next = !open
    setOpen(next)
    if (next && ticket.hasNewReply) {
      startTransition(async () => {
        await markTicketReadAction(ticket.id)
        router.refresh()
      })
    }
  }

  // Cmd/Ctrl+Enter trimite răspunsul direct din textarea.
  const handleReplyKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <div className="rounded-[24px] border border-[var(--border)] bg-[var(--card)] p-5">
      <button onClick={toggleOpen} className="flex w-full items-start justify-between gap-4 text-left">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {ticket.hasNewReply ? (
              <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-[var(--brand)]" aria-hidden />
            ) : null}
            <p className="truncate text-lg font-semibold">{ticket.subject}</p>
          </div>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {ticket.property} · {ticket.counterparty} · deschis {ticket.date} · {ticket.messageCount}{' '}
            {ticket.messageCount === 1 ? 'mesaj' : 'mesaje'} · activ {ticket.lastActivity}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {ticket.hasNewReply ? <StatusBadge label="Răspuns nou" variant="success" /> : null}
          <StatusBadge label={ticket.category} variant="info" />
          <StatusBadge label={ticket.priority} variant={ticket.priorityVariant} />
          <StatusBadge label={ticket.status} variant={ticket.statusVariant} />
          <ChevronDown size={18} className={clsx('text-[var(--muted)] transition', open && 'rotate-180')} />
        </div>
      </button>

      {open ? (
        <div className="step-transition mt-5 space-y-4">
          <div className="space-y-3">
            {ticket.messages.map((message) => (
              <div
                key={message.id}
                className={clsx(
                  'rounded-[18px] border border-[var(--border)] p-4',
                  message.mine ? 'bg-[var(--brand-soft)]' : 'bg-[var(--surface)]'
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[13px] font-semibold">{message.mine ? 'Tu' : message.author}</p>
                  <p className="text-[12px] text-[var(--muted)]">{message.date}</p>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-[14px] leading-6 text-[var(--text)]">{message.body}</p>
              </div>
            ))}
          </div>

          {closed ? (
            <p className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
              Tichetul este închis. Redeschide-l pentru a continua conversația.
            </p>
          ) : (
            <form onSubmit={handleReply} className="space-y-3">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={handleReplyKeyDown}
                rows={3}
                maxLength={4000}
                className="w-full rounded-[18px] border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[14px] outline-none transition focus:border-[var(--brand)]"
                placeholder="Scrie un răspuns… (Cmd/Ctrl+Enter trimite)"
              />
              <Button type="submit" loading={pending} disabled={!reply.trim()} className="px-5 py-2.5 text-[12px]">
                <Send size={14} /> Trimite răspunsul
              </Button>
            </form>
          )}

          <div className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-4">
            {ticket.canManage ? (
              <label className="inline-flex items-center gap-2 text-[13px] text-[var(--muted)]">
                Status
                <select
                  value={ticket.statusCode}
                  disabled={pending}
                  onChange={(e) => changeStatus(e.target.value, 'Statusul tichetului a fost actualizat.')}
                  className="rounded-[14px] border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[13px] text-[var(--text)] outline-none transition focus:border-[var(--brand)]"
                >
                  {MANAGER_STATUSES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <>
                {!resolved && !closed ? (
                  <Button
                    type="button"
                    variant="outline"
                    loading={pending}
                    onClick={() => changeStatus('REZOLVAT', 'Tichet marcat ca rezolvat.')}
                    className="px-5 py-2.5 text-[12px]"
                  >
                    Marchează rezolvat
                  </Button>
                ) : null}
                {closed ? (
                  <Button
                    type="button"
                    variant="outline"
                    loading={pending}
                    onClick={() => changeStatus('DESCHIS', 'Tichet redeschis.')}
                    className="px-5 py-2.5 text-[12px]"
                  >
                    Redeschide tichetul
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    loading={pending}
                    onClick={() => setConfirmClose(true)}
                    className="px-5 py-2.5 text-[12px]"
                  >
                    Închide tichetul
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmClose}
        title="Închizi tichetul?"
        description="După închidere, conversația se blochează până la redeschidere. Poți redeschide tichetul oricând."
        confirmLabel="Închide tichetul"
        cancelLabel="Renunță"
        loading={pending}
        onConfirm={() => {
          setConfirmClose(false)
          changeStatus('INCHIS', 'Tichet închis.')
        }}
        onCancel={() => setConfirmClose(false)}
      />
    </div>
  )
}
