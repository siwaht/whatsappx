import { db } from './db';
import { logger } from './logger';
import { NextRequest } from 'next/server';

interface AuditLogParams {
  userId?: number;
  action: string;
  resource?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  request?: NextRequest;
}

export async function createAuditLog({
  userId,
  action,
  resource,
  resourceId,
  details,
  request,
}: AuditLogParams): Promise<void> {
  try {
    const ipAddress = request?.headers.get('x-forwarded-for') || 
                      request?.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request?.headers.get('user-agent') || undefined;

    await db.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        details: details ? JSON.parse(JSON.stringify(details)) : undefined,
        ipAddress,
        userAgent,
      },
    });

    logger.audit(action, userId, { resource, resourceId });
  } catch (error) {
    logger.error('Failed to create audit log', error, { action, userId });
  }
}

// Audit log actions
export const AuditActions = {
  // Auth
  LOGIN: 'login',
  LOGIN_FAILED: 'login_failed',
  LOGOUT: 'logout',
  REGISTER: 'register',
  
  // Users
  USER_CREATE: 'user_create',
  USER_UPDATE: 'user_update',
  USER_DELETE: 'user_delete',
  USER_ACTIVATE: 'user_activate',
  USER_DEACTIVATE: 'user_deactivate',
  
  // Roles
  ROLE_CREATE: 'role_create',
  ROLE_UPDATE: 'role_update',
  ROLE_DELETE: 'role_delete',
  ROLE_ASSIGN: 'role_assign',
  ROLE_REVOKE: 'role_revoke',
  
  // Instances
  INSTANCE_CREATE: 'instance_create',
  INSTANCE_DELETE: 'instance_delete',
  INSTANCE_RESTART: 'instance_restart',
  INSTANCE_CONNECT: 'instance_connect',
  INSTANCE_LOGOUT: 'instance_logout',
  
  // Messages
  MESSAGE_SEND: 'message_send',
  
  // Webhooks
  WEBHOOK_UPDATE: 'webhook_update',
  
  // Settings
  SETTINGS_UPDATE: 'settings_update',
} as const;



