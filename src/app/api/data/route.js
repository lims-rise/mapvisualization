import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../../lib/db';

export async function GET(request) {
  const db = getDbConnection(); // Mendapatkan koneksi dari singleton
  const { searchParams } = new URL(request.url);
  const selectedCampaign = searchParams.get('campaign');
  const selectedCountry = searchParams.get('country');
  
  try {
    // Mulai query dasar
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

    // Filter berdasarkan country jika ada
    if (selectedCountry) {
      query = query.where('country', selectedCountry);
    }

    // Filter berdasarkan campaign jika ada
    if (selectedCampaign) {
      // Memecah parameter campaign yang dipisahkan koma
      const campaignArray = selectedCampaign.split(',').map(campaign => campaign.trim());
      
      // Menggunakan whereIn untuk memfilter beberapa kampanye
      query = query.whereIn('campaign', campaignArray);
    }

    // Eksekusi query
    const result = await query;

    // Mengembalikan hasil dalam format JSON
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching data:', error);
    // Menangani error dan mengembalikan status 500
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
