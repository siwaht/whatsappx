import { auth } from './auth';
import type { ResourceType, ActionType } from '@/types/auth';

// Check if user has a specific permission
export async function hasPermission(
  resource: ResourceType,
  action: ActionType
): Promise<boolean> {
  const session = await auth();

  if (!session?.user) {
    return false;
  }

  const permissionName = `${resource}.${action}`;
  return session.user.permissions.includes(permissionName);
}

// Check if user has any of the specified permissions
export async function hasAnyPermission(
  permissions: Array<{ resource: ResourceType; action: ActionType }>
): Promise<boolean> {
  const session = await auth();

  if (!session?.user) {
    return false;
  }

  return permissions.some((perm) => {
    const permissionName = `${perm.resource}.${perm.action}`;
    return session.user.permissions.includes(permissionName);
  });
}

// Check if user has all of the specified permissions
export async function hasAllPermissions(
  permissions: Array<{ resource: ResourceType; action: ActionType }>
): Promise<boolean> {
  const session = await auth();

  if (!session?.user) {
    return false;
  }

  return permissions.every((perm) => {
    const permissionName = `${perm.resource}.${perm.action}`;
    return session.user.permissions.includes(permissionName);
  });
}

// Check if user is admin
export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === 'admin' || session?.user?.role === 'super_admin';
}

// Check if user is super admin
export async function isSuperAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === 'super_admin';
}

// Get current user session
export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}

// Permission decorator for API routes
export function requirePermission(resource: ResourceType, action: ActionType) {
  return async function (handler: Function) {
    const allowed = await hasPermission(resource, action);

    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return handler();
  };
}

// Client-side permission check hook
export function usePermissions() {
  return {
    hasPermission: (resource: ResourceType, action: ActionType) => {
      // This will be implemented on the client side
      return false;
    },
    isAdmin: () => false,
    isSuperAdmin: () => false,
  };
}
