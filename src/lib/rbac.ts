import { NextResponse } from 'next/server'
import type { UserRole } from './types/roles'
import { ROLE_PERMISSIONS } from './types/roles'

export interface RoleCheckRequest {
  userRole?: UserRole | null
  requiredRole?: UserRole | UserRole[]
  requiredPermission?: string
}

export function checkRole(options: RoleCheckRequest): { allowed: boolean; error?: string } {
  const { userRole, requiredRole, requiredPermission } = options

  if (!userRole) {
    return { allowed: false, error: 'Unauthenticated' }
  }

  if (requiredPermission) {
    const permissions = ROLE_PERMISSIONS[userRole] || []
    if (!permissions.includes(requiredPermission)) {
      return { allowed: false, error: 'Insufficient permissions' }
    }
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!roles.includes(userRole)) {
      return { allowed: false, error: 'Insufficient role' }
    }
  }

  return { allowed: true }
}

export function requireRole(userRole: UserRole | null | undefined, requiredRoles: UserRole | UserRole[]) {
  if (!userRole) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
  if (!roles.includes(userRole)) {
    return NextResponse.json({ error: 'Insufficient role' }, { status: 403 })
  }

  return null
}

export function requirePermission(userRole: UserRole | null | undefined, permission: string) {
  if (!userRole) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  const permissions = ROLE_PERMISSIONS[userRole] || []
  if (!permissions.includes(permission)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  return null
}
