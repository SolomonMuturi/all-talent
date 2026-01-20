// app/api/players/[id]/actions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const playerId = parseInt(id);
    const data = await request.json();
    const { action, ...actionData } = data;
    
    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action type is required' },
        { status: 400 }
      );
    }
    
    switch (action) {
      case 'log_disciplinary':
        const infractionId = `DISC${Date.now()}${Math.floor(Math.random() * 1000)}`;
        await query(
          `INSERT INTO disciplinary_infractions 
           (player_id, date, infraction, severity, sanction) 
           VALUES (?, CURDATE(), ?, ?, ?)`,
          [playerId, actionData.infraction, actionData.severity || 'Medium', actionData.sanction || '']
        );
        
        // Update player discipline score
        const severityScore = {
          'Low': -5,
          'Medium': -10,
          'High': -20
        }[actionData.severity || 'Medium'] || -10;
        
        await query(
          `UPDATE players 
           SET discipline_score = GREATEST(0, discipline_score + ?),
               updated_at = NOW() 
           WHERE id = ?`,
          [severityScore, playerId]
        );
        
        return NextResponse.json({
          success: true,
          message: 'Disciplinary infraction logged successfully'
        });
        
      case 'log_injury':
        const injuryId = `INJ${Date.now()}${Math.floor(Math.random() * 1000)}`;
        await query(
          `INSERT INTO injuries 
           (player_id, date, injury, severity, rtp_status) 
           VALUES (?, CURDATE(), ?, ?, ?)`,
          [playerId, actionData.injury, actionData.severity || 'Medium', 'In Treatment']
        );
        
        return NextResponse.json({
          success: true,
          message: 'Injury logged successfully'
        });
        
      case 'add_certificate':
        const certificateId = `CERT${Date.now()}${Math.floor(Math.random() * 1000)}`;
        await query(
          `INSERT INTO certificates (id, player_id, module_name, date) 
           VALUES (?, ?, ?, CURDATE())`,
          [certificateId, playerId, actionData.moduleName]
        );
        
        // Award points for certificate
        await query(
          `UPDATE players 
           SET points = points + 10,
               updated_at = NOW() 
           WHERE id = ?`,
          [playerId]
        );
        
        return NextResponse.json({
          success: true,
          message: 'Certificate added successfully'
        });
        
      case 'update_attendance':
        await query(
          `UPDATE players 
           SET attendance = ?,
               updated_at = NOW() 
           WHERE id = ?`,
          [actionData.attendance, playerId]
        );
        
        return NextResponse.json({
          success: true,
          message: 'Attendance updated successfully'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action type' },
          { status: 400 }
        );
    }
    
  } catch (error: any) {
    console.error('Player action error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}