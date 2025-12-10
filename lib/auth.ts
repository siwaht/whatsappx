import NextAuth, { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

async function getUserWithPermissions(email: string) {
  try {
    const userData = await prisma.user.findFirst({
      where: {
        email,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        firstName: true,
        lastName: true,
        isActive: true,
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!userData) {
      return null;
    }

    const permissions: string[] = [];
    let role: string | null = null;

    if (userData.userRoles && userData.userRoles.length > 0) {
      const userRole = userData.userRoles[0];
      role = userRole.role.name;

      if (userRole.role.rolePermissions) {
        permissions.push(
          ...userRole.role.rolePermissions.map((rp) => rp.permission.name)
        );
      }
    }

    const displayName = userData.firstName && userData.lastName
      ? `${userData.firstName} ${userData.lastName}`
      : userData.username;

    return {
      id: userData.id.toString(),
      email: userData.email,
      name: displayName,
      role,
      permissions,
      isActive: userData.isActive,
      passwordHash: userData.password,
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

async function updateLastLogin(userId: string) {
  try {
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { lastLoginAt: new Date() },
    });
  } catch (error) {
    console.error('Error updating last login:', error);
  }
}

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const user = await getUserWithPermissions(credentials.email as string);

          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          );

          if (!isPasswordValid) {
            return null;
          }

          await updateLastLogin(user.id);

          const { passwordHash, ...userWithoutPassword } = user;

          return userWithoutPassword;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id || '';
        token.email = user.email || '';
        token.name = user.name || null;
        token.role = user.role || null;
        token.permissions = user.permissions || [];
        token.isActive = user.isActive || false;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string | null,
          role: token.role as string | null,
          permissions: token.permissions as string[],
          isActive: token.isActive as boolean,
          emailVerified: null,
        };
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const isAuthPage = pathname.startsWith('/login');

      if (isAuthPage) {
        if (isLoggedIn) return Response.redirect(new URL('/', request.nextUrl));
        return true;
      }

      return isLoggedIn;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}
