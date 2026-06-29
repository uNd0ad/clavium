'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import { resolveReportAction } from '@/app/actions/reports'

// Acțiuni de moderare pentru o sesizare din coadă: rezolvă (acțiune luată) sau respinge (fals pozitiv).
export default function ReportResolveControls({ reportId }: { reportId: string }) {
  const router = useRouter()
  const [loading, startTransition] = useTransition()

  const resolve = (decision: 'REZOLVAT' | 'RESPINS') =>
    startTransition(async () => {
      const res = await resolveReportAction(reportId, decision)
      if (res.ok) {
        toast.success(decision === 'REZOLVAT' ? 'Sesizare rezolvată.' : 'Sesizare respinsă.')
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" loading={loading} onClick={() => resolve('REZOLVAT')} className="px-4 py-2 text-xs">
        Rezolvă
      </Button>
      <Button type="button" variant="outline" disabled={loading} onClick={() => resolve('RESPINS')} className="px-4 py-2 text-xs">
        Respinge
      </Button>
    </div>
  )
}
