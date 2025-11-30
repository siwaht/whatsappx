import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, generateToken, getSessionExpiry } from '@/lib/auth';
import { cookies } from 'next/headers';
import { registerSchema, validateRequest } from '@/lib/validations';
import { rateLimit, authRateLimitConfig } from '@/lib/rate-limit';
import { createAuditLog, AuditActions } from '@/lib/audit';
import { logger } from '@/lib/logger';
import { createErrorResponse, ConflictError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await rateLimit(request, authRateLimitConfig);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    
    // Validate input
    const validation = await validateRequest(registerSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { email, username, password, firstName, lastName } = validation.data;

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() },
        ],
      },
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'email' : 'username';
      throw new ConflictError(`User with this ${field} already exists`);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Check if this is the first user (make them admin)
    const userCount = await db.user.count();
    const isFirstUser = userCount === 0;

    // Create user
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password: hashedPassword,
        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null,
      },
    });

    // If first user, create admin role and assign it
    if (isFirstUser) {
      // Create admin role if it doesn't exist
      let adminRole = await db.role.findUnique({
        where: { name: 'admin' },
      });

      if (!adminRole) {
        adminRole = await db.role.create({
          data: {
            name: 'admin',
            description: 'Administrator with full access',
          },
        });

        // Create all permissions
        const resources = ['instances', 'messages', 'contacts', 'webhooks', 'users', 'settings', 'roles'];
        const actions = ['create', 'read', 'update', 'delete', 'manage'];

        const permissionData = resources.flatMap(resource =>
          actions.map(action => ({
            name: `${resource}:${action}`,
            resource,
            action,
            description: `Can ${action} ${resource}`,
          }))
        );

        await db.permission.createMany({
          data: permissionData,
          skipDuplicates: true,
        });

        // Assign all permissions to admin role
        const permissions = await db.permission.findMany();
        await db.rolePermission.createMany({
          data: permissions.map(p => ({
            roleId: adminRole!.id,
            permissionId: p.id,
          })),
          skipDuplicates: true,
        });
      }

      // Assign admin role to user
      await db.userRole.create({
        data: {
          userId: user.id,
          roleId: adminRole.id,
        },
      });

      logger.info('First user created as admin', { userId: user.id });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    // Get session expiry
    const expiresAt = getSessionExpiry();

    // Get IP and user agent for session
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    // Create session
    await db.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: Math.floor((expiresAt.getTime() - Date.now()) / 1000),
      path: '/',
    });

    // Audit log
    await createAuditLog({
      userId: user.id,
      action: AuditActions.REGISTER,
      resource: 'user',
      resourceId: user.id.toString(),
      request,
    });

    logger.info('New user registered', { userId: user.id, isFirstUser });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    logger.error('Registration error', error);
    return createErrorResponse(error);
  }
}
