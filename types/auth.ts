// Authentication and User Management Types

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl?: string | null;
  roleId: string | null;
  roleName?: string;
  isActive: boolean;
  isVerified: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  createdByName?: string | null;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  description: string | null;
  resource: string;
  action: string;
  createdAt: Date;
}

export interface RolePermission {
  roleId: string;
  permissionId: string;
  permission?: Permission;
}

export interface UserInstanceAccess {
  id: string;
  userId: string;
  instanceName: string;
  canRead: boolean;
  canWrite: boolean;
  canManage: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityLog {
  id: string;
  userId: string | null;
  action: string;
  resourceType: string | null;
  resourceId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, any> | null;
  createdAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  sessionToken: string;
  expires: Date;
  createdAt: Date;
}

// DTOs
export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  roleId: string;
  isActive?: boolean;
  isVerified?: boolean;
}

export interface UpdateUserDto {
  name?: string;
  roleId?: string;
  isActive?: boolean;
  isVerified?: boolean;
  avatarUrl?: string;
}

export interface UpdateUserPasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface UserWithPermissions extends User {
  permissions: Permission[];
}

// Permission Check Types
export type ResourceType =
  | 'users'
  | 'instances'
  | 'messages'
  | 'contacts'
  | 'groups'
  | 'webhooks'
  | 'settings'
  | 'analytics';

export type ActionType =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'manage'
  | 'send';

export interface PermissionCheck {
  resource: ResourceType;
  action: ActionType;
}

// NextAuth Extended Types
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
  permissions: string[];
  isActive: boolean;
}

declare module 'next-auth' {
  interface Session {
    user: AuthUser;
  }

  interface User extends AuthUser {}
}

declare module 'next-auth/jwt' {
  interface JWT extends AuthUser {}
}

// API Response Types
export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface RoleListResponse {
  roles: Role[];
  total: number;
}

export interface PermissionListResponse {
  permissions: Permission[];
  total: number;
}
