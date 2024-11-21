import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../../lib/db';

export async function GET(request) {
  const db = getDbConnection(); // Mendapatkan koneksi dari singleton
  const { searchParams } = new URL(request.url);
  
  try {
    let query = db('gdb_rise_boundary').select(
      'gid',
      'name',
      'descriptio',
      'timestamp',
      'begin',
      'end',
      'altitudemo',
      'tessellate',
      'extrude',
      'visibility',
      'draworder',
      'icon',
      db.raw('ST_AsGeoJSON(geom) AS geom')
    );

    const result = await query;

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
