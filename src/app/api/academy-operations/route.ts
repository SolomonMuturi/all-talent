import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET all academy operations data (team, attendance, inventory, communications, compliance)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    let data = {};

    if (!type || type === 'team') {
      if (id) {
        const team = await query('SELECT * FROM team_members WHERE id = ?', [id]);
        data = { ...data, team: team[0] };
      } else {
        const team = await query('SELECT * FROM team_members ORDER BY name');
        data = { ...data, team };
      }
    }
    
    if (!type || type === 'attendance') {
      const attendance = await query('SELECT * FROM attendance ORDER BY date DESC');
      data = { ...data, attendance };
    }
    
    if (!type || type === 'inventory') {
      const inventory = await query('SELECT * FROM equipment ORDER BY name');
      data = { ...data, inventory };
    }
    
    if (!type || type === 'communications') {
      const communications = await query('SELECT * FROM messages ORDER BY timestamp DESC');
      data = { ...data, communications };
    }
    
    if (!type || type === 'compliance') {
      const compliance = await query('SELECT * FROM compliance ORDER BY created_at DESC');
      data = { ...data, compliance };
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST to add new records
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (type === 'team') {
      const { name, email, role, hourly_rate, hours_worked } = data;
      
      // Validate required fields
      if (!name || !email || !role) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields: name, email, role' },
          { status: 400 }
        );
      }

      // Check if email already exists
      const existing = await query('SELECT id FROM team_members WHERE email = ?', [email]);
      if (existing.length > 0) {
        return NextResponse.json(
          { success: false, error: 'A team member with this email already exists' },
          { status: 400 }
        );
      }

      // Insert new team member with all fields
      const result = await query(
        `INSERT INTO team_members (name, email, role, hourly_rate, hours_worked, created_at) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [name, email, role, hourly_rate || 0, hours_worked || 0]
      );

      return NextResponse.json({ 
        success: true, 
        message: 'Team member added successfully',
        data: { id: result.insertId }
      }, { status: 201 });
    }

    if (type === 'attendance') {
      const { member_id, date, status, check_in, check_out } = data;
      
      if (!member_id || !date || !status) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields: member_id, date, status' },
          { status: 400 }
        );
      }

      await query(
        `INSERT INTO attendance (member_id, date, status, check_in, check_out, created_at) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [member_id, date, status, check_in || null, check_out || null]
      );

      return NextResponse.json({ 
        success: true, 
        message: 'Attendance recorded successfully' 
      }, { status: 201 });
    }

    if (type === 'inventory') {
      const { name, category, quantity, unit, status, last_updated } = data;
      
      if (!name || !category) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields: name, category' },
          { status: 400 }
        );
      }

      await query(
        `INSERT INTO equipment (name, category, quantity, unit, status, last_updated, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [name, category, quantity || 0, unit || 'pcs', status || 'Available', last_updated || new Date()]
      );

      return NextResponse.json({ 
        success: true, 
        message: 'Equipment added successfully' 
      }, { status: 201 });
    }

    if (type === 'communications') {
      const { sender, recipient, subject, message, type: commType } = data;
      
      if (!sender || !message) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields: sender, message' },
          { status: 400 }
        );
      }

      await query(
        `INSERT INTO messages (sender, recipient, subject, message, type, timestamp, created_at) 
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [sender, recipient || null, subject || null, message, commType || 'general']
      );

      return NextResponse.json({ 
        success: true, 
        message: 'Message sent successfully' 
      }, { status: 201 });
    }

    if (type === 'compliance') {
      const { title, description, status, due_date, document_url } = data;
      
      if (!title) {
        return NextResponse.json(
          { success: false, error: 'Missing required field: title' },
          { status: 400 }
        );
      }

      await query(
        `INSERT INTO compliance (title, description, status, due_date, document_url, created_at) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [title, description || null, status || 'Pending', due_date || null, document_url || null]
      );

      return NextResponse.json({ 
        success: true, 
        message: 'Compliance record added successfully' 
      }, { status: 201 });
    }

    return NextResponse.json(
      { success: false, error: 'Unknown or missing type parameter' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT to update existing records
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id, data } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required for update' },
        { status: 400 }
      );
    }

    if (type === 'team') {
      const { name, email, role, hourly_rate, hours_worked } = data;
      
      const updates = [];
      const params = [];
      
      if (name !== undefined) {
        updates.push('name = ?');
        params.push(name);
      }
      if (email !== undefined) {
        updates.push('email = ?');
        params.push(email);
      }
      if (role !== undefined) {
        updates.push('role = ?');
        params.push(role);
      }
      if (hourly_rate !== undefined) {
        updates.push('hourly_rate = ?');
        params.push(hourly_rate);
      }
      if (hours_worked !== undefined) {
        updates.push('hours_worked = ?');
        params.push(hours_worked);
      }
      
      if (updates.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No fields to update' },
          { status: 400 }
        );
      }
      
      updates.push('updated_at = NOW()');
      params.push(id);
      
      await query(
        `UPDATE team_members SET ${updates.join(', ')} WHERE id = ?`,
        params
      );

      return NextResponse.json({ 
        success: true, 
        message: 'Team member updated successfully' 
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unknown or missing type parameter' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE to remove records
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json(
        { success: false, error: 'Type and ID are required' },
        { status: 400 }
      );
    }

    if (type === 'team') {
      // Check if member exists
      const existing = await query('SELECT id FROM team_members WHERE id = ?', [id]);
      if (existing.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Team member not found' },
          { status: 404 }
        );
      }

      await query('DELETE FROM team_members WHERE id = ?', [id]);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Team member deleted successfully' 
      });
    }

    if (type === 'attendance') {
      await query('DELETE FROM attendance WHERE id = ?', [id]);
      return NextResponse.json({ 
        success: true, 
        message: 'Attendance record deleted successfully' 
      });
    }

    if (type === 'inventory') {
      await query('DELETE FROM equipment WHERE id = ?', [id]);
      return NextResponse.json({ 
        success: true, 
        message: 'Equipment deleted successfully' 
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unknown type or delete not supported for this type' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}