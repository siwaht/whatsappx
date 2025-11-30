import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, hasPermission, isAdmin } from './auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: Awaited<ReturnType<typeof getCurrentUser>>;
}

export async function requireAuth(request: NextRequest): Promise<{
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
  response?: NextResponse;
}> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null as any,
      response: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }

  return { user };
}

export async function requirePermission(
  request: NextRequest,
  resource: string,
  action: string
): Promise<{
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
  response?: NextResponse;
}> {
  const authResult = await requireAuth(request);
  
  if (authResult.response) {
    return authResult;
  }

  const hasAccess = await hasPermission(authResult.user!, resource, action);
  const isAdminUser = await isAdmin(authResult.user!);

  if (!hasAccess && !isAdminUser) {
    return {
      user: authResult.user!,
      response: NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      ),
    };
  }

  return authResult;
}

export async function requireAdmin(request: NextRequest): Promise<{
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
  response?: NextResponse;
}> {
  const authResult = await requireAuth(request);
  
  if (authResult.response) {
    return authResult;
  }

  const isAdminUser = await isAdmin(authResult.user!);

  if (!isAdminUser) {
    return {
      user: authResult.user!,
      response: NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      ),
    };
  }

  return authResult;
}

