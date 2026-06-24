import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const participants = await query(
      `SELECT ep.*, p.name as player_name, p.position, p.team, p.age
       FROM event_participants ep
       LEFT JOIN players p ON ep.player_id = p.id
       WHERE ep.event_id = ?
       ORDER BY ep.status, p.name`,
      [id]
    );

    const summary = await query(
      `SELECT 
         participation_type,
         status,
         COUNT(*) as count
       FROM event_participants
       WHERE event_id = ?
       GROUP BY participation_type, status`,
      [id]
    );

    return NextResponse.json({
      success: true,
      data: {
        participants,
        summary
      }
    });
  } catch (error: any) {
    console.error('Get event participants error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const { player_id, role, participation_type = 'Player', status = 'Pending' } = data;

    if (!player_id) {
      return NextResponse.json(
        { success: false, error: 'Player ID is required' },
        { status: 400 }
      );
    }

    await query(
      `INSERT INTO event_participants (event_id, player_id, participation_type, role, status)
       VALUES (?, ?, ?, ?, ?)`,
      [id, player_id, participation_type, role || null, status]
    );

    return NextResponse.json({
      success: true,
      message: 'Participant added successfully'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Add participant error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}