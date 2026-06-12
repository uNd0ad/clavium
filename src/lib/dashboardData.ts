import { prisma } from './prisma'
import { parsePhotos } from './storage'
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
  rent: string
  signedByOwner: boolean
  signedByClient: boolean
  qes: boolean
  status: string
  statusVariant: BadgeVariant
  canSign: boolean
  canPay: boolean
  dueAmount: string | null
}

export type PropertyView = {
  id: string
  title: string
  location: string
  rent: string
  status: string
  statusVariant: BadgeVariant
  updated: string
  photos: string[]
}

export type PaymentView = {
  id: string
  reference: string
  date: string
  amount: string
  type: string
  status: string
  statusVariant: BadgeVariant
}

export type NotificationView = {
  id: string
  title: string
  description: string
  date: string
  variant: BadgeVariant
  read: boolean
}

export type OverviewData = {
  stats: { label: string; value: string; highlight?: string }[]
  alerts: { id: string; title: string; description: string; variant: BadgeVariant }[]
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
  INACTIVA: { label: 'Inactivă', variant: 'danger' },
}

const PAYMENT_STATUS: Record<string, { label: string; variant: BadgeVariant }> = {
  FINALIZATA: { label: 'Finalizată', variant: 'success' },
  IN_CURS: { label: 'În curs', variant: 'warning' },
  ESUATA: { label: 'Eșuată', variant: 'danger' },
}

const PAYMENT_TYPE: Record<string, string> = {
  CHIRIE: 'Chirie',
  COMISION: 'Comision',
  REFUND: 'Refund',
}

export function formatRon(amount: number) {
  return `${new Intl.NumberFormat('ro-RO').format(amount)} RON`
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('ro-RO', { day: 'numeric', month: 'short' }).format(date)
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
  const include = { property: true, fromUser: true, toUser: true }
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
      property: true,
      tenant: true,
      payments: { where: { type: 'CHIRIE', status: 'IN_CURS' }, orderBy: { dueDate: 'asc' }, take: 1 },
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
    const due = contract.payments[0]
    return {
      id: contract.id,
      property: contract.property.title,
      tenant: `${contract.tenant.firstName} ${contract.tenant.lastName}`,
      rent: formatRon(contract.rent),
      signedByOwner: contract.signedByOwner,
      signedByClient: contract.signedByClient,
      qes: contract.qes,
      status: label,
      statusVariant: variant,
      canSign,
      canPay: contract.status === 'ACTIV' && contract.tenantId === user.id && Boolean(due),
      dueAmount: due ? formatRon(due.amount) : null,
    }
  })
}

export async function getProperties(user: SessionUser): Promise<{ owned: PropertyView[]; saved: PropertyView[] }> {
  const [owned, saved] = await Promise.all([
    prisma.property.findMany({
      where: user.role === 'ADMIN' ? {} : { ownerId: user.id },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.savedProperty.findMany({
      where: { userId: user.id },
      include: { property: true },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const toView = (property: (typeof owned)[number]): PropertyView => {
    const { label, variant } = PROPERTY_STATUS[property.status] ?? { label: property.status, variant: 'info' as BadgeVariant }
    return {
      id: property.id,
      title: property.title,
      location: property.location,
      rent: `${formatRon(property.rent)} / lună`,
      status: label,
      statusVariant: variant,
      updated: timeAgo(property.updatedAt),
      photos: parsePhotos(property.photos),
    }
  }

  return {
    owned: owned.map(toView),
    saved: saved.map((entry) => ({ ...toView(entry.property), status: 'Salvată', statusVariant: 'info' })),
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
  const payments = await prisma.payment.findMany({ where, orderBy: { createdAt: 'desc' } })

  const sum = (filter: (p: (typeof payments)[number]) => boolean) =>
    payments.filter(filter).reduce((total, p) => total + p.amount, 0)

  return {
    summary: {
      totalIncome: formatRon(sum((p) => p.type === 'CHIRIE' && p.status === 'FINALIZATA')),
      pending: formatRon(sum((p) => p.status === 'IN_CURS')),
      fees: formatRon(sum((p) => p.type === 'COMISION')),
    },
    transactions: payments.map((payment) => {
      const { label, variant } = PAYMENT_STATUS[payment.status] ?? { label: payment.status, variant: 'info' as BadgeVariant }
      return {
        id: payment.id,
        reference: payment.reference,
        date: formatDate(payment.createdAt),
        amount: formatRon(payment.amount),
        type: PAYMENT_TYPE[payment.type] ?? payment.type,
        status: label,
        statusVariant: variant,
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
        where: { ...paymentScope(user), type: 'CHIRIE', status: 'FINALIZATA', createdAt: { gte: startOfMonth } },
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
    })),
    ...failedPayments.map((payment) => ({
      id: payment.id,
      title: 'Plată eșuată',
      description: `Tranzacția ${payment.reference} (${formatRon(payment.amount)}) a eșuat.`,
      variant: 'danger' as BadgeVariant,
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
