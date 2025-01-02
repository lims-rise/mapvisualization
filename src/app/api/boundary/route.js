import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../../lib/db';

export async function GET(request) {
  const db = getDbConnection(); // Mendapatkan koneksi dari singleton
  const { searchParams } = new URL(request.url);
  const selectedCountry = searchParams.get('id_country');

  // Debugging log untuk memastikan parameter yang diterima benar
  console.log('Selected Country:', selectedCountry);

  try {
    let query = db('gdb_rise_boundary')
      .select(
        'gid',
        'name',
        'id_country',
        db.raw('ST_AsGeoJSON(geom) AS geom'),
      )
      // .leftJoin('gdb_rise_country', 'gdb_rise_boundary2.id_country', 'gdb_rise_country.id_country'); // Melakukan JOIN pada tabel gdb_rise_country

    // Filter berdasarkan country jika ada
    if (selectedCountry) {
      console.log('Applying country filter:', selectedCountry);  // Debugging filter
      query = query.where('id_country', selectedCountry); // Menambahkan filter berdasarkan id_country
    }

    // Debugging: Print query SQL untuk memastikan sintaksnya benar
    console.log('Generated SQL:', query.toString());

    const result = await query;

    // Pastikan hasil yang dikembalikan hanya sesuai dengan filter
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
