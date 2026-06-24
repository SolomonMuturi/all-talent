// app/api/players/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/players - Get all players with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';

    let sql = 'SELECT * FROM players WHERE 1=1';
    const params: any[] = [];

    if (search) {
      sql += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }

    sql += ' ORDER BY name ASC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const players = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: {
        players,
        count: players.length
      }
    });
  } catch (error: any) {
    console.error('Get players error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/players - Create a new player
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const {
      name,
      age,
      position,
      team,
      avatar_url,
      attendance = 0,
      discipline_score = 100,
      player_rank = 0,
      points = 0,
      stats_played = 0,
      stats_wins = 0,
      stats_draws = 0,
      stats_losses = 0,
      highlights = '[]',
      physical_speed = 50,
      physical_stamina = 50,
      physical_strength = 50,
      technical_dribbling = 50,
      technical_shooting = 50,
      technical_passing = 50,
      tactical_positioning = 50,
      tactical_game_reading = 50,
      psycho_leadership = 50,
      psycho_teamwork = 50,
      phone_number = null,
      email = null,
      date_of_birth = null,
    } = data;

    // Validate required fields
    if (!name || !position || !team) {
      return NextResponse.json({
        success: false,
        message: 'Name, position, and team are required fields'
      }, { status: 400 });
    }

    // Insert the player
    const result = await query(
      `INSERT INTO players (
        name, age, position, team, avatar_url,
        attendance, discipline_score, player_rank, points,
        stats_played, stats_wins, stats_draws, stats_losses,
        highlights,
        physical_speed, physical_stamina, physical_strength,
        technical_dribbling, technical_shooting, technical_passing,
        tactical_positioning, tactical_game_reading,
        psycho_leadership, psycho_teamwork,
        phone_number, email, date_of_birth
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        age || null,
        position,
        team,
        avatar_url || null,
        attendance,
        discipline_score,
        player_rank,
        points,
        stats_played,
        stats_wins,
        stats_draws,
        stats_losses,
        highlights,
        physical_speed,
        physical_stamina,
        physical_strength,
        technical_dribbling,
        technical_shooting,
        technical_passing,
        tactical_positioning,
        tactical_game_reading,
        psycho_leadership,
        psycho_teamwork,
        phone_number,
        email,
        date_of_birth || null
      ]
    );

    // Get the inserted ID
    const insertId = (result as any)?.insertId || (result as any)?.id;
    
    if (!insertId) {
      throw new Error('Failed to get inserted player ID');
    }

    // Get the created player
    const players = await query('SELECT * FROM players WHERE id = ?', [insertId]);
    const player = players?.[0];

    if (!player) {
      throw new Error('Failed to retrieve created player');
    }

    return NextResponse.json({
      success: true,
      message: 'Player created successfully',
      playerId: player.id,
      data: player
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create player error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to create player'
    }, { status: 500 });
  }
}

// PUT /api/players - Update a player
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Player ID is required'
      }, { status: 400 });
    }

    // Build update query dynamically
    const fields: string[] = [];
    const values: any[] = [];

    const allowedFields = [
      'name', 'age', 'position', 'team', 'avatar_url',
      'attendance', 'discipline_score', 'player_rank', 'points',
      'stats_played', 'stats_wins', 'stats_draws', 'stats_losses',
      'highlights',
      'physical_speed', 'physical_stamina', 'physical_strength',
      'technical_dribbling', 'technical_shooting', 'technical_passing',
      'tactical_positioning', 'tactical_game_reading',
      'psycho_leadership', 'psycho_teamwork',
      'phone_number', 'email', 'date_of_birth'
    ];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(updateData[field]);
      }
    }

    if (fields.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No fields to update'
      }, { status: 400 });
    }

    values.push(id);
    const sql = `UPDATE players SET ${fields.join(', ')} WHERE id = ?`;
    
    await query(sql, values);

    // Get the updated player
    const players = await query('SELECT * FROM players WHERE id = ?', [id]);
    const player = players?.[0];

    return NextResponse.json({
      success: true,
      message: 'Player updated successfully',
      data: player
    });

  } catch (error: any) {
    console.error('Update player error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to update player'
    }, { status: 500 });
  }
}

// DELETE /api/players - Delete a player
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Player ID is required'
      }, { status: 400 });
    }

    await query('DELETE FROM players WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Player deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete player error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to delete player'
    }, { status: 500 });
  }
}