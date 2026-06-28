import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import MobileTopBar from '@/components/dashboard/MobileTopBar'
import { NotificationProvider } from '@/components/dashboard/NotificationContext'
import KycBanner from '@/components/dashboard/KycBanner'
import TermsReconsentBanner from '@/components/dashboard/TermsReconsentBanner'
import { getCurrentUser } from '@/lib/session'
import { hasAcceptedCurrentTerms } from '@/lib/terms'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Clavium Dashboard',
  description: 'Panou de control pentru administrare, oferte, contracte și plăți.',
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }

  const [unreadCount, termsAccepted] = await Promise.all([
    prisma.notification.count({ where: { userId: user.id, read: false } }),
    hasAcceptedCurrentTerms(user.id),
  ])

  return (
    <NotificationProvider initialCount={unreadCount}>
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <MobileTopBar user={user} />
        <KycBanner status={user.kycStatus} />
        <div className="mx-auto flex min-h-[calc(100vh-88px)] max-w-[1400px] gap-6 px-4 py-6 lg:px-8">
          <Sidebar user={user} />
          {/* Conținutul curge direct pe fundalul gri (ca homepage); cardurile secțiunilor plutesc deasupra. */}
          <main className="min-w-0 flex-1">
            {!termsAccepted ? (
              <div className="mb-6">
                <TermsReconsentBanner />
              </div>
            ) : null}
            {children}
          </main>
        </div>
      </div>
    </NotificationProvider>
  )
}
