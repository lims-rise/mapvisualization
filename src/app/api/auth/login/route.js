import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../../../lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = '7d';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const db = getDbConnection();

    const lowered = String(email).trim().toLowerCase();
    const user = await db('gdb_users as u')
      .leftJoin('gdb_roles as r', 'u.role_id', 'r.id')
      .select('u.id', 'u.name', 'u.email', 'u.password_hash', 'r.name as role')
      .whereRaw('LOWER(u.email) = ?', [lowered])
      .first();

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    let valid = false;
    const stored = (user.password_hash || '').trim();
    const looksHashed = typeof stored === 'string' && stored.startsWith('$2');

    if (looksHashed) {
      // Try compare directly
      valid = await bcrypt.compare(password, stored);
      // Fallback for $2y$ variant hashes
      if (!valid && stored.startsWith('$2y$')) {
        try {
          const compat = stored.replace('$2y$', '$2a$');
          valid = await bcrypt.compare(password, compat);
        } catch {}
      }
    } else {
      // Legacy plaintext or other legacy hashes
      const md5 = crypto.createHash('md5').update(password).digest('hex');
      const sha1 = crypto.createHash('sha1').update(password).digest('hex');
      const isMd5 = /^[a-f0-9]{32}$/i.test(stored);
      const isSha1 = /^[a-f0-9]{40}$/i.test(stored);

      if (stored === password || (isMd5 && stored.toLowerCase() === md5) || (isSha1 && stored.toLowerCase() === sha1)) {
        try {
          const newHash = await bcrypt.hash(password, 10);
          await db('gdb_users').where('id', user.id).update({ password_hash: newHash, updated_at: db.fn.now() });
          valid = true;
        } catch (e) {
          console.warn('Password migration failed for user', user.email, e);
          valid = false;
        }
      } else {
        valid = false;
      }
    }

    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Set HttpOnly cookie
    const response = NextResponse.json({ message: 'Login successful' });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    return response;
  } catch (e) {
    console.error('Login error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
