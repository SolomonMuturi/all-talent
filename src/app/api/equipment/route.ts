import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const equipment = await query('SELECT * FROM equipment ORDER BY name');
    return NextResponse.json({
      success: true,
      data: {
        equipment,
        count: equipment.length
      }
    });
  } catch (error: any) {
    console.error('Get equipment error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
