// app/api/players/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const playerId = parseInt(id);
    
    // Get player
    const players = await query('SELECT * FROM players WHERE id = ?', [playerId]);
    
    if (!players || players.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Player not found' },
        { status: 404 }
      );
    }
    
    const player = players[0];
    
    // Get related data
    const certificatesRaw = await query(
      'SELECT * FROM certificates WHERE player_id = ? ORDER BY date DESC',
      [playerId]
    );
    
    const disciplinaryLogRaw = await query(
      'SELECT * FROM disciplinary_infractions WHERE player_id = ? ORDER BY date DESC',
      [playerId]
    );
    
    const injuryLogRaw = await query(
      'SELECT * FROM injuries WHERE player_id = ? ORDER BY date DESC',
      [playerId]
    );
    
    // Ensure we have arrays
    const certificates = Array.isArray(certificatesRaw) ? certificatesRaw : [];
    const disciplinaryLog = Array.isArray(disciplinaryLogRaw) ? disciplinaryLogRaw : [];
    const injuryLog = Array.isArray(injuryLogRaw) ? injuryLogRaw : [];
    
    // Get performance metrics from player columns
    const performanceMetrics = {
      physical: {
        speed: player.physical_speed || 0,
        stamina: player.physical_stamina || 0,
        strength: player.physical_strength || 0
      },
      technical: {
        dribbling: player.technical_dribbling || 0,
        shooting: player.technical_shooting || 0,
        passing: player.technical_passing || 0
      },
      tactical: {
        positioning: player.tactical_positioning || 0,
        game_reading: player.tactical_game_reading || 0
      },
      psychoSocial: {
        leadership: player.psycho_leadership || 0,
        teamwork: player.psycho_teamwork || 0
      }
    };
    
    const responseData = {
      ...player,
      performanceMetrics,
      certificates,
      disciplinaryLog,
      injuryLog,
      gpsData: {
        maxSpeed: player.gps_max_speed || 0,
        distanceCovered: player.gps_distance_covered || 0,
        playerLoad: player.gps_player_load || 0
      }
    };
    
    return NextResponse.json({
      success: true,
      data: responseData
    });
    
  } catch (error: any) {
    console.error('Get player error:', error);
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
    const playerId = parseInt(id);
    const data = await request.json();
    
    // Build UPDATE query
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(data)) {
      if (key === 'rank') {
        fields.push('`rank` = ?');
      } else if (key === 'performanceMetrics') {
        // Handle nested performance metrics
        const metrics = value as any;
        if (metrics.physical) {
          fields.push('physical_speed = ?');
          values.push(metrics.physical.speed || 0);
          fields.push('physical_stamina = ?');
          values.push(metrics.physical.stamina || 0);
          fields.push('physical_strength = ?');
          values.push(metrics.physical.strength || 0);
        }
        if (metrics.technical) {
          fields.push('technical_dribbling = ?');
          values.push(metrics.technical.dribbling || 0);
          fields.push('technical_shooting = ?');
          values.push(metrics.technical.shooting || 0);
          fields.push('technical_passing = ?');
          values.push(metrics.technical.passing || 0);
        }
        if (metrics.tactical) {
          fields.push('tactical_positioning = ?');
          values.push(metrics.tactical.positioning || 0);
          fields.push('tactical_game_reading = ?');
          values.push(metrics.tactical.game_reading || 0);
        }
        if (metrics.psychoSocial) {
          fields.push('psycho_leadership = ?');
          values.push(metrics.psychoSocial.leadership || 0);
          fields.push('psycho_teamwork = ?');
          values.push(metrics.psychoSocial.teamwork || 0);
        }
      } else if (key === 'gpsData') {
        // Handle GPS data
        const gps = value as any;
        fields.push('gps_max_speed = ?');
        values.push(gps.maxSpeed || 0);
        fields.push('gps_distance_covered = ?');
        values.push(gps.distanceCovered || 0);
        fields.push('gps_player_load = ?');
        values.push(gps.playerLoad || 0);
      } else if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }
    
    values.push(playerId);
    
    await query(
      `UPDATE players SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );
    
    return NextResponse.json({
      success: true,
      message: 'Player updated successfully'
    });
    
  } catch (error: any) {
    console.error('Update player error:', error);
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
    const playerId = parseInt(id);
    
    // Check if player exists
    const players = await query('SELECT id FROM players WHERE id = ?', [playerId]);
    
    if (!players || players.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Player not found' },
        { status: 404 }
      );
    }
    
    await query('DELETE FROM players WHERE id = ?', [playerId]);
    
    return NextResponse.json({
      success: true,
      message: 'Player deleted successfully'
    });
    
  } catch (error: any) {
    console.error('Delete player error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}