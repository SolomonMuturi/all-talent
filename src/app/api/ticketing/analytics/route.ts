import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get ticketing statistics and revenue data
    const eventStats = await query(`
      SELECT 
        ae.id,
        ae.title,
        ae.event_date,
        COUNT(DISTINCT ep.player_id) as total_participants,
        SUM(CASE WHEN ep.participation_type = 'Player' THEN 1 ELSE 0 END) as players,
        SUM(CASE WHEN ep.participation_type = 'Staff' THEN 1 ELSE 0 END) as staff,
        SUM(CASE WHEN ep.participation_type = 'Spectator' THEN 1 ELSE 0 END) as spectators,
        SUM(CASE WHEN ep.status = 'Confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN ep.status = 'Pending' THEN 1 ELSE 0 END) as pending
      FROM academy_events ae
      LEFT JOIN event_participants ep ON ae.id = ep.event_id
      GROUP BY ae.id, ae.title, ae.event_date
      ORDER BY ae.event_date DESC
    `);

    const totalParticipants = await query(`
      SELECT COUNT(*) as total FROM event_participants
    `);

    const upcomingEvents = await query(`
      SELECT COUNT(*) as count FROM academy_events WHERE event_date >= CURDATE()
    `);

    const statusSummary = await query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM event_participants
      GROUP BY status
    `);

    return NextResponse.json({
      success: true,
      data: {
        eventStats,
        totalParticipants: totalParticipants[0]?.total || 0,
        upcomingEvents: upcomingEvents[0]?.count || 0,
        statusSummary
      }
    });
  } catch (error: any) {
    console.error('Get ticketing analytics error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
