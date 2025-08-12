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

export async function POST(request) {
  const db = getDbConnection();
  
  try {
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['organisation', 'state', 'tier', 'organisation_type'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} is required` }, 
          { status: 400 }
        );
      }
    }

    // Prepare data for insertion
    const insertData = {
      organisati: data.organisation,
      state: data.state,
      tier: data.tier,
      organisa_1: data.organisation_type,
      address: data.address || null,
      comments: data.comments || null,
      connections: JSON.stringify(data.connections || []),
      latitude: data.latitude ? parseFloat(data.latitude) : null,
      longitude: data.longitude ? parseFloat(data.longitude) : null
    };

    // Insert data and get the new ID
    const [newId] = await db('gdb_onewater2').insert(insertData).returning('gid');
    
    // Return the created record
    const createdRecord = await db('gdb_onewater2')
      .select(
        'gid AS organisation_id',
        'state',
        'tier',
        'organisati AS organisation',
        'organisa_1 AS organisation_type',
        'address',
        'comments',
        'connections',
        'latitude',
        'longitude'
      )
      .where('gid', newId.gid || newId)
      .first();

    return NextResponse.json(createdRecord, { status: 201 });

  } catch (error) {
    console.error('Error creating organisation:', error);
    return NextResponse.json(
      { error: 'Failed to create organisation' }, 
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  const db = getDbConnection();
  
  try {
    const data = await request.json();
    const { organisation_id, ...updateData } = data;

    if (!organisation_id) {
      return NextResponse.json(
        { error: 'Organisation ID is required' }, 
        { status: 400 }
      );
    }

    // Check if organisation exists
    const existingOrg = await db('gdb_onewater2')
      .where('gid', organisation_id)
      .first();

    if (!existingOrg) {
      return NextResponse.json(
        { error: 'Organisation not found' }, 
        { status: 404 }
      );
    }

    // Prepare update data
    const dbUpdateData = {
      organisati: updateData.organisation,
      state: updateData.state,
      tier: updateData.tier,
      organisa_1: updateData.organisation_type,
      address: updateData.address || null,
      comments: updateData.comments || null,
      connections: JSON.stringify(updateData.connections || []),
      latitude: updateData.latitude ? parseFloat(updateData.latitude) : null,
      longitude: updateData.longitude ? parseFloat(updateData.longitude) : null
    };

    // Update the record
    await db('gdb_onewater2')
      .where('gid', organisation_id)
      .update(dbUpdateData);

    // Return the updated record
    const updatedRecord = await db('gdb_onewater2')
      .select(
        'gid AS organisation_id',
        'state',
        'tier',
        'organisati AS organisation',
        'organisa_1 AS organisation_type',
        'address',
        'comments',
        'connections',
        'latitude',
        'longitude'
      )
      .where('gid', organisation_id)
      .first();

    return NextResponse.json(updatedRecord);

  } catch (error) {
    console.error('Error updating organisation:', error);
    return NextResponse.json(
      { error: 'Failed to update organisation' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const db = getDbConnection();
  
  try {
    const { searchParams } = new URL(request.url);
    const organisationId = searchParams.get('id');

    if (!organisationId) {
      return NextResponse.json(
        { error: 'Organisation ID is required' }, 
        { status: 400 }
      );
    }

    // Check if organisation exists
    const existingOrg = await db('gdb_onewater2')
      .where('gid', organisationId)
      .first();

    if (!existingOrg) {
      return NextResponse.json(
        { error: 'Organisation not found' }, 
        { status: 404 }
      );
    }

    // Delete the organisation
    await db('gdb_onewater2')
      .where('gid', organisationId)
      .del();

    return NextResponse.json(
      { message: 'Organisation deleted successfully' }, 
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting organisation:', error);
    return NextResponse.json(
      { error: 'Failed to delete organisation' }, 
      { status: 500 }
    );
  }
}
