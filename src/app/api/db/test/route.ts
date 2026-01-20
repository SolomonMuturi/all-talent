import { testConnection, initDatabase } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test connection
    const connectionTest = await testConnection();
    
    if (!connectionTest.success) {
      return NextResponse.json(
        { success: false, message: 'Database connection failed', error: connectionTest.error },
        { status: 500 }
      );
    }
    
    // Initialize database
    const initResult = await initDatabase();
    
    return NextResponse.json({
      success: true,
      message: 'Database connected and initialized',
      connection: connectionTest,
      initialization: initResult
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Database setup failed', error: error.message },
      { status: 500 }
    );
  }
}