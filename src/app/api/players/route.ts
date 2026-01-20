// app/api/players/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const team = searchParams.get('team');
    const position = searchParams.get('position');
    const search = searchParams.get('search');
    
    const skip = (page - 1) * limit;
    
    // Build WHERE clause
    const whereConditions: string[] = [];
    const params: any[] = [];
    
    if (team) {
      whereConditions.push('team = ?');
      params.push(team);
    }
    
    if (position) {
      whereConditions.push('position = ?');
      params.push(position);
    }
    
    if (search) {
      whereConditions.push('(name LIKE ? OR position LIKE ? OR team LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';
    
    // Get players
    const players = await query(
      `SELECT * FROM players 
       ${whereClause}
       ORDER BY \`rank\`, points DESC 
       LIMIT ? OFFSET ?`,
      [...params, limit, skip]
    );
    
    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM players ${whereClause}`,
      params
    );
    
    const total = countResult[0]?.total || 0;
    
    return NextResponse.json({
      success: true,
      data: {
        players,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
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

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.age || !data.position) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, age, position' },
        { status: 400 }
      );
    }
    
    const result = await query(
      `INSERT INTO players (
        name, age, position, avatar_url, team, attendance, 
        discipline_score, \`rank\`, points, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        data.name,
        data.age,
        data.position,
        data.avatar_url || null,
        data.team || null,
        data.attendance || 0,
        data.discipline_score || 100,
        data.rank || 0,
        data.points || 0
      ]
    );
    
    const playerId = (result as any).insertId;
    
    // Get the created player
    const player = await query('SELECT * FROM players WHERE id = ?', [playerId]);
    
    return NextResponse.json({
      success: true,
      message: 'Player created successfully',
      data: player[0]
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Create player error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}