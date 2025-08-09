import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../../lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function getUserFromReq(req) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function GET() {
  const db = getDbConnection();
  const rows = await db('gdb_users as u')
    .leftJoin('gdb_roles as r', 'u.role_id', 'r.id')
    .select('u.id', 'u.name', 'u.email', 'r.name as role');
  return NextResponse.json(rows);
}

export async function POST(req) {
  const user = getUserFromReq(req);
  if (!user || user.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { name, email, password, role_id } = body || {};
    if (!name || !email || !password || !role_id) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    const db = getDbConnection();
    const hash = await bcrypt.hash(password, 10);
    const [created] = await db('gdb_users')
      .insert({ name, email, password_hash: hash, role_id })
      .returning(['id', 'name', 'email']);

    const roleRow = await db('gdb_roles').select('name').where('id', role_id).first();
    return NextResponse.json({ ...created, role: roleRow?.name || '-' });
  } catch (e) {
    console.error('Create user error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
