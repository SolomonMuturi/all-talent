import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers, query } from '@/lib/db';

// GET all players
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const team = searchParams.get('team');
    const limit = searchParams.get('limit') || '100';
    
    let sql = `
      SELECT p.*, 
        (SELECT COUNT(*) FROM certificates WHERE player_id = p.id) as certificate_count,
        (SELECT COUNT(*) FROM disciplinary_infractions WHERE player_id = p.id) as infraction_count,
        (SELECT COUNT(*) FROM injuries WHERE player_id = p.id) as injury_count
      FROM players p
    `;
    
    const params: any[] = [];
    
    if (team) {
      sql += ' WHERE p.team = ?';
      params.push(team);
    }
    
    sql += ' ORDER BY p.rank, p.points DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const players = await query(sql, params);
    
    return NextResponse.json({
      success: true,
      data: players,
      count: players.length
    });
  } catch (error: any) {
    console.error('Error fetching players:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch players', error: error.message },
      { status: 500 }
    );
  }
}

// POST create new player
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      name,
      age,
      position,
      avatar_url,
      team,
      attendance = 0,
      discipline_score = 100,
      rank = 0,
      points = 0,
      stats_played = 0,
      stats_wins = 0,
      stats_draws = 0,
      stats_losses = 0,
      highlights = '[]',
      physical_speed = 0,
      physical_stamina = 0,
      physical_strength = 0,
      technical_dribbling = 0,
      technical_shooting = 0,
      technical_passing = 0,
      tactical_positioning = 0,
      tactical_game_reading = 0,
      psycho_leadership = 0,
      psycho_teamwork = 0
    } = body;
    
    if (!name || !age || !position || !team) {
      return NextResponse.json(
        { success: false, message: 'Name, age, position, and team are required' },
        { status: 400 }
      );
    }
    
    const result = await query(
      `INSERT INTO players (
        name, age, position, avatar_url, team, attendance, discipline_score, 
        rank, points, stats_played, stats_wins, stats_draws, stats_losses,
        highlights, physical_speed, physical_stamina, physical_strength,
        technical_dribbling, technical_shooting, technical_passing,
        tactical_positioning, tactical_game_reading, psycho_leadership, psycho_teamwork
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, age, position, avatar_url || null, team, attendance, discipline_score,
        rank, points, stats_played, stats_wins, stats_draws, stats_losses,
        highlights, physical_speed, physical_stamina, physical_strength,
        technical_dribbling, technical_shooting, technical_passing,
        tactical_positioning, tactical_game_reading, psycho_leadership, psycho_teamwork
      ]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Player created successfully',
      playerId: (result as any).insertId
    });
  } catch (error: any) {
    console.error('Error creating player:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create player', error: error.message },
      { status: 500 }
    );
  }
}