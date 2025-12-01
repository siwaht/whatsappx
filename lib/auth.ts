import NextAuth, { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Fetch user with permissions from database
async function getUserWithPermissions(email: string) {
  const client = await pool.connect();
  try {
    const userResult = await client.query(
      `SELECT u.id, u.email, u.username, u.password, u.first_name, u.last_name, u.is_active
       FROM users u
       WHERE u.email = $1 AND u.is_active = TRUE`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return null;
    }

    const user = userResult.rows[0];

    // Fetch user role and permissions through user_roles join table
    const permissionsResult = await client.query(
      `SELECT DISTINCT r.name as role_name, p.name as permission_name
       FROM users u
       JOIN user_roles ur ON u.id = ur.user_id
       JOIN roles r ON ur.role_id = r.id
       JOIN role_permissions rp ON r.id = rp.role_id
       JOIN permissions p ON rp.permission_id = p.id
       WHERE u.email = $1 AND u.is_active = TRUE`,
      [email]
    );

    const permissions = permissionsResult.rows.map((row) => row.permission_name);
    const role = permissionsResult.rows.length > 0 ? permissionsResult.rows[0].role_name : null;

    // Build display name from first_name + last_name, fallback to username
    const displayName = user.first_name && user.last_name 
      ? `${user.first_name} ${user.last_name}` 
      : user.username;

    return {
      id: user.id.toString(),
      email: user.email,
      name: displayName,
      role,
      permissions,
      isActive: user.is_active,
      passwordHash: user.password,
    };
  } finally {
    client.release();
  }
}

// Update last login time
async function updateLastLogin(userId: string) {
  const client = await pool.connect();
  try {
    await client.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [userId]
    );
  } finally {
    client.release();
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
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.permissions = user.permissions;
        token.isActive = user.isActive;
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
