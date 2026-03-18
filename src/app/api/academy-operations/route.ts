import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Example: GET all academy operations data (team, attendance, inventory, communications, compliance)
export async function GET(request: NextRequest) {
  try {
    // You can add query params to filter by type
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

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
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Example: POST to add a new team member (expand for other types as needed)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { type } = data;

    if (type === 'team') {
      const { name, email, role } = data;
      if (!name || !email || !role) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        );
      }
      await query(
        `INSERT INTO team_members (name, email, role) VALUES (?, ?, ?)`,
        [name, email, role]
      );
      return NextResponse.json({ success: true, message: 'Team member added' }, { status: 201 });
    }

    // Add similar logic for attendance, inventory, communications, compliance...

    return NextResponse.json(
      { success: false, error: 'Unknown or missing type' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
