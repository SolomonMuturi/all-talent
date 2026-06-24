// app/api/finances/mpesa/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');

    if (!transactionId) {
      return NextResponse.json({
        success: false,
        error: 'Transaction ID is required'
      }, { status: 400 });
    }

    const results = await query(
      `SELECT id, status, amount, player_name, created_at, mpesa_transaction_id 
       FROM transactions 
       WHERE id = ? OR mpesa_checkout_request_id = ?`,
      [transactionId, transactionId]
    );

    if (results.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Transaction not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: results[0]
    });
  } catch (error: any) {
    console.error('Check transaction status error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to check transaction status'
    }, { status: 500 });
  }
}