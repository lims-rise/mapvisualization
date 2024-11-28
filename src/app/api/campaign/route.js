// import { NextResponse } from "next/server";
// import { getDbConnection } from "../../../../lib/db";

// export async function GET(request) {
//     const db = getDbConnection(); // Mendapatkan koneksi dari singleton
//     try {
//         // Get distinct campaign values
//         let query = db('gdb_rise')
//             .distinct('campaign', 'country') // Use distinct to get unique campaigns
//             .orderBy('campaign', 'asc'); // You can order by the distinct campaign value
        
//         const result = await query;
        
//         // Return the unique campaigns as JSON response
//         return NextResponse.json(result);
//     } catch (error) {
//         console.error(error);
//         // Optionally, return an error response
//         return NextResponse.json({ error: 'Failed to fetch campaigns' });
//     }
// }


// api/campaign.js
// import { NextResponse } from "next/server";
// import { getDbConnection } from "../../../../lib/db";

// export async function GET(request) {
//   const db = getDbConnection(); // Mendapatkan koneksi dari singleton
//   const { searchParams } = new URL(request.url);
//   const countryCode = searchParams.get('country'); // Ambil parameter 'country' dari URL query
  
//   try {
//     let query = db('gdb_rise')
//       .distinct('campaign', 'country')
//       .orderBy('campaign', 'asc');
    
//     if (countryCode) {
//       query = query.where('country', countryCode); // Filter kampanye berdasarkan negara
//     }

//     const result = await query;
    
//     return NextResponse.json(result);
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: 'Failed to fetch campaigns' });
//   }
// }

import { NextResponse } from "next/server";
import { getDbConnection } from "../../../../lib/db";

export async function GET(request) {
  const db = getDbConnection(); // Mendapatkan koneksi dari singleton
  const { searchParams } = new URL(request.url);
  const countryCode = searchParams.get('country'); // Ambil parameter 'country' dari URL query

  try {
    // Buat query dasar
    const query = db('gdb_rise')
      .distinct('campaign', 'country')
      .orderBy(['campaign', 'country']); // Mengurutkan berdasarkan campaign, lalu country

    // Tambahkan filter jika ada parameter 'country'
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

