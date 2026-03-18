// app/api/dashboard/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get dashboard statistics
    const [
      totalPlayersResult,
      totalRevenueResult,
      upcomingEventsResult,
      activeStaffResult,
      totalEquipmentResult,
      lowStockResult,
      teamDistributionResult,
      recentEnrollmentsResult
    ] = await Promise.all([
      query('SELECT COUNT(*) as count FROM players'),
      query('SELECT SUM(amount) as total FROM transactions WHERE status = "Completed"'),
      query('SELECT COUNT(*) as count FROM academy_events WHERE event_date >= CURDATE()'),
      query('SELECT COUNT(*) as count FROM team_members WHERE is_active = TRUE'),
      query('SELECT COUNT(*) as count FROM equipment'),
      query('SELECT COUNT(*) as count FROM consumables WHERE current_stock <= low_stock_threshold'),
      query('SELECT team, COUNT(*) as count FROM players GROUP BY team'),
      query('SELECT name, position, team, created_at FROM players ORDER BY created_at DESC LIMIT 5')
    ]);
    
    // Get player performance averages
    const performanceAverages = await query(`
      SELECT 
        AVG(physical_speed) as avg_speed,
        AVG(physical_stamina) as avg_stamina,
        AVG(physical_strength) as avg_strength,
        AVG(technical_dribbling) as avg_dribbling,
        AVG(technical_shooting) as avg_shooting,
        AVG(technical_passing) as avg_passing
      FROM players
    `);
    
    const stats = {
      totalPlayers: totalPlayersResult[0]?.[0]?.count || 0,
      totalRevenue: totalRevenueResult[0]?.[0]?.total || 0,
      upcomingEvents: upcomingEventsResult[0]?.[0]?.count || 0,
      activeStaff: activeStaffResult[0]?.[0]?.count || 0,
      totalEquipment: totalEquipmentResult[0]?.[0]?.count || 0,
      lowStockItems: lowStockResult[0]?.[0]?.count || 0,
      teamDistribution: teamDistributionResult[0],
      recentEnrollments: recentEnrollmentsResult[0],
      performanceAverages: performanceAverages[0],
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      data: stats
    });
    
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}