import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get summary statistics for finances
    const summary = await query(`
      SELECT 
        type,
        status,
        COUNT(*) as count,
        SUM(amount) as total_amount
      FROM transactions
      GROUP BY type, status
      ORDER BY type, status
    `);

    const totals = await query(`
      SELECT 
        SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_revenue,
        SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_expenses,
        SUM(amount) as net_profit,
        COUNT(*) as total_transactions
      FROM transactions
      WHERE status = 'Completed'
    `);

    return NextResponse.json({
      success: true,
      data: {
        summary,
        totals: totals[0] || {
          total_revenue: 0,
          total_expenses: 0,
          net_profit: 0,
          total_transactions: 0
        }
      }
    });
  } catch (error: any) {
    console.error('Get finance summary error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
