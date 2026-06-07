/**
 * Role-Based Access Control (RBAC) Documentation
 * 
 * This system implements three user roles with specific permissions and capabilities.
 */

/**
 * ROLE: ADMIN
 * 
 * Administrators have full control over the platform.
 * 
 * Permissions:
 * - manage_all_properties: Can view, edit, and delete any property
 * - view_all_documents: Can access all user documents
 * - manage_contracts: Can create, edit, and manage all contracts
 * - manage_users: Can manage user accounts and roles
 * - view_all_contracts: Can view all contracts in the system
 * - view_all_earnings: Can see financial information for all properties
 * 
 * Use Cases:
 * - Platform administrators
 * - Support team managing accounts
 * - System moderators
 */

/**
 * ROLE: OWNER
 * 
 * Property owners manage their own properties and earn income.
 * 
 * Permissions:
 * - view_own_properties: Can view only their properties
 * - view_own_contracts: Can view contracts for their properties
 * - view_own_earnings: Can see money earned from their properties
 * - manage_own_properties: Can add, edit, and manage their properties
 * 
 * Use Cases:
 * - Landlords listing properties
 * - Property managers
 * - Individual property owners
 */

/**
 * ROLE: CLIENT
 * 
 * Clients rent properties and manage their tenancy.
 * 
 * Permissions:
 * - view_active_contract: Can view the lease agreement
 * - view_rent_amount: Can see monthly rent details
 * - create_tickets: Can create support tickets for issues
 * 
 * Use Cases:
 * - Tenants renting properties
 * - Clients using properties
 */

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Check if user has permission
 * 
 * import { hasPermission } from '@/lib/types/roles'
 * 
 * if (hasPermission(user.role, 'manage_all_properties')) {
 *   // Show admin controls
 * }
 */

/**
 * Example 2: Protect API route with role requirement
 * 
 * import { requireRole } from '@/lib/rbac'
 * 
 * export async function GET(request: NextRequest) {
 *   const user = await getCurrentUser(request)
 *   
 *   const roleCheck = requireRole(user?.role, ['ADMIN', 'OWNER'])
 *   if (roleCheck) return roleCheck // Returns 403 if unauthorized
 *   
 *   // Process request
 * }
 */

/**
 * Example 3: Protect API route with permission requirement
 * 
 * import { requirePermission } from '@/lib/rbac'
 * 
 * export async function DELETE(request: NextRequest) {
 *   const user = await getCurrentUser(request)
 *   
 *   const permCheck = requirePermission(user?.role, 'manage_all_properties')
 *   if (permCheck) return permCheck // Returns 403 if insufficient permissions
 *   
 *   // Delete property logic
 * }
 */

/**
 * Example 4: Create user with specific role
 * 
 * import { createUser } from '@/lib/userStore'
 * import { ROLES } from '@/lib/types/roles'
 * 
 * const user = await createUser(
 *   'John',
 *   'Doe',
 *   'john@example.com',
 *   passwordHash,
 *   ROLES.OWNER  // Set role to OWNER
 * )
 */

/**
 * Example 5: Check role in component
 * 
 * import { checkRole } from '@/lib/rbac'
 * 
 * const result = checkRole({
 *   userRole: user.role,
 *   requiredPermission: 'view_own_properties'
 * })
 * 
 * if (result.allowed) {
 *   // Show content
 * } else {
 *   // Show error: result.error
 * }
 */

// ============================================================================
// REGISTRATION FLOW WITH ROLES
// ============================================================================

/**
 * By default, new users register as CLIENT.
 * 
 * To change the default role during registration, pass it in the request:
 * 
 * POST /api/auth/register
 * {
 *   "firstName": "Jane",
 *   "lastName": "Doe",
 *   "email": "jane@example.com",
 *   "password": "securepass123",
 *   "role": "OWNER"  // Optional, defaults to CLIENT
 * }
 */

// ============================================================================
// DATABASE SCHEMA
// ============================================================================

/**
 * User table role column:
 * 
 * role STRING DEFAULT 'CLIENT'
 * 
 * Valid values: 'ADMIN', 'OWNER', 'CLIENT'
 * 
 * Stored as string in SQLite (enums not supported by SQLite in Prisma)
 */

// ============================================================================
// MIDDLEWARE INTEGRATION
// ============================================================================

/**
 * Future: Add middleware to check roles on protected routes
 * 
 * Example middleware that checks if user has OWNER role:
 * 
 * export async function ownerMiddleware(
 *   req: NextRequest,
 *   ctx: NextMiddlewareEvent
 * ) {
 *   const user = await getCurrentUser(req)
 *   
 *   if (user?.role !== ROLES.OWNER) {
 *     return NextResponse.redirect(new URL('/unauthorized', req.url))
 *   }
 * }
 */
