import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export async function GET(req) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ user: null });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return NextResponse.json({ user: { id: payload.sub, name: payload.name, email: payload.email, role: payload.role } });
  } catch {
    return NextResponse.json({ user: null });
  }
}
