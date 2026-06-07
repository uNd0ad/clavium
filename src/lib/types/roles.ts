export type UserRole = 'ADMIN' | 'OWNER' | 'CLIENT'

export const ROLES = {
  ADMIN: 'ADMIN',
  OWNER: 'OWNER',
  CLIENT: 'CLIENT',
} as const

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  ADMIN: 'Administrator - Manages everything, sees all properties and documents',
  OWNER: 'Property Owner - Sees only their properties, contracts, and earnings',
  CLIENT: 'Client - Sees active contracts, rent amounts, can create tickets',
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  ADMIN: [
    'manage_all_properties',
    'view_all_documents',
    'manage_contracts',
    'manage_users',
    'view_all_contracts',
    'view_all_earnings',
  ],
  OWNER: [
    'view_own_properties',
    'view_own_contracts',
    'view_own_earnings',
    'manage_own_properties',
  ],
  CLIENT: [
    'view_active_contract',
    'view_rent_amount',
    'create_tickets',
  ],
}

export function isValidRole(role: string): role is UserRole {
  return Object.values(ROLES).includes(role as UserRole)
}

export function hasPermission(role: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function canAccessResource(userRole: UserRole, requiredPermission: string): boolean {
  return hasPermission(userRole, requiredPermission)
}
