import { redirect } from 'next/navigation'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import EmptyState from '@/components/dashboard/EmptyState'
import NewTicketForm from '@/components/dashboard/NewTicketForm'
import TicketList from '@/components/dashboard/TicketList'
import { getCurrentUser } from '@/lib/session'
import { getTickets, getTicketableContracts } from '@/lib/dashboardData'

export default async function DashboardTicketsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }

  const [tickets, ticketableContracts] = await Promise.all([getTickets(user), getTicketableContracts(user)])
  const canOpen = ticketableContracts.length > 0

  const description =
    user.role === 'CLIENT'
      ? 'Deschide o sesizare către proprietar pentru contractul tău de închiriere activ și urmărește răspunsurile.'
      : 'Sesizările trimise de chiriași pe contractele tale. Răspunde și actualizează statusul fiecărui tichet.'

  return (
    <section className="space-y-8">
      <DashboardHeader
        eyebrow="Asistență"
        title="Tichete"
        accent="& sesizări"
        description={description}
      />

      {canOpen ? <NewTicketForm contracts={ticketableContracts} /> : null}

      <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
        {tickets.length === 0 ? (
          <EmptyState
            message={
              canOpen
                ? 'Nu ai niciun tichet deschis. Folosește butonul „Deschide un tichet” pentru a trimite o sesizare proprietarului.'
                : user.role === 'CLIENT'
                  ? 'Vei putea deschide tichete după ce ai un contract de închiriere activ.'
                  : 'Nu există niciun tichet încă. Sesizările chiriașilor vor apărea aici.'
            }
            cta={user.role === 'CLIENT' && !canOpen ? { label: 'Vezi contractele', href: '/dashboard/contracte' } : undefined}
          />
        ) : (
          <TicketList tickets={tickets} />
        )}
      </div>
    </section>
  )
}
