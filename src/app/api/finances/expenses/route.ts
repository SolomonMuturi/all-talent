// app/api/finances/expenses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/finances/expenses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = 'SELECT * FROM expenses WHERE 1=1';
    const params: any[] = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY payment_date DESC, created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const expenses = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: expenses,
      count: expenses.length
    });
  } catch (error: any) {
    console.error('Get expenses error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/finances/expenses
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, category, description, status, payment_date, payee } = body;

    // Validate required fields
    if (!amount || !category || !description || !status || !payment_date) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: amount, category, description, status, payment_date are required'
      }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Amount must be greater than 0'
      }, { status: 400 });
    }

    // Generate ID
    const id = `EXP${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Insert expense
    await query(
      `INSERT INTO expenses 
       (id, amount, category, description, status, payment_date, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        amount,
        category,
        description,
        status,
        payment_date,
        new Date()
      ]
    );

    // Also record in transactions table for consistency
    try {
      const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
      await query(
        `INSERT INTO transactions 
         (id, player_name, date, amount, type, description, status, payment_method, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          transactionId,
          payee || category,
          payment_date,
          -amount, // Negative for expense
          'EXPENSE',
          `${category} expense: ${description}`,
          status || 'Completed',
          'Cash',
          new Date()
        ]
      );
    } catch (txnError) {
      console.warn('Could not create transaction record:', txnError);
      // Don't fail the request if transaction creation fails
    }

    return NextResponse.json({
      success: true,
      message: 'Expense logged successfully',
      data: { id }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create expense error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create expense'
    }, { status: 500 });
  }
}