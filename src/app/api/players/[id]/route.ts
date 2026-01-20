import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET single player
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`Fetching player with ID: ${params.id}`);
    
    const playerId = parseInt(params.id);
    
    if (isNaN(playerId) || playerId <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid player ID format' },
        { status: 400 }
      );
    }
    
    // Get player basic info
    const players = await query('SELECT * FROM players WHERE id = ?', [playerId]);
    
    if (!players || !Array.isArray(players) || players.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Player not found' },
        { status: 404 }
      );
    }
    
    const player = players[0];
    
    // Get related data with better error handling
    let certificates = [];
    let disciplinaryLog = [];
    let injuryLog = [];
    
    try {
      const certsResult = await query(
        'SELECT * FROM certificates WHERE player_id = ? ORDER BY date DESC',
        [playerId]
      );
      certificates = Array.isArray(certsResult) ? certsResult : [];
    } catch (certError) {
      console.warn('Error fetching certificates:', certError);
      // Continue without certificates if table doesn't exist
    }
    
    try {
      const discResult = await query(
        'SELECT * FROM disciplinary_infractions WHERE player_id = ? ORDER BY date DESC',
        [playerId]
      );
      disciplinaryLog = Array.isArray(discResult) ? discResult : [];
    } catch (discError) {
      console.warn('Error fetching disciplinary log:', discError);
      // Continue without disciplinary log
    }
    
    try {
      const injuryResult = await query(
        'SELECT * FROM injuries WHERE player_id = ? ORDER BY date DESC',
        [playerId]
      );
      injuryLog = Array.isArray(injuryResult) ? injuryResult : [];
    } catch (injuryError) {
      console.warn('Error fetching injury log:', injuryError);
      // Continue without injury log
    }
    
    // Parse highlights safely
    let highlights = [];
    try {
      if (player.highlights) {
        highlights = JSON.parse(player.highlights);
      }
    } catch (parseError) {
      console.warn('Error parsing highlights:', parseError);
      highlights = [];
    }
    
    // Format the response to match your Player type structure
    const formattedPlayer = {
      id: player.id,
      name: player.name || '',
      age: player.age || 0,
      position: player.position || '',
      avatarUrl: player.avatar_url || '',
      team: player.team || '',
      attendance: player.attendance || 0,
      disciplineScore: player.discipline_score || 0,
      rank: player.rank || 0,
      points: player.points || 0,
      stats: {
        played: player.stats_played || 0,
        wins: player.stats_wins || 0,
        draws: player.stats_draws || 0,
        losses: player.stats_losses || 0
      },
      highlights: highlights,
      gpsData: {
        maxSpeed: player.gps_max_speed || 0,
        distanceCovered: player.gps_distance_covered || 0,
        playerLoad: player.gps_player_load || 0
      },
      performanceMetrics: {
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
          'game reading': player.tactical_game_reading || 0
        },
        psychoSocial: {
          leadership: player.psycho_leadership || 0,
          teamwork: player.psycho_teamwork || 0
        }
      },
      disciplinaryLog: disciplinaryLog.map((log: any) => ({
        id: log.id,
        date: log.date,
        infraction: log.infraction || '',
        severity: log.severity || 'Low',
        sanction: log.sanction || ''
      })),
      injuryLog: injuryLog.map((injury: any) => ({
        id: injury.id,
        date: injury.date,
        injury: injury.injury || '',
        severity: injury.severity || 'Low',
        rtpStatus: injury.rtp_status || 'In Treatment'
      })),
      certificates: certificates.map((cert: any) => ({
        id: cert.id || '',
        moduleName: cert.module_name || '',
        date: cert.date
      }))
    };
    
    console.log(`Successfully fetched player: ${formattedPlayer.name}`);
    
    return NextResponse.json({
      success: true,
      data: formattedPlayer
    });
  } catch (error: any) {
    console.error('Error fetching player:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch player', 
        error: error.message,
        details: 'Check database connection and player ID'
      },
      { status: 500 }
    );
  }
}

// PUT update player
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const playerId = parseInt(params.id);
    
    if (isNaN(playerId) || playerId <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid player ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Check if player exists first
    const [existingPlayers] = await query('SELECT id FROM players WHERE id = ?', [playerId]);
    if (!existingPlayers || existingPlayers.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Player not found' },
        { status: 404 }
      );
    }
    
    const fields = [];
    const values = [];
    
    // Update only provided fields
    const fieldMappings: Record<string, string> = {
      name: 'name',
      age: 'age',
      position: 'position',
      avatarUrl: 'avatar_url',
      team: 'team',
      attendance: 'attendance',
      disciplineScore: 'discipline_score',
      rank: 'rank',
      points: 'points',
      'stats.played': 'stats_played',
      'stats.wins': 'stats_wins',
      'stats.draws': 'stats_draws',
      'stats.losses': 'stats_losses',
      'gpsData.maxSpeed': 'gps_max_speed',
      'gpsData.distanceCovered': 'gps_distance_covered',
      'gpsData.playerLoad': 'gps_player_load',
      'performanceMetrics.physical.speed': 'physical_speed',
      'performanceMetrics.physical.stamina': 'physical_stamina',
      'performanceMetrics.physical.strength': 'physical_strength',
      'performanceMetrics.technical.dribbling': 'technical_dribbling',
      'performanceMetrics.technical.shooting': 'technical_shooting',
      'performanceMetrics.technical.passing': 'technical_passing',
      'performanceMetrics.tactical.positioning': 'tactical_positioning',
      'performanceMetrics.tactical.gameReading': 'tactical_game_reading',
      'performanceMetrics.psychoSocial.leadership': 'psycho_leadership',
      'performanceMetrics.psychoSocial.teamwork': 'psycho_teamwork'
    };
    
    // Handle nested updates
    for (const [key, value] of Object.entries(body)) {
      if (key === 'highlights') {
        fields.push('highlights = ?');
        values.push(JSON.stringify(value));
        continue;
      }
      
      if (key === 'stats') {
        const stats = value as any;
        if (stats.played !== undefined) {
          fields.push('stats_played = ?');
          values.push(stats.played);
        }
        if (stats.wins !== undefined) {
          fields.push('stats_wins = ?');
          values.push(stats.wins);
        }
        if (stats.draws !== undefined) {
          fields.push('stats_draws = ?');
          values.push(stats.draws);
        }
        if (stats.losses !== undefined) {
          fields.push('stats_losses = ?');
          values.push(stats.losses);
        }
        continue;
      }
      
      if (key === 'gpsData') {
        const gps = value as any;
        if (gps.maxSpeed !== undefined) {
          fields.push('gps_max_speed = ?');
          values.push(gps.maxSpeed);
        }
        if (gps.distanceCovered !== undefined) {
          fields.push('gps_distance_covered = ?');
          values.push(gps.distanceCovered);
        }
        if (gps.playerLoad !== undefined) {
          fields.push('gps_player_load = ?');
          values.push(gps.playerLoad);
        }
        continue;
      }
      
      if (key === 'performanceMetrics') {
        const metrics = value as any;
        // Physical
        if (metrics.physical?.speed !== undefined) {
          fields.push('physical_speed = ?');
          values.push(metrics.physical.speed);
        }
        if (metrics.physical?.stamina !== undefined) {
          fields.push('physical_stamina = ?');
          values.push(metrics.physical.stamina);
        }
        if (metrics.physical?.strength !== undefined) {
          fields.push('physical_strength = ?');
          values.push(metrics.physical.strength);
        }
        // Technical
        if (metrics.technical?.dribbling !== undefined) {
          fields.push('technical_dribbling = ?');
          values.push(metrics.technical.dribbling);
        }
        if (metrics.technical?.shooting !== undefined) {
          fields.push('technical_shooting = ?');
          values.push(metrics.technical.shooting);
        }
        if (metrics.technical?.passing !== undefined) {
          fields.push('technical_passing = ?');
          values.push(metrics.technical.passing);
        }
        // Tactical
        if (metrics.tactical?.positioning !== undefined) {
          fields.push('tactical_positioning = ?');
          values.push(metrics.tactical.positioning);
        }
        if (metrics.tactical?.['game reading'] !== undefined) {
          fields.push('tactical_game_reading = ?');
          values.push(metrics.tactical['game reading']);
        }
        // Psycho-Social
        if (metrics.psychoSocial?.leadership !== undefined) {
          fields.push('psycho_leadership = ?');
          values.push(metrics.psychoSocial.leadership);
        }
        if (metrics.psychoSocial?.teamwork !== undefined) {
          fields.push('psycho_teamwork = ?');
          values.push(metrics.psychoSocial.teamwork);
        }
        continue;
      }
      
      const dbField = fieldMappings[key];
      if (dbField && value !== undefined) {
        fields.push(`${dbField} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid fields to update' },
        { status: 400 }
      );
    }
    
    values.push(playerId);
    
    const updateQuery = `UPDATE players SET ${fields.join(', ')} WHERE id = ?`;
    console.log('Update query:', updateQuery, values);
    
    const result = await query(updateQuery, values);
    
    return NextResponse.json({
      success: true,
      message: 'Player updated successfully',
      affectedRows: result.affectedRows || 0
    });
  } catch (error: any) {
    console.error('Error updating player:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update player', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE player
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const playerId = parseInt(params.id);
    
    if (isNaN(playerId) || playerId <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid player ID' },
        { status: 400 }
      );
    }
    
    // Check if player exists first
    const [existingPlayers] = await query('SELECT id FROM players WHERE id = ?', [playerId]);
    if (!existingPlayers || existingPlayers.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Player not found' },
        { status: 404 }
      );
    }
    
    // Delete related records first (optional, depending on your database constraints)
    try {
      await query('DELETE FROM certificates WHERE player_id = ?', [playerId]);
      await query('DELETE FROM disciplinary_infractions WHERE player_id = ?', [playerId]);
      await query('DELETE FROM injuries WHERE player_id = ?', [playerId]);
    } catch (relationError) {
      console.warn('Error deleting related records:', relationError);
      // Continue even if related records fail to delete
    }
    
    // Delete the player
    const result = await query('DELETE FROM players WHERE id = ?', [playerId]);
    
    return NextResponse.json({
      success: true,
      message: 'Player deleted successfully',
      affectedRows: result.affectedRows || 0
    });
  } catch (error: any) {
    console.error('Error deleting player:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete player', error: error.message },
      { status: 500 }
    );
  }
}