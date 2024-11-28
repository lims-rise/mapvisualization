import { NextResponse } from "next/server";
import { getDbConnection } from "../../../../lib/db";

export async function GET(request) {
    const db = getDbConnection(); // Mendapatkan koneksi dari singleton
    try {
        // Get distinct campaign values
        let query = db('gdb_rise_country')
            .select('id_country', 'lat', 'long', 'name','prefix','zoom', 'utmprojection')
            .orderBy('id_country', 'asc'); // You can order by the distinct campaign value
        
        const result = await query;
        
        // Return the unique campaigns as JSON response
        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        // Optionally, return an error response
        return NextResponse.json({ error: 'Failed to fetch campaigns' });
    }
}