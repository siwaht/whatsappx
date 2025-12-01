import { edgeAuth } from '@/lib/auth-edge';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Extend NextRequest locally with the auth property injected by NextAuth middleware
interface NextRequestWithAuth extends NextRequest {
  auth?: {
    user?: {
      id: string;
      email: string;
      name: string | null;
      role: string | null;
      permissions: string[];
      isActive: boolean;
    };
  } | null;
}

// Define public routes that don't require authentication
const publicRoutes = ['/login'];

export const middleware = edgeAuth(async (request: NextRequestWithAuth) => {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow API routes (they handle their own auth)
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Use the session injected by edgeAuth
  const session = request.auth;

  if (!session?.user) {
    // Redirect to login if not authenticated
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Check if user is active
  if (!session.user.isActive) {
    const url = new URL('/login', request.url);
    url.searchParams.set('error', 'account_disabled');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

