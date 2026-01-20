import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET all talents
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') || '100';
    
    let sql = 'SELECT * FROM talents';
    const params: any[] = [];
    
    if (status) {
      sql += ' WHERE status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const talents = await query(sql, params);
    
    return NextResponse.json({
      success: true,
      data: talents,
      count: talents.length
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch talents', error: error.message },
      { status: 500 }
    );
  }
}

// POST create new talent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { name, email, phone, skills, experience, location } = body;
    
    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: 'Name and email are required' },
        { status: 400 }
      );
    }
    
    const result = await query(
      `INSERT INTO talents (name, email, phone, skills, experience, location) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, phone || null, skills || null, experience || null, location || null]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Talent created successfully',
      talentId: (result as any).insertId
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to create talent', error: error.message },
      { status: 500 }
    );
  }
}