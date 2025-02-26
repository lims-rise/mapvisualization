import { NextResponse } from "next/server";
import { getDbConnection } from "../../../../lib/db";

export async function GET(request) {
    const db = getDbConnection(); // Mendapatkan koneksi dari singleton
    const {searchParams} = new URL(request.url);
    const selectedCountry = searchParams.get('id_country');
    const selectedSettlement = searchParams.get('settlement');

    try {
        let query = db('gdb_rise_o2b_bootsock').select(
            'gid',
            'id',
            'township',
            db.raw('ST_AsGeoJSON(geom) AS geom')
        );

        // Filter berdasarkan country jika ada
        if (selectedCountry) {
            console.log('Applying country filter:', selectedCountry);  // Debugging filter
            query = query.where('id_country', selectedCountry); // Menambahkan filter berdasarkan id_country
        }
    
        if (selectedSettlement) {
            console.log('Applying country filter:', selectedSettlement);  // Debugging filter
            query = query.where('township', selectedSettlement); // Menambahkan filter berdasarkan id_country
        }
  
        // Debugging: Print query SQL untuk memastikan sintaksnya benar
        console.log('Generated SQL:', query.toString());

        const result = await query;
        return NextResponse.json(result);

    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}