import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    
    const event = await query(
      `SELECT e.*, COUNT(DISTINCT ep.player_id) as participant_count
       FROM academy_events e
       LEFT JOIN event_participants ep ON e.id = ep.event_id
       WHERE e.id = ?
       GROUP BY e.id`,
      [id]
    );

    if (!event || event.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    const participants = await query(
      `SELECT ep.*, p.name as player_name, p.position, p.team
       FROM event_participants ep
       LEFT JOIN players p ON ep.player_id = p.id
       WHERE ep.event_id = ?
       ORDER BY ep.status, p.name`,
      [id]
    );

    return NextResponse.json({
      success: true,
      data: {
        event: event[0],
        participants
      }
    });
  } catch (error: any) {
    console.error('Get event error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
      if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
        fields.push(`${key} = ?`);
        if (key === 'lineup_squad' && typeof value === 'object') {
          values.push(JSON.stringify(value));
        } else {
          values.push(value);
        }
      }
    }

    if (fields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    values.push(id);

    await query(
      `UPDATE academy_events SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );

    return NextResponse.json({
      success: true,
      message: 'Event updated successfully'
    });
  } catch (error: any) {
    console.error('Update event error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    await query('DELETE FROM academy_events WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete event error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
