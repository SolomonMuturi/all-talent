import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('✅ Test endpoint called');
  
  return NextResponse.json({
    success: true,
    message: 'API is working',
    timestamp: new Date().toISOString(),
    node_env: process.env.NODE_ENV,
  });
}