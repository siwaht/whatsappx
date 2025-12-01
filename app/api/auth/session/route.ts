import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { createErrorResponse } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    logger.error('Session check error', error);
    return createErrorResponse(error);
  }
}
