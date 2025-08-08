import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../../lib/db';

export async function GET(request) {
  const db = getDbConnection(); // Koneksi ke database
  const { searchParams } = new URL(request.url);
  const selectedCountry = searchParams.get('id_country');

  try {
    let query = db('gdb_onewater2').select(
      'gid AS organisation_id',
      'state',
      'tier',
      'organisati AS organisation',
      'organisa_1 AS organisation_type',
      'address',
      'comments',
      'connections',
      'latitude',
      'longitude',
    );

    // Jika API ini dipakai untuk Map, tambahkan geom
    const includeGeom = searchParams.get('includeGeom');
    if (includeGeom === 'true') {
      query.select(db.raw('ST_AsGeoJSON(geom) AS geom'));
    }

    const result = await query;
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
