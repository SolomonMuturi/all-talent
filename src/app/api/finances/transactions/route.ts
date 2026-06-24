// app/api/finances/transactions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const playerName = searchParams.get('playerName');
    const limit = parseInt(searchParams.get('limit') || '50');

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

    sql += ' ORDER BY date DESC, created_at DESC LIMIT ?';
    params.push(limit);

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
      status = 'Pending',
      phone_number
    } = data;

    // Validate required fields
    if (!player_name || !date || !amount || !type) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: player_name, date, amount, type are required' 
        },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Amount must be greater than 0' 
        },
        { status: 400 }
      );
    }

    // Validate phone number if provided
    if (phone_number && !phone_number.match(/^254\d{9}$/)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid phone number format. Use 254XXXXXXXXX' 
        },
        { status: 400 }
      );
    }

    // Generate transaction ID
    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    // Determine payment method
    const paymentMethod = phone_number ? 'M-Pesa' : 'Cash';

    // Insert transaction
    await query(
      `INSERT INTO transactions 
       (id, player_name, date, amount, type, description, status, payment_method, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transactionId, 
        player_name, 
        date, 
        amount, 
        type, 
        description || null, 
        status,
        paymentMethod,
        new Date()
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Transaction created successfully',
      data: { 
        id: transactionId,
        player_name,
        amount,
        date,
        status,
        payment_method: paymentMethod
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create transaction error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create transaction' 
      },
      { status: 500 }
    );
  }
}