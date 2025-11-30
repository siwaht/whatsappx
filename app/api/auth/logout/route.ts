import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { createAuditLog, AuditActions } from '@/lib/audit';
import { logger } from '@/lib/logger';
import { createErrorResponse } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (token) {
      // Delete session from database
      await db.session.deleteMany({
        where: { token },
      });
    }

    // Clear cookie
    cookieStore.delete('auth-token');

    // Audit log if user was authenticated
    if (user) {
      await createAuditLog({
        userId: user.id,
        action: AuditActions.LOGOUT,
        request,
      });
      logger.info('User logged out', { userId: user.id });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Logout error', error);
    return createErrorResponse(error);
  }
}
