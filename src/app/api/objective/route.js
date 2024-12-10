import { NextResponse } from "next/server";
import { getDbConnection } from "../../../../lib/db";

export async function GET(request) {
  const db = getDbConnection(); // Mendapatkan koneksi dari singleton
  const { searchParams } = new URL(request.url);
  const countryCode = searchParams.get('country'); // Ambil parameter 'country' dari URL query

  try {
    // Buat query dasar dengan JOIN antara gdb_rise_objective dan gdb_rise_country
    const query = db('gdb_rise_objective')
      .distinct('gdb_rise_objective.name', 'gdb_rise_objective.url_name', 'gdb_rise_country.prefix')  // Hilangkan koma ekstra
      .join('gdb_rise_country', function() {
        this.on('gdb_rise_objective.id_country', '=', 'gdb_rise_country.id_country');
      })
      .orderBy(['gdb_rise_objective.name', 'gdb_rise_objective.url_name']); // Mengurutkan berdasarkan name dan url_name

    // Tambahkan filter jika ada parameter 'country'
    if (countryCode) {
      if (typeof countryCode !== 'string' || countryCode.length !== 2) {
        // Validasi countryCode: harus string 2 karakter (ISO country code)
        return NextResponse.json(
          { error: 'Invalid country code' },
          { status: 400 }
        );
      }
      query.where('gdb_rise_country.prefix', countryCode); // Filter berdasarkan prefix negara
    }

    // Eksekusi query
    const result = await query;

    // Return hasil dalam format JSON
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error fetching settlement:', error);

    // Return error dalam format JSON dengan status 500 (server error)
    return NextResponse.json(
      { error: 'Failed to fetch settlement', details: error.message },
      { status: 500 }
    );
  }
}
