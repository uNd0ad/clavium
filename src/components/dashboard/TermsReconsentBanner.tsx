'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { FileText } from 'lucide-react'
import Button from '@/components/ui/Button'
import { acceptTermsAction } from '@/app/actions/terms'

// Banner de re-consimțământ: apare când utilizatorul nu a acceptat versiunea curentă a T&C.
export default function TermsReconsentBanner() {
  const router = useRouter()
  const [loading, startTransition] = useTransition()

  const accept = () =>
    startTransition(async () => {
      const res = await acceptTermsAction()
      if (res.ok) {
        toast.success('Mulțumim! Ai acceptat termenii actualizați.')
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-[var(--brand)] bg-[var(--brand-soft)] p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <FileText size={18} className="mt-0.5 shrink-0 text-[var(--brand)]" />
        <p className="text-sm text-[var(--text)]">
          Am actualizat{' '}
          <Link href="/termeni" className="font-semibold text-[var(--brand)] underline">
            Termenii și Condițiile
          </Link>
          . Te rugăm să îi accepți pentru a continua.
        </p>
      </div>
      <Button type="button" loading={loading} onClick={accept} className="shrink-0 px-5 py-2.5 text-sm">
        Accept termenii
      </Button>
    </div>
  )
}
