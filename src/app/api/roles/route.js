import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../../lib/db';

export async function GET() {
  const db = getDbConnection();
  const roles = await db('gdb_roles').select('id', 'name');
  return NextResponse.json(roles);
}
