// app/api/dashboard/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get all dashboard statistics
    const [
      totalPlayersResult,
      totalRevenueResult,
      totalExpensesResult,
      upcomingEventsResult,
      activeStaffResult,
      totalEquipmentResult,
      lowStockResult,
      teamDistributionResult,
      recentEnrollmentsResult,
      recentTransactionsResult,
      monthlyRevenueResult,
      monthlyExpensesResult
    ] = await Promise.all([
      // Player stats
      query('SELECT COUNT(*) as count FROM players'),
      
      // Revenue from transactions (completed payments)
      query(`
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM transactions 
        WHERE status = 'Completed' AND type = 'PAYMENT'
      `),
      
      // Expenses - table may not exist yet
      query(`
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM expenses 
        WHERE status = 'Paid'
      `).catch(() => [{ total: 0 }]),
      
      // Upcoming events
      query('SELECT COUNT(*) as count FROM academy_events WHERE event_date >= CURDATE()'),
      
      // Active staff
      query('SELECT COUNT(*) as count FROM team_members'),
      
      // Total equipment
      query('SELECT COUNT(*) as count FROM equipment'),
      
      // Low stock items
      query('SELECT COUNT(*) as count FROM consumables WHERE current_stock <= low_stock_threshold'),
      
      // Team distribution
      query('SELECT team, COUNT(*) as count FROM players GROUP BY team'),
      
      // Recent enrollments
      query(`
        SELECT name, position, team, created_at 
        FROM players 
        ORDER BY created_at DESC 
        LIMIT 5
      `),
      
      // Recent transactions - using actual column names
      query(`
        SELECT 
          id,
          amount,
          type,
          status,
          description,
          player_name,
          payment_method,
          created_at as date
        FROM transactions 
        ORDER BY created_at DESC 
        LIMIT 10
      `).catch(() => []),
      
      // Monthly revenue (last 6 months)
      query(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COALESCE(SUM(amount), 0) as revenue
        FROM transactions 
        WHERE status = 'Completed' 
          AND type = 'PAYMENT'
          AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month ASC
      `).catch(() => []),
      
      // Monthly expenses
      query(`
        SELECT 
          DATE_FORMAT(payment_date, '%Y-%m') as month,
          COALESCE(SUM(amount), 0) as expenses
        FROM expenses 
        WHERE status = 'Paid'
          AND payment_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(payment_date, '%Y-%m')
        ORDER BY month ASC
      `).catch(() => [])
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
    `).catch(() => [null]);
    
    // Calculate financial metrics
    const totalRevenue = Number(totalRevenueResult?.[0]?.total) || 0;
    const totalExpenses = Number(totalExpensesResult?.[0]?.total) || 0;
    const netProfit = totalRevenue - totalExpenses;
    
    // Format monthly data for charts
    const monthlyData = mergeMonthlyData(
      monthlyRevenueResult || [],
      monthlyExpensesResult || []
    );
    
    // Format transactions with proper field mapping
    const recentTransactions = (recentTransactionsResult || []).map((t: any) => ({
      id: t.id,
      amount: Number(t.amount) || 0,
      type: t.type || 'Payment',
      status: t.status || 'Completed',
      description: t.description || '',
      playerName: t.player_name || 'N/A',
      paymentMethod: t.payment_method || 'N/A',
      date: t.date || new Date().toISOString()
    }));
    
    const stats = {
      // Core stats
      totalPlayers: Number(totalPlayersResult?.[0]?.count) || 0,
      upcomingEvents: Number(upcomingEventsResult?.[0]?.count) || 0,
      activeStaff: Number(activeStaffResult?.[0]?.count) || 0,
      totalEquipment: Number(totalEquipmentResult?.[0]?.count) || 0,
      lowStockItems: Number(lowStockResult?.[0]?.count) || 0,
      teamDistribution: teamDistributionResult || [],
      recentEnrollments: recentEnrollmentsResult || [],
      performanceAverages: performanceAverages?.[0] || null,
      
      // Financial stats
      totalRevenue: totalRevenue,
      totalExpenses: totalExpenses,
      netProfit: netProfit,
      recentTransactions: recentTransactions,
      monthlyData: monthlyData,
      
      // Timestamp
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      data: stats
    });
    
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch dashboard stats'
    }, { status: 500 });
  }
}

// Helper function to merge monthly revenue and expenses data
function mergeMonthlyData(revenueData: any[], expenseData: any[]) {
  const months = new Map();
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  // Add revenue data
  revenueData.forEach((item: any) => {
    const monthKey = item.month;
    if (!monthKey) return;
    
    const [year, month] = monthKey.split('-');
    const monthName = monthNames[parseInt(month) - 1] || month;
    const label = `${monthName} ${year}`;
    
    months.set(monthKey, {
      month: monthKey,
      label: label,
      revenue: Number(item.revenue) || 0,
      expenses: 0
    });
  });
  
  // Add expense data
  expenseData.forEach((item: any) => {
    const monthKey = item.month;
    if (!monthKey) return;
    
    if (months.has(monthKey)) {
      const existing = months.get(monthKey);
      existing.expenses = Number(item.expenses) || 0;
    } else {
      const [year, month] = monthKey.split('-');
      const monthName = monthNames[parseInt(month) - 1] || month;
      const label = `${monthName} ${year}`;
      
      months.set(monthKey, {
        month: monthKey,
        label: label,
        revenue: 0,
        expenses: Number(item.expenses) || 0
      });
    }
  });
  
  // Convert to array, sort by month, and format for charts
  return Array.from(months.values())
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(item => ({
      month: item.label,
      revenue: item.revenue,
      expenses: item.expenses
    }));
}