import { prisma } from './prisma'
import { parsePhotos } from './storage'
import { contractDocumentHash } from './qes'
import type { SessionUser } from './session'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info'

export type OfferView = {
  id: string
  property: string
  counterparty: string
  amount: string
  status: string
  statusVariant: BadgeVariant
  date: string
  actionable: boolean
}

export type ContractView = {
  id: string
  property: string
  tenant: string
  type: 'INCHIRIERE' | 'VANZARE'
  // Eticheta termenului financiar: „1.500 RON / lună” (chirie) sau „250.000 RON” (preț vânzare).
  terms: string
  signedByOwner: boolean
  signedByClient: boolean
  qes: boolean
  status: string
  statusVariant: BadgeVariant
  canSign: boolean
  documentHash: string
  canPay: boolean
  dueAmount: string | null
  // Tipul plății scadente, pentru a apela acțiunea potrivită (CHIRIE → payRent, AVANS/REST → paySale).
  dueType: 'CHIRIE' | 'AVANS' | 'REST' | null
  // Progresul plăților, vizibil pe card („3 din 12 chirii achitate”, „Avans achitat”…).
  paymentProgress: string | null
  // Data următoarei scadențe (chirie), ca utilizatorul să vadă că s-a schimbat după plată.
  nextDueDate: string | null
}

export type PropertyView = {
  id: string
  title: string
  location: string
  transactionType: 'INCHIRIERE' | 'VANZARE'
  // Eticheta de preț: „1.500 RON / lună” (închiriere) sau „250.000 RON” (vânzare).
  price: string
  status: string
  statusVariant: BadgeVariant
  updated: string
  photos: string[]
  pendingOffers: number
  // Valori brute pentru editare (folosite în dashboardul proprietarului).
  rentValue: number
  priceValue: number
  rooms: number | null
  surface: number | null
  description: string
}

// Eticheta de preț în funcție de tipul tranzacției.
function priceLabel(transactionType: string, rent: number, price: number) {
  return transactionType === 'VANZARE' ? formatRon(price) : `${formatRon(rent)} / lună`
}

export type PaymentView = {
  id: string
  reference: string
  date: string
  amount: string
  type: string
  status: string
  statusVariant: BadgeVariant
  // Plata finalizată are chitanță/factură descărcabilă (PDF).
  canDownloadReceipt: boolean
}

export type NotificationView = {
  id: string
  title: string
  description: string
  date: string
  variant: BadgeVariant
  read: boolean
}

export type TicketMessageView = {
  id: string
  author: string
  body: string
  date: string
  mine: boolean
}

export type TicketView = {
  id: string
  subject: string
  property: string
  // Cealaltă parte din conversație (pentru chiriaș: proprietarul; pentru proprietar/admin: chiriașul).
  counterparty: string
  category: string
  priority: string
  // Codul brut al priorității (SCAZUTA | NORMALA | URGENTA) pentru sortare în UI.
  priorityCode: string
  priorityVariant: BadgeVariant
  status: string
  // Codul brut al statusului (DESCHIS | IN_LUCRU | REZOLVAT | INCHIS) pentru logica din UI.
  statusCode: string
  statusVariant: BadgeVariant
  date: string
  // Numărul de mesaje și momentul ultimei activități (sortarea listei se face după `updatedAt`).
  messageCount: number
  lastActivity: string
  // Ultimul mesaj e de la cealaltă parte (răspuns nou de citit), iar tichetul nu e închis.
  hasNewReply: boolean
  messages: TicketMessageView[]
  // Poate schimba statusul prin orice tranziție (proprietar/admin); chiriașul are doar redeschide/închide.
  canManage: boolean
}

// Contract de închiriere activ pe care utilizatorul (chiriaș) poate deschide tichete.
export type TicketableContract = { id: string; label: string }

export type OverviewData = {
  stats: { label: string; value: string; highlight?: string }[]
  alerts: { id: string; title: string; description: string; variant: BadgeVariant; href: string }[]
  activity: { id: string; title: string; description: string; time: string; status: BadgeVariant }[]
}

const OFFER_STATUS: Record<string, { label: string; variant: BadgeVariant }> = {
  TRIMISA: { label: 'Trimisă', variant: 'info' },
  ACCEPTATA: { label: 'Acceptată', variant: 'success' },
  RESPINSA: { label: 'Respinsă', variant: 'danger' },
}

const CONTRACT_STATUS: Record<string, { label: string; variant: BadgeVariant }> = {
  IN_ASTEPTARE: { label: 'În așteptare', variant: 'warning' },
  SEMNAT: { label: 'Semnat', variant: 'info' },
  ACTIV: { label: 'Activ', variant: 'success' },
  INCHEIAT: { label: 'Încheiat', variant: 'info' },
}

const PROPERTY_STATUS: Record<string, { label: string; variant: BadgeVariant }> = {
  DISPONIBILA: { label: 'Disponibilă', variant: 'success' },
  INCHIRIATA: { label: 'Închiriată', variant: 'warning' },
  REZERVATA: { label: 'Rezervată', variant: 'warning' },
  VANDUTA: { label: 'Vândută', variant: 'info' },
  INACTIVA: { label: 'Inactivă', variant: 'danger' },
}

const PAYMENT_STATUS: Record<string, { label: string; variant: BadgeVariant }> = {
  FINALIZATA: { label: 'Finalizată', variant: 'success' },
  IN_CURS: { label: 'În curs', variant: 'warning' },
  ESUATA: { label: 'Eșuată', variant: 'danger' },
}

const TICKET_STATUS: Record<string, { label: string; variant: BadgeVariant }> = {
  DESCHIS: { label: 'Deschis', variant: 'warning' },
  IN_LUCRU: { label: 'În lucru', variant: 'info' },
  REZOLVAT: { label: 'Rezolvat', variant: 'success' },
  INCHIS: { label: 'Închis', variant: 'info' },
}

const TICKET_CATEGORY: Record<string, string> = {
  MENTENANTA: 'Mentenanță',
  PLATA: 'Plată',
  CONTRACT: 'Contract',
  ALTELE: 'Altele',
}

const TICKET_PRIORITY: Record<string, { label: string; variant: BadgeVariant }> = {
  SCAZUTA: { label: 'Scăzută', variant: 'info' },
  NORMALA: { label: 'Normală', variant: 'info' },
  URGENTA: { label: 'Urgentă', variant: 'danger' },
}

const PAYMENT_TYPE: Record<string, string> = {
  CHIRIE: 'Chirie',
  COMISION: 'Comision',
  REFUND: 'Restituire',
  AVANS: 'Avans',
  REST: 'Diferență preț',
  DAUNE: 'Rețineri daune',
}

// Tipuri de plăți datorate de chiriaș/cumpărător (folosite la calculul scadențelor și al venitului).
const PAYABLE_TYPES = ['CHIRIE', 'AVANS', 'REST'] as const

export function formatRon(amount: number) {
  return `${new Intl.NumberFormat('ro-RO').format(amount)} RON`
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'short' }).format(date)
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(date)
}

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'chiar acum'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `acum ${minutes} min.`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return hours === 1 ? 'acum 1 oră' : `acum ${hours} ore`
  const days = Math.floor(hours / 24)
  if (days < 30) return days === 1 ? 'ieri' : `acum ${days} zile`
  return formatDate(date)
}

function offerStatus(status: string) {
  return OFFER_STATUS[status] ?? { label: status, variant: 'info' as BadgeVariant }
}

export async function getOffers(user: SessionUser): Promise<{ sent: OfferView[]; received: OfferView[] }> {
  // Doar câmpurile folosite în UI — nu încărca rânduri User întregi (inclusiv passwordHash) doar pentru nume.
  const include = {
    property: { select: { title: true } },
    fromUser: { select: { firstName: true, lastName: true } },
    toUser: { select: { firstName: true, lastName: true } },
  }
  const orderBy = { createdAt: 'desc' as const }

  const [sent, received] = await Promise.all([
    prisma.offer.findMany({
      where: user.role === 'ADMIN' ? {} : { fromUserId: user.id },
      include,
      orderBy,
    }),
    prisma.offer.findMany({
      where: user.role === 'ADMIN' ? {} : { toUserId: user.id },
      include,
      orderBy,
    }),
  ])

  const toView = (offer: (typeof sent)[number], direction: 'sent' | 'received'): OfferView => {
    const counterparty = direction === 'sent' ? offer.toUser : offer.fromUser
    const { label, variant } = offerStatus(offer.status)
    return {
      id: offer.id,
      property: offer.property.title,
      counterparty: `${counterparty.firstName} ${counterparty.lastName}`,
      amount: formatRon(offer.amount),
      status: label,
      statusVariant: variant,
      date: formatDate(offer.createdAt),
      actionable: direction === 'received' && offer.status === 'TRIMISA' && (user.role !== 'ADMIN' ? offer.toUserId === user.id : true),
    }
  }

  return {
    sent: sent.map((offer) => toView(offer, 'sent')),
    received: received.map((offer) => toView(offer, 'received')),
  }
}

export async function getContracts(user: SessionUser): Promise<ContractView[]> {
  const contracts = await prisma.contract.findMany({
    where:
      user.role === 'ADMIN'
        ? {}
        : user.role === 'OWNER'
          ? { ownerId: user.id }
          : { tenantId: user.id },
    include: {
      // Doar câmpurile folosite în UI — evităm încărcarea rândului User întreg (inclusiv passwordHash).
      property: { select: { title: true } },
      tenant: { select: { firstName: true, lastName: true } },
      // Toate plățile contractului — folosim cele IN_CURS pentru scadență și cele FINALIZATA pentru progres.
      payments: {
        where: { type: { in: [...PAYABLE_TYPES] } },
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'asc' }],
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return contracts.map((contract) => {
    const { label, variant } = CONTRACT_STATUS[contract.status] ?? { label: contract.status, variant: 'info' as BadgeVariant }
    const signable = contract.status === 'IN_ASTEPTARE' || contract.status === 'SEMNAT'
    const canSign =
      signable &&
      ((contract.ownerId === user.id && !contract.signedByOwner) ||
        (contract.tenantId === user.id && !contract.signedByClient))
    const due = contract.payments.find((p) => p.status === 'IN_CURS') ?? null
    const isSale = contract.type === 'VANZARE'
    const { paymentProgress, nextDueDate } = contractPaymentProgress(contract, contract.payments, due)
    return {
      id: contract.id,
      property: contract.property.title,
      tenant: `${contract.tenant.firstName} ${contract.tenant.lastName}`,
      type: (isSale ? 'VANZARE' : 'INCHIRIERE') as 'INCHIRIERE' | 'VANZARE',
      terms: isSale ? formatRon(contract.price) : `${formatRon(contract.rent)} / lună`,
      signedByOwner: contract.signedByOwner,
      signedByClient: contract.signedByClient,
      qes: contract.qes,
      status: label,
      statusVariant: variant,
      canSign,
      documentHash: contractDocumentHash(contract),
      canPay: contract.status === 'ACTIV' && contract.tenantId === user.id && Boolean(due),
      dueAmount: due ? formatRon(due.amount) : null,
      dueType: (due?.type as 'CHIRIE' | 'AVANS' | 'REST' | undefined) ?? null,
      paymentProgress,
      nextDueDate,
    }
  })
}

// Rezumatul plăților pentru cardul de contract — astfel încât fiecare plată să producă o schimbare vizibilă.
type ContractPayment = { type: string; status: string; dueDate: Date | null }
function contractPaymentProgress(
  contract: { type: string; status: string; months: number },
  payments: ContractPayment[],
  due: ContractPayment | null
): { paymentProgress: string | null; nextDueDate: string | null } {
  const isSale = contract.type === 'VANZARE'

  if (isSale) {
    if (contract.status === 'INCHEIAT') return { paymentProgress: 'Vânzare finalizată — preț achitat integral', nextDueDate: null }
    const avansPaid = payments.some((p) => p.type === 'AVANS' && p.status === 'FINALIZATA')
    if (avansPaid) return { paymentProgress: 'Avans achitat — diferența rămâne de plată', nextDueDate: null }
    return { paymentProgress: null, nextDueDate: null }
  }

  if (contract.status === 'INCHEIAT') {
    return { paymentProgress: `Toate cele ${contract.months} chirii au fost achitate`, nextDueDate: null }
  }
  if (contract.status !== 'ACTIV') return { paymentProgress: null, nextDueDate: null }

  const paidRents = payments.filter((p) => p.type === 'CHIRIE' && p.status === 'FINALIZATA').length
  return {
    paymentProgress: `${paidRents} din ${contract.months} chirii achitate`,
    nextDueDate: due?.type === 'CHIRIE' && due.dueDate ? formatDate(due.dueDate) : null,
  }
}

// Contractele de închiriere active în care utilizatorul e chiriaș — singurele pe care poate deschide tichete.
export async function getTicketableContracts(user: SessionUser): Promise<TicketableContract[]> {
  const contracts = await prisma.contract.findMany({
    where: { tenantId: user.id, type: 'INCHIRIERE', status: 'ACTIV' },
    include: { property: true },
    orderBy: { createdAt: 'desc' },
  })
  return contracts.map((contract) => ({ id: contract.id, label: contract.property.title }))
}

export async function getTickets(user: SessionUser): Promise<TicketView[]> {
  const tickets = await prisma.ticket.findMany({
    where:
      user.role === 'ADMIN'
        ? {}
        : user.role === 'OWNER'
          ? { contract: { ownerId: user.id } }
          : { authorId: user.id },
    include: {
      // Doar câmpurile folosite în UI — fără rânduri User întregi (inclusiv passwordHash).
      contract: {
        include: {
          property: { select: { title: true } },
          owner: { select: { firstName: true, lastName: true } },
          tenant: { select: { firstName: true, lastName: true } },
        },
      },
      messages: {
        include: { author: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'asc' },
      },
      reads: { where: { userId: user.id }, take: 1 },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return tickets.map((ticket) => {
    const status = TICKET_STATUS[ticket.status] ?? { label: ticket.status, variant: 'info' as BadgeVariant }
    const priority = TICKET_PRIORITY[ticket.priority] ?? { label: ticket.priority, variant: 'info' as BadgeVariant }
    const isAuthor = ticket.authorId === user.id
    const counterparty = isAuthor ? ticket.contract.owner : ticket.contract.tenant
    const canManage = ticket.contract.ownerId === user.id || user.role === 'ADMIN'
    const lastMessage = ticket.messages[ticket.messages.length - 1]
    const lastReadAt = ticket.reads[0]?.readAt
    // Răspuns nou = ultimul mesaj e de la cealaltă parte și a sosit după ultima vizualizare a utilizatorului.
    const hasNewReply =
      ticket.status !== 'INCHIS' &&
      !!lastMessage &&
      lastMessage.authorId !== user.id &&
      (!lastReadAt || lastMessage.createdAt > lastReadAt)
    return {
      id: ticket.id,
      subject: ticket.subject,
      property: ticket.contract.property.title,
      counterparty: `${counterparty.firstName} ${counterparty.lastName}`,
      category: TICKET_CATEGORY[ticket.category] ?? ticket.category,
      priority: priority.label,
      priorityCode: ticket.priority,
      priorityVariant: priority.variant,
      status: status.label,
      statusCode: ticket.status,
      statusVariant: status.variant,
      date: formatDate(ticket.createdAt),
      messageCount: ticket.messages.length,
      lastActivity: timeAgo(ticket.updatedAt),
      hasNewReply,
      messages: ticket.messages.map((message) => ({
        id: message.id,
        author: `${message.author.firstName} ${message.author.lastName}`,
        body: message.body,
        date: formatDateTime(message.createdAt),
        mine: message.authorId === user.id,
      })),
      canManage,
    }
  })
}

export async function getProperties(user: SessionUser): Promise<{ owned: PropertyView[]; saved: PropertyView[] }> {
  const [owned, saved] = await Promise.all([
    prisma.property.findMany({
      where: user.role === 'ADMIN' ? {} : { ownerId: user.id },
      orderBy: { updatedAt: 'desc' },
      include: { offers: { where: { status: 'TRIMISA' }, select: { id: true } } },
    }),
    prisma.savedProperty.findMany({
      where: { userId: user.id },
      include: { property: true },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const toView = (
    property: (typeof owned)[number] | (typeof saved)[number]['property'],
    pendingOffers = 0
  ): PropertyView => {
    const { label, variant } = PROPERTY_STATUS[property.status] ?? { label: property.status, variant: 'info' as BadgeVariant }
    return {
      id: property.id,
      title: property.title,
      location: property.location,
      transactionType: (property.transactionType === 'VANZARE' ? 'VANZARE' : 'INCHIRIERE') as 'INCHIRIERE' | 'VANZARE',
      price: priceLabel(property.transactionType, property.rent, property.price),
      status: label,
      statusVariant: variant,
      updated: timeAgo(property.updatedAt),
      photos: parsePhotos(property.photos),
      pendingOffers,
      rentValue: property.rent,
      priceValue: property.price,
      rooms: property.rooms,
      surface: property.surface,
      description: property.description ?? '',
    }
  }

  return {
    owned: owned.map((property) => toView(property, property.offers.length)),
    saved: saved.map((entry) => ({
      ...toView(entry.property),
      status: 'Salvată',
      statusVariant: 'info',
    })),
  }
}

function paymentScope(user: SessionUser) {
  if (user.role === 'ADMIN') return {}
  if (user.role === 'OWNER') return { contract: { ownerId: user.id } }
  return { userId: user.id }
}

export async function getPayments(user: SessionUser): Promise<{
  summary: { totalIncome: string; pending: string; fees: string }
  transactions: PaymentView[]
}> {
  const where = paymentScope(user)

  // Sumarul se calculează în baza de date (agregat), nu prin încărcarea tuturor plăților în
  // memorie și sumare în JS — esențial pentru proprietari/admini cu istoric mare. Lista de
  // tranzacții afișează doar cele mai recente (sumarul rămâne complet, peste tot istoricul).
  const [income, pending, fees, payments] = await Promise.all([
    prisma.payment.aggregate({
      where: { ...where, type: { in: [...PAYABLE_TYPES] }, status: 'FINALIZATA' },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({ where: { ...where, status: 'IN_CURS' }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { ...where, type: 'COMISION' }, _sum: { amount: true } }),
    prisma.payment.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 }),
  ])

  return {
    summary: {
      totalIncome: formatRon(income._sum.amount ?? 0),
      pending: formatRon(pending._sum.amount ?? 0),
      fees: formatRon(fees._sum.amount ?? 0),
    },
    transactions: payments.map((payment) => {
      let { label, variant } = PAYMENT_STATUS[payment.status] ?? { label: payment.status, variant: 'info' as BadgeVariant }
      // O plată scadentă cu termenul depășit se afișează ca „Restant" (dunning).
      if (payment.status === 'IN_CURS' && payment.dueDate && payment.dueDate < new Date()) {
        label = 'Restant'
        variant = 'danger'
      }
      return {
        id: payment.id,
        reference: payment.reference,
        date: formatDate(payment.createdAt),
        amount: formatRon(payment.amount),
        type: PAYMENT_TYPE[payment.type] ?? payment.type,
        status: label,
        statusVariant: variant,
        canDownloadReceipt: payment.status === 'FINALIZATA',
      }
    }),
  }
}

export async function getNotifications(user: SessionUser): Promise<NotificationView[]> {
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  return notifications.map((notification) => ({
    id: notification.id,
    title: notification.title,
    description: notification.description,
    date: formatDate(notification.createdAt),
    variant: (notification.variant as BadgeVariant) || 'info',
    read: notification.read,
  }))
}

export async function getOverview(user: SessionUser): Promise<OverviewData> {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const contractWhere =
    user.role === 'ADMIN' ? {} : user.role === 'OWNER' ? { ownerId: user.id } : { tenantId: user.id }

  const [monthlyPayments, activeContracts, newOffers, ownedCount, savedCount, unsignedContracts, failedPayments, notifications] =
    await Promise.all([
      prisma.payment.findMany({
        where: { ...paymentScope(user), type: { in: [...PAYABLE_TYPES] }, status: 'FINALIZATA', createdAt: { gte: startOfMonth } },
      }),
      prisma.contract.count({ where: { ...contractWhere, status: 'ACTIV' } }),
      prisma.offer.count({
        where: user.role === 'ADMIN' ? { status: 'TRIMISA' } : { toUserId: user.id, status: 'TRIMISA' },
      }),
      prisma.property.count({ where: user.role === 'ADMIN' ? {} : { ownerId: user.id } }),
      prisma.savedProperty.count({ where: { userId: user.id } }),
      prisma.contract.findMany({
        where: {
          ...contractWhere,
          ...(user.role === 'CLIENT' ? { signedByClient: false } : { signedByOwner: false }),
          status: { not: 'ACTIV' },
        },
        include: { property: true },
        take: 3,
      }),
      prisma.payment.findMany({
        where: { ...paymentScope(user), status: 'ESUATA' },
        take: 3,
      }),
      prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 4 }),
    ])

  const monthlyTotal = monthlyPayments.reduce((total, p) => total + p.amount, 0)

  const stats =
    user.role === 'CLIENT'
      ? [
          { label: 'Plăți luna aceasta', value: formatRon(monthlyTotal) },
          { label: 'Contracte active', value: String(activeContracts) },
          { label: 'Oferte primite', value: String(newOffers) },
          { label: 'Proprietăți salvate', value: String(savedCount) },
        ]
      : [
          { label: user.role === 'ADMIN' ? 'Venit platformă (luna)' : 'Venit lunar', value: formatRon(monthlyTotal) },
          { label: 'Contracte active', value: String(activeContracts) },
          { label: 'Oferte noi', value: String(newOffers), highlight: newOffers > 0 ? 'Verifică' : undefined },
          { label: 'Proprietăți', value: String(ownedCount) },
        ]

  const alerts: OverviewData['alerts'] = [
    ...unsignedContracts.map((contract) => ({
      id: contract.id,
      title: 'Semnătură necesară',
      description: `Contractul pentru „${contract.property.title}” așteaptă semnătura ta.`,
      variant: 'warning' as BadgeVariant,
      href: '/dashboard/contracte',
    })),
    ...failedPayments.map((payment) => ({
      id: payment.id,
      title: 'Plată eșuată',
      description: `Tranzacția ${payment.reference} (${formatRon(payment.amount)}) a eșuat.`,
      variant: 'danger' as BadgeVariant,
      href: '/dashboard/plati',
    })),
  ]

  const activity = notifications.map((notification) => ({
    id: notification.id,
    title: notification.title,
    description: notification.description,
    time: timeAgo(notification.createdAt),
    status: (notification.variant as BadgeVariant) || 'info',
  }))

  return { stats, alerts, activity }
}
