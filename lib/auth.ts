import NextAuth, { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getUserWithPermissions(email: string) {
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, username, password, first_name, last_name, is_active')
      .eq('email', email)
      .eq('is_active', true)
      .maybeSingle();

    if (userError || !userData) {
      return null;
    }

    const { data: permissionsData } = await supabase
      .from('user_roles')
      .select(`
        roles (
          name,
          role_permissions (
            permissions (
              name
            )
          )
        )
      `)
      .eq('user_id', userData.id);

    const permissions: string[] = [];
    let role: string | null = null;

    if (permissionsData && permissionsData.length > 0) {
      const roleData = permissionsData[0].roles as any;
      role = roleData.name;

      if (roleData.role_permissions) {
        permissions.push(
          ...roleData.role_permissions.map((rp: any) => rp.permissions.name)
        );
      }
    }

    const displayName = userData.first_name && userData.last_name
      ? `${userData.first_name} ${userData.last_name}`
      : userData.username;

    return {
      id: userData.id.toString(),
      email: userData.email,
      name: displayName,
      role,
      permissions,
      isActive: userData.is_active,
      passwordHash: userData.password,
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

async function updateLastLogin(userId: string) {
  try {
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', parseInt(userId));
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

          // Update last login
          await updateLastLogin(user.id);

          // Remove password hash from response
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}
