import { NextResponse } from "next/server";
import { getDbConnection } from "../../../../lib/db";

export async function GET(request) {
  const db = getDbConnection(); // Mendapatkan koneksi dari singleton
  const { searchParams } = new URL(request.url);
  const countryCode = searchParams.get('country'); // Ambil parameter 'country' dari URL query
  const campaignParam = searchParams.get('campaign'); // Ambil parameter 'campaign' dari URL query

  try {
    // Buat query dasar
    const query = db('gdb_rise')
      .distinct('campaign', 'country')
      .orderBy(['campaign', 'country']); // Mengurutkan berdasarkan campaign, lalu country

    // Filter berdasarkan country jika ada
    if (countryCode) {
      if (typeof countryCode !== 'string' || countryCode.length !== 2) {
        // Validasi countryCode: harus string 2 karakter (ISO country code)
        return NextResponse.json(
          { error: 'Invalid country code' },
          { status: 400 }
        );
      }
      query.where('country', countryCode); // Filter berdasarkan country
    }

    // Filter berdasarkan campaign jika ada
    if (campaignParam) {
      // Memecah parameter 'campaign' jika lebih dari satu ID dipisahkan koma
      const campaignIds = campaignParam.split(',').map(id => id.trim());
      
      if (campaignIds.length > 0) {
        query.whereIn('campaign', campaignIds); // Menggunakan 'whereIn' untuk filter kampanye
      }
    }

    // Eksekusi query
    const result = await query;

    // Return hasil dalam format JSON
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error fetching campaigns:', error);

    // Return error dalam format JSON dengan status 500 (server error)
    return NextResponse.json(
      { error: 'Failed to fetch campaigns', details: error.message },
      { status: 500 }
    );
  }
}
