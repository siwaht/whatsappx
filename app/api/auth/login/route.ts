import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { 
  verifyPassword, 
  generateToken, 
  isAccountLocked, 
  recordFailedLogin, 
  resetFailedLogins,
  getSessionExpiry 
} from '@/lib/auth';
import { cookies } from 'next/headers';
import { loginSchema, validateRequest } from '@/lib/validations';
import { rateLimit, authRateLimitConfig } from '@/lib/rate-limit';
import { createAuditLog, AuditActions } from '@/lib/audit';
import { logger } from '@/lib/logger';
import { createErrorResponse } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await rateLimit(request, authRateLimitConfig);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    
    // Validate input
    const validation = await validateRequest(loginSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Find user
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      logger.warn('Login attempt for non-existent user', { email });
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (await isAccountLocked(user.id)) {
      logger.warn('Login attempt on locked account', { userId: user.id });
      await createAuditLog({
        userId: user.id,
        action: AuditActions.LOGIN_FAILED,
        details: { reason: 'account_locked' },
        request,
      });
      return NextResponse.json(
        { success: false, error: 'Account is temporarily locked. Please try again later.' },
        { status: 403 }
      );
    }

    // Check if account is active
    if (!user.isActive) {
      logger.warn('Login attempt on disabled account', { userId: user.id });
      await createAuditLog({
        userId: user.id,
        action: AuditActions.LOGIN_FAILED,
        details: { reason: 'account_disabled' },
        request,
      });
      return NextResponse.json(
        { success: false, error: 'Account is disabled. Please contact administrator.' },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      await recordFailedLogin(user.id);
      logger.warn('Invalid password attempt', { userId: user.id });
      await createAuditLog({
        userId: user.id,
        action: AuditActions.LOGIN_FAILED,
        details: { reason: 'invalid_password' },
        request,
      });
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Reset failed login attempts
    await resetFailedLogins(user.id);

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
      action: AuditActions.LOGIN,
      request,
    });

    logger.info('User logged in', { userId: user.id });

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
    logger.error('Login error', error);
    return createErrorResponse(error);
  }
}
