import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../../lib/db';

export async function GET(request) {
  const db = getDbConnection(); // Mendapatkan koneksi dari singleton
  const { searchParams } = new URL(request.url);
  const selectedCampaign = searchParams.get('campaign');
  const selectedCountry = searchParams.get('country');
  
  try {
    let query = db('gdb_rise').select(
      'gid',
      'id_map',
      'id_building',
      'hoid',
      'houseno',
      'settlement',
      'status',
      'structure',
      'country',
      'campaign',
      'connected',
      'note',
      db.raw('ST_AsGeoJSON(geom) AS geom')
    );

    // Filter berdasarkan campaign jika ada
    if (selectedCampaign) {
      query = query.where('campaign', selectedCampaign);
    }

    const result = await query;

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
