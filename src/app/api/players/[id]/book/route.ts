// app/api/players/[id]/book/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const playerId = parseInt(id);
    
    // Get player with all related data for the book
    const players = await query(
      `SELECT * FROM players WHERE id = ?`,
      [playerId]
    );
    
    if (!players || players.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Player not found' },
        { status: 404 }
      );
    }
    
    const player = players[0];
    
    // Get all related data
    const certificates = await query(
      `SELECT * FROM certificates WHERE player_id = ? ORDER BY date DESC`,
      [playerId]
    );
    
    const disciplinaryLog = await query(
      `SELECT * FROM disciplinary_infractions WHERE player_id = ? ORDER BY date DESC`,
      [playerId]
    );
    
    const injuryLog = await query(
      `SELECT * FROM injuries WHERE player_id = ? ORDER BY date DESC`,
      [playerId]
    );
    
    // Get event participations
    const events = await query(
      `SELECT ae.*, ep.status as participation_status, ep.role as event_role
       FROM academy_events ae
       JOIN event_participants ep ON ae.id = ep.event_id
       WHERE ep.player_id = ?
       ORDER BY ae.event_date DESC`,
      [playerId]
    );
    
    // Get player stats
    const stats = await query(
      `SELECT 
         stats_played as played,
         stats_wins as wins,
         stats_draws as draws,
         stats_losses as losses
       FROM players WHERE id = ?`,
      [playerId]
    );
    
    // Structure the data for the player book
    const playerBookData = {
      player: {
        id: player.id,
        name: player.name,
        age: player.age,
        position: player.position,
        avatarUrl: player.avatar_url,
        team: player.team,
        attendance: player.attendance,
        disciplineScore: player.discipline_score,
        rank: player.rank,
        points: player.points,
        phoneNumber: player.phone_number,
        email: player.email,
        dateOfBirth: player.date_of_birth
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
          gameReading: player.tactical_game_reading || 0
        },
        psychoSocial: {
          leadership: player.psycho_leadership || 0,
          teamwork: player.psycho_teamwork || 0
        }
      },
      gpsData: {
        maxSpeed: player.gps_max_speed || 0,
        distanceCovered: player.gps_distance_covered || 0,
        playerLoad: player.gps_player_load || 0
      },
      certificates,
      disciplinaryLog,
      injuryLog,
      events,
      stats: stats[0] || {},
      generatedAt: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      data: playerBookData
    });
    
  } catch (error: any) {
    console.error('Get player book error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}