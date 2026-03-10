// src/app/api/db/init/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { initDatabase, testConnection } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Simple security check using an admin secret
    // You should set ADMIN_SECRET in your .env.local
    const authHeader = request.headers.get('authorization');
    const adminSecret = process.env.ADMIN_SECRET;

    if (!adminSecret) {
      console.error('❌ ADMIN_SECRET is not configured in environment variables');
      return NextResponse.json(
        { success: false, error: 'Initialization security is not configured.' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${adminSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔵 Database initialization API called');
    
    // Test connection first
    const connectionTest = await testConnection();
    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: connectionTest.error
      }, { status: 500 });
    }

    // Run initialization
    const result = await initDatabase();
    
    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (error: any) {
    console.error('❌ Initialization API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to initialize database',
      details: error.message
    }, { status: 500 });
  }
}

// GET method to check status
export async function GET(request: NextRequest) {
  try {
    const connectionTest = await testConnection();
    return NextResponse.json({
      success: true,
      message: 'Database initialization endpoint is ready',
      database_connected: connectionTest.success,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
