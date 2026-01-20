import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const playerName = searchParams.get('playerName');

    let sql = 'SELECT * FROM transactions WHERE 1=1';
    const params: any[] = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }

    if (playerName) {
      sql += ' AND player_name LIKE ?';
      params.push(`%${playerName}%`);
    }

    sql += ' ORDER BY date DESC, created_at DESC';

    const transactions = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        count: transactions.length
      }
    });
  } catch (error: any) {
    console.error('Get transactions error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      player_name,
      date,
      amount,
      type,
      description,
      status = 'Pending'
    } = data;

    if (!player_name || !date || !amount || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    await query(
      `INSERT INTO transactions (id, player_name, date, amount, type, description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [transactionId, player_name, date, amount, type, description || null, status]
    );

    return NextResponse.json({
      success: true,
      message: 'Transaction created successfully',
      data: { id: transactionId }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create transaction error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
