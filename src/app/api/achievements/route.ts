// app/api/achievements/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/achievements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId');

    let sql = `
      SELECT 
        id,
        player_id as playerId,
        player_name as playerName,
        achievement,
        module,
        description,
        date,
        created_at as createdAt
      FROM achievements 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (playerId) {
      sql += ' AND player_id = ?';
      params.push(parseInt(playerId));
    }

    sql += ' ORDER BY date DESC, created_at DESC';

    const achievements = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: achievements,
    });
  } catch (error: any) {
    console.error('Get achievements error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/achievements
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerId, playerName, achievement, module, description, date } = body;

    // Validate required fields
    if (!playerId || !playerName || !achievement || !module) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: playerId, playerName, achievement, module are required'
      }, { status: 400 });
    }

    // Generate ID
    const id = `ACH${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Insert achievement
    await query(
      `INSERT INTO achievements 
       (id, player_id, player_name, achievement, module, description, date, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        playerId,
        playerName,
        achievement,
        module,
        description || null,
        date || new Date().toISOString().split('T')[0],
        new Date()
      ]
    );

    // Check if certificate_count column exists before updating
    try {
      // First check if the column exists
      const columns = await query(`
        SELECT COLUMN_NAME 
        FROM information_schema.columns 
        WHERE table_schema = DATABASE() 
        AND table_name = 'players' 
        AND COLUMN_NAME = 'certificate_count'
      `);

      if (columns && columns.length > 0) {
        // Column exists, update it
        await query(
          `UPDATE players SET certificate_count = COALESCE(certificate_count, 0) + 1 WHERE id = ?`,
          [playerId]
        );
      } else {
        // Column doesn't exist, try to add it
        try {
          await query(
            `ALTER TABLE players ADD COLUMN certificate_count INT DEFAULT 0`
          );
          // Then update it
          await query(
            `UPDATE players SET certificate_count = COALESCE(certificate_count, 0) + 1 WHERE id = ?`,
            [playerId]
          );
        } catch (alterError) {
          console.warn('Could not add certificate_count column:', alterError);
          // Continue anyway - the achievement is already saved
        }
      }
    } catch (updateError) {
      console.warn('Could not update certificate_count:', updateError);
      // Continue anyway - the achievement is already saved
    }

    return NextResponse.json({
      success: true,
      message: 'Achievement added successfully',
      data: { id }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create achievement error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to create achievement'
    }, { status: 500 });
  }
}

// DELETE /api/achievements
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Achievement ID is required'
      }, { status: 400 });
    }

    // Get the achievement to find playerId
    const achievements = await query('SELECT player_id FROM achievements WHERE id = ?', [id]);
    const achievement = achievements?.[0];

    // Delete achievement
    await query('DELETE FROM achievements WHERE id = ?', [id]);

    // Decrease player's certificate count if column exists
    if (achievement) {
      try {
        // Check if certificate_count column exists
        const columns = await query(`
          SELECT COLUMN_NAME 
          FROM information_schema.columns 
          WHERE table_schema = DATABASE() 
          AND table_name = 'players' 
          AND COLUMN_NAME = 'certificate_count'
        `);

        if (columns && columns.length > 0) {
          await query(
            `UPDATE players SET certificate_count = GREATEST(COALESCE(certificate_count, 0) - 1, 0) WHERE id = ?`,
            [achievement.player_id]
          );
        }
      } catch (updateError) {
        console.warn('Could not update certificate_count:', updateError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Achievement deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete achievement error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to delete achievement'
    }, { status: 500 });
  }
}