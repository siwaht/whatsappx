import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { auth } from '@/lib/auth';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET /api/users - List all users
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permission
    if (!session.user.permissions.includes('users.read')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT * FROM v_users_with_roles
        ORDER BY created_at DESC
      `);

      return NextResponse.json({ users: result.rows });
    } finally {
      client.release();
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user.permissions.includes('users.create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, name, roleId, isActive = true, isVerified = false } = body;

    // Validate required fields
    if (!email || !password || !name || !roleId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      // Check if email already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        );
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Insert user
      const result = await client.query(
        `INSERT INTO users (email, password_hash, name, role_id, is_active, is_verified, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, email, name, role_id, is_active, is_verified, created_at`,
        [email, passwordHash, name, roleId, isActive, isVerified, session.user.id]
      );

      return NextResponse.json({ user: result.rows[0] }, { status: 201 });
    } finally {
      client.release();
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
