import type { UserRole } from '@/lib/types/roles'

export type DashboardNavItem = {
  label: string
  href: string
  roles: UserRole[]
  icon: 'home' | 'offer' | 'contracts' | 'properties' | 'payments' | 'profile'
}

export type UserProfile = {
  firstName: string
  lastName: string
  role: UserRole
  email: string
  phone?: string
  avatar?: string
}

export type StatCard = {
  label: string
  value: string
  percentage?: string
  highlight?: string
}

export type AlertItem = {
  title: string
  description: string
  variant: 'info' | 'warning' | 'danger'
}

export type ActivityItem = {
  title: string
  description: string
  time: string
  status: 'success' | 'warning' | 'info'
}

export type OfferItem = {
  property: string
  counterparty: string
  amount: string
  status: 'Trimisă' | 'Primita' | 'Acceptată' | 'Respinsă'
  date: string
}

export type ContractItem = {
  property: string
  tenant: string
  signedByOwner: boolean
  signedByClient: boolean
  qes: boolean
  status: 'Activ' | 'În așteptare' | 'Semnat'
}

export type PropertyItem = {
  title: string
  location: string
  rent: string
  status: 'Disponibilă' | 'Închiriată' | 'Salvată'
  updated: string
}

export type PaymentTransaction = {
  id: string
  date: string
  amount: string
  type: 'Chirie' | 'Comision' | 'Refund'
  status: 'Finalizată' | 'În curs' | 'Eșuată'
}

export type ProfileNotification = {
  title: string
  description: string
  date: string
}

export const dashboardNavItems: DashboardNavItem[] = [
  { label: 'Overview', href: '/dashboard', roles: ['ADMIN', 'OWNER', 'CLIENT'], icon: 'home' },
  { label: 'Oferte', href: '/dashboard/oferte', roles: ['ADMIN', 'OWNER', 'CLIENT'], icon: 'offer' },
  { label: 'Contracte', href: '/dashboard/contracte', roles: ['ADMIN', 'OWNER', 'CLIENT'], icon: 'contracts' },
  { label: 'Proprietăți', href: '/dashboard/proprietati', roles: ['ADMIN', 'OWNER'], icon: 'properties' },
  { label: 'Plăți', href: '/dashboard/plati', roles: ['ADMIN', 'OWNER'], icon: 'payments' },
  { label: 'Profil', href: '/dashboard/profil', roles: ['ADMIN', 'OWNER', 'CLIENT'], icon: 'profile' },
]

export const dashboardMockUser: UserProfile = {
  firstName: 'Andrei',
  lastName: 'Ionescu',
  role: 'OWNER',
  email: 'andrei.ionescu@clavium.ro',
  phone: '+40 723 456 789',
  avatar: '',
}

export const dashboardStats: StatCard[] = [
  { label: 'Venit lunar', value: '12.800 RON', percentage: '+8.4%', highlight: 'În creștere' },
  { label: 'Contracte active', value: '14', percentage: '+5%', highlight: 'Stabil' },
  { label: 'Oferte noi', value: '7', percentage: '-12%', highlight: 'Verifică' },
  { label: 'Proprietăți salvate', value: '9', highlight: 'Favorit' },
]

export const dashboardAlerts: AlertItem[] = [
  {
    title: 'Semnătură QES necesară',
    description: 'Contractul 42 are nevoie de semnătură QES până mâine.',
    variant: 'warning',
  },
  {
    title: 'Plată întârziată',
    description: 'Chiria pentru apartamentul din Dorobanți este în întârziere cu 4 zile.',
    variant: 'danger',
  },
]

export const dashboardActivity: ActivityItem[] = [
  { title: 'Contract semnat', description: 'Contractul 15 a fost semnat de chiriaș.', time: 'acum 2 ore', status: 'success' },
  { title: 'Ofertă primită', description: 'Ai primit o ofertă nouă pentru apartament.', time: 'ieri', status: 'info' },
  { title: 'Document actualizat', description: 'Actele fiscale au fost încărcate pentru proprietatea ta.', time: '3 zile în urmă', status: 'warning' },
]

export const dashboardOffers = {
  sent: [
    { property: 'Apartament 2 camere Dorobanți', counterparty: 'Mihai Popescu', amount: '1.800 RON', status: 'Trimisă', date: '14 iun.' },
    { property: 'Garsonieră Pipera', counterparty: 'Ana Georgescu', amount: '1.250 RON', status: 'Respinsă', date: '8 iun.' },
  ],
  received: [
    { property: 'Vilă Pipera', counterparty: 'Ionel Marinescu', amount: '3.400 RON', status: 'Primita', date: '12 iun.' },
    { property: 'Loft Unirii', counterparty: 'Alina Matei', amount: '2.150 RON', status: 'Acceptată', date: '10 iun.' },
  ],
}

export const dashboardContracts: ContractItem[] = [
  { property: 'Apartament 3 camere Floreasca', tenant: 'Roxana Iancu', signedByOwner: true, signedByClient: false, qes: true, status: 'În așteptare' },
  { property: 'Penthouse Victoriei', tenant: 'Claudiu Dumitru', signedByOwner: true, signedByClient: true, qes: true, status: 'Activ' },
]

export const dashboardProperties = {
  owned: [
    { title: 'Apartament 2 camere Dorobanți', location: 'București', rent: '1.800 RON', status: 'Închiriată', updated: '4 ore în urmă' },
    { title: 'Garsonieră Tineretului', location: 'București', rent: '1.250 RON', status: 'Disponibilă', updated: '1 zi în urmă' },
  ],
  saved: [
    { title: 'Loft Unirii', location: 'București', rent: '2.150 RON', status: 'Salvată', updated: '7 zile în urmă' },
  ],
}

export const dashboardPayments = {
  summary: {
    totalIncome: '47.200 RON',
    pending: '5.400 RON',
    fees: '2.100 RON',
  },
  transactions: [
    { id: 'TRX-0012', date: '14 iun.', amount: '1.800 RON', type: 'Chirie', status: 'Finalizată' },
    { id: 'TRX-0009', date: '10 iun.', amount: '250 RON', type: 'Comision', status: 'Finalizată' },
    { id: 'TRX-0005', date: '8 iun.', amount: '1.250 RON', type: 'Chirie', status: 'În curs' },
  ],
}

export const dashboardProfileNotifications: ProfileNotification[] = [
  { title: 'Notificare securitate', description: 'Verifică autentificarea cu doi factori.', date: '14 iun.' },
  { title: 'Actualizare profil', description: 'Adaugă poza de profil pentru credibilitate.', date: '12 iun.' },
]
