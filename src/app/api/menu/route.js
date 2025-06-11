import { NextResponse } from "next/server";
import { getDbConnection } from "../../../../lib/db";

export async function GET(request) {
  const db = getDbConnection(); // Mendapatkan koneksi dari singleton
  const { searchParams } = new URL(request.url);
  const countryCode = searchParams.get('id_country'); // Ambil parameter 'country' dari URL query

  try {
    // Pastikan countryCode adalah integer
    if (countryCode) {
      const countryCodeInt = parseInt(countryCode, 10);
      if (isNaN(countryCodeInt)) {
        return NextResponse.json(
          { error: 'Invalid country code, it must be a valid integer' },
          { status: 400 }
        );
      }
    }

    // Buat query dasar dengan DISTINCT pada kombinasi menu dan id_country
    const query = db('menu')
      .distinct('menu.menu', 'menu.id_country', 'menu.id_menu') // Menambahkan id_menu dalam SELECT
      .join('country', 'menu.id_country', '=', 'country.id_country') // Melakukan JOIN dengan tabel 'country'
      .orderBy(['menu.id_menu']); // Mengurutkan berdasarkan id_menu dari tabel menu

    // Filter berdasarkan country jika ada
    if (countryCode) {
      const countryCodeInt = parseInt(countryCode, 10); // Pastikan countryCode menjadi integer
      query.where('menu.id_country', countryCodeInt); // Filter berdasarkan id_country yang berupa integer
    }

    // Eksekusi query
    const result = await query;

    // Return hasil dalam format JSON
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error fetching menu:', error);

    // Return error dalam format JSON dengan status 500 (server error)
    return NextResponse.json(
      { error: 'Failed to fetch menu', details: error.message },
      { status: 500 }
    );
  }
}
