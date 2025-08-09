import React from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) {
    redirect('/login?redirect=/dashboard');
  }
  try {
    jwt.verify(token, JWT_SECRET);
  } catch {
    redirect('/login?redirect=/dashboard');
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
    </div>
  );
}
