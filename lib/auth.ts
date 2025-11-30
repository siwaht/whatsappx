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
      `SELECT u.*, r.name as role_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.email = $1 AND u.is_active = TRUE`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return null;
    }

    const user = userResult.rows[0];

    // Fetch user permissions
    const permissionsResult = await client.query(
      `SELECT p.name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       JOIN role_permissions rp ON r.id = rp.role_id
       JOIN permissions p ON rp.permission_id = p.id
       WHERE u.email = $1 AND u.is_active = TRUE`,
      [email]
    );

    const permissions = permissionsResult.rows.map((row) => row.name);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role_name,
      permissions,
      isActive: user.is_active,
      passwordHash: user.password_hash,
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
      'UPDATE users SET last_login = NOW() WHERE id = $1',
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
