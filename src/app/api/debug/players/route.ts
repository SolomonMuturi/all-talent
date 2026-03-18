import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Get all players
    const allPlayers = await query('SELECT id, name, team FROM players ORDER BY id LIMIT 20');
    
    // Try to get player 6 directly
    const player6 = await query('SELECT * FROM players WHERE id = ?', [6]);
    
    // Try with string
    const player6String = await query('SELECT * FROM players WHERE id = ?', ['6']);
    
    // Check what the actual /api/players/6 endpoint returns
    const apiResponse = await fetch('http://localhost:9002/api/players/6');
    const apiData = await apiResponse.json();
    
    return NextResponse.json({
      allPlayers: allPlayers,
      player6Direct: player6,
      player6String: player6String,
      player6Length: Array.isArray(player6) ? player6.length : 'not an array',
      allPlayersType: typeof allPlayers,
      player6DirectType: typeof player6,
      apiResponse: {
        status: apiResponse.status,
        data: apiData
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
