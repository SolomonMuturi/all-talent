import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const upcoming = searchParams.get('upcoming') === 'true';
    const limit = parseInt(searchParams.get('limit') || '100');

    let sql = 'SELECT * FROM academy_events WHERE 1=1';
    const params: any[] = [];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (upcoming) {
      sql += ' AND event_date >= CURDATE()';
    }

    sql += ' ORDER BY event_date ASC LIMIT ?';
    params.push(limit);

    const events = await query(sql, params);

    // Ensure all events have properly formatted dates
    const formattedEvents = events.map((event: any) => ({
      ...event,
      event_date: event.event_date ? new Date(event.event_date).toISOString() : null,
      created_at: event.created_at ? new Date(event.created_at).toISOString() : null,
      updated_at: event.updated_at ? new Date(event.updated_at).toISOString() : null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        events: formattedEvents,
        count: formattedEvents.length
      }
    });
  } catch (error: any) {
    console.error('Get events error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      title,
      subtitle,
      organizer,
      event_date,
      category,
      logo_url,
      country,
      location,
      venue,
      game_type,
      tournament_type,
      team_count,
      lineup_formation,
      lineup_squad,
      description
    } = data;

    if (!title || !organizer || !event_date || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const eventId = `EVT${Date.now()}${Math.floor(Math.random() * 1000)}`;

    await query(
      `INSERT INTO academy_events 
       (id, title, subtitle, organizer, event_date, category, logo_url, country, location, venue, game_type, tournament_type, team_count, lineup_formation, lineup_squad, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        eventId, 
        title, 
        subtitle || null, 
        organizer, 
        event_date, 
        category, 
        logo_url || null, 
        country || null, 
        location || null, 
        venue || null, 
        game_type || null, 
        tournament_type || 'N/A', 
        team_count || 0, 
        lineup_formation || null, 
        JSON.stringify(lineup_squad || []),
        description || null
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Event created successfully',
      data: { id: eventId }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create event error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}