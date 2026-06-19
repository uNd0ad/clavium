import type { UserRole } from '@/lib/types/roles'

export type DashboardNavItem = {
  label: string
  href: string
  roles: UserRole[]
  icon: 'home' | 'search' | 'offer' | 'contracts' | 'tickets' | 'properties' | 'payments' | 'profile' | 'verify' | 'admin'
}

export type UserProfile = {
  firstName: string
  lastName: string
  role: UserRole
  email: string
  phone?: string
  avatar?: string
}

export const dashboardNavItems: DashboardNavItem[] = [
  { label: 'Overview', href: '/dashboard', roles: ['ADMIN', 'OWNER', 'CLIENT'], icon: 'home' },
  { label: 'Caută', href: '/dashboard/cauta', roles: ['ADMIN', 'OWNER', 'CLIENT'], icon: 'search' },
  { label: 'Oferte', href: '/dashboard/oferte', roles: ['ADMIN', 'OWNER', 'CLIENT'], icon: 'offer' },
  { label: 'Contracte', href: '/dashboard/contracte', roles: ['ADMIN', 'OWNER', 'CLIENT'], icon: 'contracts' },
  { label: 'Tichete', href: '/dashboard/tichete', roles: ['ADMIN', 'OWNER', 'CLIENT'], icon: 'tickets' },
  { label: 'Proprietăți', href: '/dashboard/proprietati', roles: ['ADMIN', 'OWNER'], icon: 'properties' },
  { label: 'Plăți', href: '/dashboard/plati', roles: ['ADMIN', 'OWNER'], icon: 'payments' },
  { label: 'Verificare', href: '/dashboard/verificare', roles: ['ADMIN', 'OWNER', 'CLIENT'], icon: 'verify' },
  { label: 'Profil', href: '/dashboard/profil', roles: ['ADMIN', 'OWNER', 'CLIENT'], icon: 'profile' },
  { label: 'Administrare', href: '/dashboard/admin', roles: ['ADMIN'], icon: 'admin' },
]
