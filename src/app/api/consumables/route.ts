import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const consumables = await query('SELECT * FROM consumables ORDER BY name');
    return NextResponse.json({
      success: true,
      data: { consumables }
    });
  } catch (error: any) {
    console.error('Get consumables error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
