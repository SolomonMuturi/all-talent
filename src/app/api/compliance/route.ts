import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET: Fetch compliance data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    // If ID is provided, fetch a single record
    if (id) {
      let table = '';
      switch (type) {
        case 'registration':
          table = 'player_registrations';
          break;
        case 'certification':
          table = 'staff_certifications';
          break;
        case 'audit':
          table = 'facility_audits';
          break;
        case 'credential':
          table = 'staff_credentials';
          break;
        default:
          return NextResponse.json(
            { success: false, error: 'Invalid type' },
            { status: 400 }
          );
      }

      try {
        const result = await query(`SELECT * FROM ${table} WHERE id = ?`, [id]);
        if (!result || result.length === 0) {
          return NextResponse.json(
            { success: false, error: 'Item not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({
          success: true,
          data: result[0]
        });
      } catch (error: any) {
        // Table might not exist
        return NextResponse.json({
          success: false,
          error: `Table ${table} does not exist. Please run the migration.`,
          details: error.message
        }, { status: 500 });
      }
    }

    // Fetch all records based on type
    let data = [];
    try {
      switch (type) {
        case 'registrations':
          data = await query('SELECT * FROM player_registrations ORDER BY created_at DESC') || [];
          break;
        case 'certifications':
          data = await query('SELECT * FROM staff_certifications ORDER BY created_at DESC') || [];
          break;
        case 'audits':
          data = await query('SELECT * FROM facility_audits ORDER BY created_at DESC') || [];
          break;
        case 'credentials':
          data = await query('SELECT * FROM staff_credentials ORDER BY created_at DESC') || [];
          break;
        default:
          return NextResponse.json(
            { success: false, error: 'Invalid type parameter' },
            { status: 400 }
          );
      }
    } catch (error: any) {
      // Table might not exist - return empty array
      console.warn(`Table for type ${type} might not exist:`, error.message);
      data = [];
    }

    return NextResponse.json({
      success: true,
      data: data || []
    });
  } catch (error: any) {
    console.error('GET /api/compliance error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: Add new compliance item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    let table = '';
    let sql = '';
    let values: any[] = [];

    switch (type) {
      case 'registration': {
        table = 'player_registrations';
        const id = `REG${Date.now().toString(36).toUpperCase()}`;
        sql = `
          INSERT INTO player_registrations 
          (id, playerName, playerId, registrationNumber, federation, status, registrationDate, expiryDate, notes) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        values = [
          id,
          data.playerName || '',
          data.playerId || '',
          data.registrationNumber || '',
          data.federation || '',
          data.status || 'Pending',
          data.registrationDate || null,
          data.expiryDate || null,
          data.notes || null
        ];
        break;
      }

      case 'certification': {
        table = 'staff_certifications';
        const id = `CERT${Date.now().toString(36).toUpperCase()}`;
        sql = `
          INSERT INTO staff_certifications 
          (id, staffName, staffId, certificationType, licenseNumber, issuingBody, status, issueDate, expiryDate, cpdPoints, notes) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        values = [
          id,
          data.staffName || '',
          data.staffId || '',
          data.certificationType || '',
          data.licenseNumber || '',
          data.issuingBody || '',
          data.status || 'Pending',
          data.issueDate || null,
          data.expiryDate || null,
          data.cpdPoints || 0,
          data.notes || null
        ];
        break;
      }

      case 'audit': {
        table = 'facility_audits';
        const id = `AUD${Date.now().toString(36).toUpperCase()}`;
        sql = `
          INSERT INTO facility_audits 
          (id, facilityName, facilityType, auditDate, auditor, status, score, findings, correctiveActions, followUpDate, notes) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        values = [
          id,
          data.facilityName || '',
          data.facilityType || '',
          data.auditDate || null,
          data.auditor || '',
          data.status || 'Pending',
          data.score || 0,
          JSON.stringify(data.findings || []),
          JSON.stringify(data.correctiveActions || []),
          data.followUpDate || null,
          data.notes || null
        ];
        break;
      }

      case 'credential': {
        table = 'staff_credentials';
        const id = `CRED${Date.now().toString(36).toUpperCase()}`;
        sql = `
          INSERT INTO staff_credentials 
          (id, staffName, staffId, credentialType, licenseNumber, issuingAuthority, status, issueDate, expiryDate, level, specialization, notes) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        values = [
          id,
          data.staffName || '',
          data.staffId || '',
          data.credentialType || '',
          data.licenseNumber || '',
          data.issuingAuthority || '',
          data.status || 'Pending',
          data.issueDate || null,
          data.expiryDate || null,
          data.level || '',
          data.specialization || null,
          data.notes || null
        ];
        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid type. Must be: registration, certification, audit, or credential' },
          { status: 400 }
        );
    }

    console.log('📝 SQL:', sql);
    console.log('📝 Values:', values);

    try {
      await query(sql, values);
    } catch (error: any) {
      // If table doesn't exist, return helpful error
      if (error.message && error.message.includes('Table')) {
        return NextResponse.json({
          success: false,
          error: `Table ${table} does not exist. Please run the database migration.`,
          details: error.message
        }, { status: 500 });
      }
      throw error;
    }

    // Fetch the newly created item
    const [newItem] = await query(`SELECT * FROM ${table} WHERE id = ?`, [values[0]]);

    return NextResponse.json({
      success: true,
      data: newItem,
      message: `${type} added successfully`
    }, { status: 201 });

  } catch (error: any) {
    console.error('POST /api/compliance error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT: Update compliance item
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const { type, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    let table = '';
    let sql = '';
    let values: any[] = [];

    switch (type) {
      case 'registration': {
        table = 'player_registrations';
        sql = `
          UPDATE player_registrations 
          SET playerName = ?, playerId = ?, registrationNumber = ?, federation = ?, 
              status = ?, registrationDate = ?, expiryDate = ?, notes = ?
          WHERE id = ?
        `;
        values = [
          data.playerName,
          data.playerId,
          data.registrationNumber,
          data.federation,
          data.status,
          data.registrationDate,
          data.expiryDate,
          data.notes || null,
          id
        ];
        break;
      }

      case 'certification': {
        table = 'staff_certifications';
        sql = `
          UPDATE staff_certifications 
          SET staffName = ?, staffId = ?, certificationType = ?, licenseNumber = ?, 
              issuingBody = ?, status = ?, issueDate = ?, expiryDate = ?, 
              cpdPoints = ?, notes = ?
          WHERE id = ?
        `;
        values = [
          data.staffName,
          data.staffId,
          data.certificationType,
          data.licenseNumber,
          data.issuingBody,
          data.status,
          data.issueDate,
          data.expiryDate,
          data.cpdPoints || 0,
          data.notes || null,
          id
        ];
        break;
      }

      case 'audit': {
        table = 'facility_audits';
        sql = `
          UPDATE facility_audits 
          SET facilityName = ?, facilityType = ?, auditDate = ?, auditor = ?, 
              status = ?, score = ?, findings = ?, correctiveActions = ?, 
              followUpDate = ?, notes = ?
          WHERE id = ?
        `;
        values = [
          data.facilityName,
          data.facilityType,
          data.auditDate,
          data.auditor,
          data.status,
          data.score || 0,
          JSON.stringify(data.findings || []),
          JSON.stringify(data.correctiveActions || []),
          data.followUpDate || null,
          data.notes || null,
          id
        ];
        break;
      }

      case 'credential': {
        table = 'staff_credentials';
        sql = `
          UPDATE staff_credentials 
          SET staffName = ?, staffId = ?, credentialType = ?, licenseNumber = ?, 
              issuingAuthority = ?, status = ?, issueDate = ?, expiryDate = ?, 
              level = ?, specialization = ?, notes = ?
          WHERE id = ?
        `;
        values = [
          data.staffName,
          data.staffId,
          data.credentialType,
          data.licenseNumber,
          data.issuingAuthority,
          data.status,
          data.issueDate,
          data.expiryDate,
          data.level || '',
          data.specialization || null,
          data.notes || null,
          id
        ];
        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid type' },
          { status: 400 }
        );
    }

    // Check if item exists
    try {
      const [existing] = await query(`SELECT id FROM ${table} WHERE id = ?`, [id]);
      if (!existing) {
        return NextResponse.json(
          { success: false, error: 'Item not found' },
          { status: 404 }
        );
      }
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        error: `Table ${table} does not exist. Please run the database migration.`,
        details: error.message
      }, { status: 500 });
    }

    await query(sql, values);

    // Fetch the updated item
    const [updatedItem] = await query(`SELECT * FROM ${table} WHERE id = ?`, [id]);

    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: `${type} updated successfully`
    });

  } catch (error: any) {
    console.error('PUT /api/compliance error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Remove compliance item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const { type } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    let table = '';
    switch (type) {
      case 'registration':
        table = 'player_registrations';
        break;
      case 'certification':
        table = 'staff_certifications';
        break;
      case 'audit':
        table = 'facility_audits';
        break;
      case 'credential':
        table = 'staff_credentials';
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid type' },
          { status: 400 }
        );
    }

    // Check if item exists
    try {
      const [existing] = await query(`SELECT id FROM ${table} WHERE id = ?`, [id]);
      if (!existing) {
        return NextResponse.json(
          { success: false, error: 'Item not found' },
          { status: 404 }
        );
      }
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        error: `Table ${table} does not exist. Please run the database migration.`,
        details: error.message
      }, { status: 500 });
    }

    await query(`DELETE FROM ${table} WHERE id = ?`, [id]);

    return NextResponse.json({
      success: true,
      message: `${type} deleted successfully`
    });

  } catch (error: any) {
    console.error('DELETE /api/compliance error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}