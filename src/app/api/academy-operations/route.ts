import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET: Fetch academy operations data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    // If ID is provided, fetch a single record
    if (id && type === 'team') {
      const team = await query('SELECT * FROM team_members WHERE id = ?', [id]);
      if (!team || team.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Team member not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: { team: team[0] }
      });
    }

    let data = {};

    if (!type || type === 'team') {
      const team = await query('SELECT * FROM team_members ORDER BY name');
      data = { ...data, team };
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
    console.error('GET /api/academy-operations error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: Add a new team member or other records
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    if (type === 'team') {
      const { name, email, role, hourlyRate, hoursWorked } = body;
      
      if (!name || !email || !role) {
        return NextResponse.json(
          { success: false, error: 'Name, email, and role are required' },
          { status: 400 }
        );
      }

      // Check if email already exists
      const existing = await query('SELECT id FROM team_members WHERE email = ?', [email]);
      if (existing && existing.length > 0) {
        return NextResponse.json(
          { success: false, error: 'A team member with this email already exists' },
          { status: 400 }
        );
      }

      const id = `TM${Date.now().toString(36).toUpperCase()}`;
      
      await query(
        `INSERT INTO team_members (id, name, email, role, hourly_rate, hours_worked)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, name, email, role, Number(hourlyRate) || 0, Number(hoursWorked) || 0]
      );

      return NextResponse.json({
        success: true,
        message: 'Team member added successfully',
        data: { id }
      }, { status: 201 });
    }

    if (type === 'attendance') {
      const { teamMemberId, date, status } = body;
      if (!teamMemberId || !date || !status) {
        return NextResponse.json(
          { success: false, error: 'Team member ID, date, and status are required' },
          { status: 400 }
        );
      }
      
      await query(
        `INSERT INTO attendance (team_member_id, date, status)
         VALUES (?, ?, ?)`,
        [teamMemberId, date, status]
      );
      
      return NextResponse.json({
        success: true,
        message: 'Attendance record added'
      }, { status: 201 });
    }

    if (type === 'inventory') {
      const { name, category, quantity, status } = body;
      if (!name || !category || quantity === undefined) {
        return NextResponse.json(
          { success: false, error: 'Name, category, and quantity are required' },
          { status: 400 }
        );
      }
      
      const id = `EQ${Date.now().toString(36).toUpperCase()}`;
      await query(
        `INSERT INTO equipment (id, name, category, quantity, status)
         VALUES (?, ?, ?, ?, ?)`,
        [id, name, category, quantity, status || 'Available']
      );
      
      return NextResponse.json({
        success: true,
        message: 'Equipment added successfully',
        data: { id }
      }, { status: 201 });
    }

    if (type === 'communications') {
      const { sender, recipient, message, type: msgType } = body;
      if (!sender || !recipient || !message) {
        return NextResponse.json(
          { success: false, error: 'Sender, recipient, and message are required' },
          { status: 400 }
        );
      }
      
      await query(
        `INSERT INTO messages (sender, recipient, message, type)
         VALUES (?, ?, ?, ?)`,
        [sender, recipient, message, msgType || 'general']
      );
      
      return NextResponse.json({
        success: true,
        message: 'Message sent successfully'
      }, { status: 201 });
    }

    if (type === 'compliance') {
      const { title, description, status: compStatus, dueDate } = body;
      if (!title) {
        return NextResponse.json(
          { success: false, error: 'Title is required' },
          { status: 400 }
        );
      }
      
      await query(
        `INSERT INTO compliance (title, description, status, due_date)
         VALUES (?, ?, ?, ?)`,
        [title, description || '', compStatus || 'Pending', dueDate || null]
      );
      
      return NextResponse.json({
        success: true,
        message: 'Compliance record added'
      }, { status: 201 });
    }

    return NextResponse.json(
      { success: false, error: 'Unknown or missing type. Supported types: team, attendance, inventory, communications, compliance' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('POST /api/academy-operations error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT: Update a team member or other records
export async function PUT(request: NextRequest) {
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

    if (type === 'team') {
      const { name, email, role, hourlyRate, hoursWorked } = body;
      
      if (!name || !email || !role) {
        return NextResponse.json(
          { success: false, error: 'Name, email, and role are required' },
          { status: 400 }
        );
      }

      // Check if team member exists
      const existing = await query('SELECT id FROM team_members WHERE id = ?', [id]);
      if (!existing || existing.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Team member not found' },
          { status: 404 }
        );
      }

      // Check if email is taken by another member
      const emailCheck = await query(
        'SELECT id FROM team_members WHERE email = ? AND id != ?',
        [email, id]
      );
      if (emailCheck && emailCheck.length > 0) {
        return NextResponse.json(
          { success: false, error: 'Email is already used by another team member' },
          { status: 400 }
        );
      }

      await query(
        `UPDATE team_members 
         SET name = ?, email = ?, role = ?, hourly_rate = ?, hours_worked = ?
         WHERE id = ?`,
        [name, email, role, Number(hourlyRate) || 0, Number(hoursWorked) || 0, id]
      );

      return NextResponse.json({
        success: true,
        message: 'Team member updated successfully'
      });
    }

    if (type === 'attendance') {
      const { status } = body;
      if (!status) {
        return NextResponse.json(
          { success: false, error: 'Status is required' },
          { status: 400 }
        );
      }
      
      await query(
        `UPDATE attendance SET status = ? WHERE id = ?`,
        [status, id]
      );
      
      return NextResponse.json({
        success: true,
        message: 'Attendance record updated'
      });
    }

    if (type === 'inventory') {
      const { name, category, quantity, status } = body;
      if (!name || !category || quantity === undefined) {
        return NextResponse.json(
          { success: false, error: 'Name, category, and quantity are required' },
          { status: 400 }
        );
      }
      
      await query(
        `UPDATE equipment 
         SET name = ?, category = ?, quantity = ?, status = ?
         WHERE id = ?`,
        [name, category, quantity, status || 'Available', id]
      );
      
      return NextResponse.json({
        success: true,
        message: 'Equipment updated successfully'
      });
    }

    if (type === 'compliance') {
      const { title, description, status, dueDate } = body;
      if (!title) {
        return NextResponse.json(
          { success: false, error: 'Title is required' },
          { status: 400 }
        );
      }
      
      await query(
        `UPDATE compliance 
         SET title = ?, description = ?, status = ?, due_date = ?
         WHERE id = ?`,
        [title, description || '', status || 'Pending', dueDate || null, id]
      );
      
      return NextResponse.json({
        success: true,
        message: 'Compliance record updated'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unknown or missing type' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('PUT /api/academy-operations error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Remove a team member or other records
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    // Parse the body to get the type
    let body = {};
    try {
      body = await request.json();
    } catch {
      // If no body, try to get type from query param
      const type = searchParams.get('type');
      if (type) {
        body = { type };
      }
    }

    const { type } = body;

    if (type === 'team') {
      // Check if team member exists
      const existing = await query('SELECT id FROM team_members WHERE id = ?', [id]);
      if (!existing || existing.length === 0) {
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
        message: 'Attendance record deleted'
      });
    }

    if (type === 'inventory') {
      await query('DELETE FROM equipment WHERE id = ?', [id]);
      return NextResponse.json({
        success: true,
        message: 'Equipment deleted successfully'
      });
    }

    if (type === 'communications') {
      await query('DELETE FROM messages WHERE id = ?', [id]);
      return NextResponse.json({
        success: true,
        message: 'Message deleted'
      });
    }

    if (type === 'compliance') {
      await query('DELETE FROM compliance WHERE id = ?', [id]);
      return NextResponse.json({
        success: true,
        message: 'Compliance record deleted'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unknown or missing type' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('DELETE /api/academy-operations error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}