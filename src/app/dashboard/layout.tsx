import type { Metadata } from 'next'
import Sidebar from '@/components/dashboard/Sidebar'
import MobileTopBar from '@/components/dashboard/MobileTopBar'
import { dashboardMockUser } from '@/types/dashboard'

export const metadata: Metadata = {
  title: 'Clavium Dashboard',
  description: 'Panou de control pentru administrare, oferte, contracte și plăți.',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--text)]">
      <MobileTopBar user={dashboardMockUser} />
      <div className="mx-auto flex min-h-[calc(100vh-88px)] max-w-[1400px] gap-6 px-4 py-6 lg:px-8">
        <Sidebar user={dashboardMockUser} />
        <main className="flex-1 rounded-[32px] border border-[var(--border)] bg-white p-6 shadow-sm">{children}</main>
      </div>
    </div>
  )
}
