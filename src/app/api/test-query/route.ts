import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    console.log('Testing player 6 query...');
    
    const result = await query('SELECT * FROM players WHERE id = ?', [6]);
    
    console.log('Query result type:', typeof result);
    console.log('Query result is array:', Array.isArray(result));
    console.log('Query result length:', Array.isArray(result) ? result.length : 'N/A');
    console.log('Query result:', JSON.stringify(result, null, 2));
    
    return NextResponse.json({
      isArray: Array.isArray(result),
      length: Array.isArray(result) ? result.length : undefined,
      first: Array.isArray(result) && result.length > 0 ? result[0] : null,
      full: result
    });
  } catch (error: any) {
    console.error('Test error:', error);
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
