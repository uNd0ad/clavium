import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import InquiryThreadView from '@/components/dashboard/InquiryThreadView'
import { getCurrentUser } from '@/lib/session'
import { getInquiryThread } from '@/lib/inquiries'

export default async function InquiryThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  const { id } = await params
  const thread = await getInquiryThread(id, user)
  if (!thread) notFound()

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/dashboard/mesaje" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)]">
          <ArrowLeft size={15} /> Toate mesajele
        </Link>
        <Link href={`/proprietati/${thread.propertyId}`} className="text-sm font-semibold text-[var(--brand)]">
          Vezi listarea
        </Link>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          {thread.isOwner ? `Întrebare de la ${thread.counterpart}` : `Conversație cu ${thread.counterpart}`}
        </p>
        <h1 className="mt-1 text-2xl font-semibold">{thread.propertyTitle}</h1>
      </div>

      <InquiryThreadView thread={thread} />
    </section>
  )
}
