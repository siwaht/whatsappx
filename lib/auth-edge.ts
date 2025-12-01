import NextAuth, { NextAuthConfig } from 'next-auth';

// Edge-runtime-safe Auth.js configuration used only in middleware.
// It must not import any Node.js-only modules (like 'pg' or 'bcryptjs').
const authEdgeConfig: NextAuthConfig = {
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Mirror the fields we attach in the main auth config
        // so that req.auth and session.user have the same shape.
        // "user" here comes from the core library and is serializable.
        // Cast to any to avoid tight coupling to the server-side User type.
        const u: any = user;
        token.id = u.id;
        token.email = u.email;
        token.name = u.name;
        token.role = u.role;
        token.permissions = u.permissions;
        token.isActive = u.isActive;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        // Keep session.user in sync with the JWT payload
        session.user = {
          id: token.id as string,
          email: token.email as string,
          name: (token.name as string | null) ?? null,
          role: (token.role as string | null) ?? null,
          permissions: (token.permissions as string[]) ?? [],
          isActive: (token.isActive as boolean) ?? false,
          // Included for compatibility with extended Session types
          emailVerified: null,
        };
      }
      return session;
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

export const { auth: edgeAuth } = NextAuth(authEdgeConfig);
