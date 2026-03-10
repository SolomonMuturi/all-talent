// app/api/players/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const team = searchParams.get('team');
    const position = searchParams.get('position');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

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

    // NOTE: LIMIT and OFFSET are inlined as integers (not bound params)
    // because mysql2 connection.execute() does not support LIMIT/OFFSET as bound params.
    // Values are safe — they come from parseInt() above.
    connection = await pool.getConnection();

    const [players] = await connection.query(
      `SELECT * FROM players
       ${whereClause}
       ORDER BY player_rank ASC, points DESC
       LIMIT ${limit} OFFSET ${skip}`,
      params
    );

    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM players ${whereClause}`,
      params
    );

    const total = (countResult as any[])[0]?.total || 0;

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
  } finally {
    if (connection) connection.release();
  }
}

export async function POST(request: NextRequest) {
  let connection;
  try {
    const data = await request.json();

    if (!data.name || !data.age || !data.position) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, age, position' },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();

    const [result] = await connection.query(
      `INSERT INTO players (
        name, age, position, avatar_url, team, attendance,
        discipline_score, player_rank, points, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        data.name,
        parseInt(data.age),
        data.position,
        data.avatar_url || null,
        data.team || null,
        parseInt(data.attendance) || 0,
        parseInt(data.discipline_score) || 100,
        parseInt(data.player_rank) || 0,
        parseInt(data.points) || 0,
      ]
    );

    const playerId = (result as any).insertId;
    const [player] = await connection.query(
      'SELECT * FROM players WHERE id = ?', [playerId]
    );

    return NextResponse.json({
      success: true,
      message: 'Player created successfully',
      data: (player as any[])[0]
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create player error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}
