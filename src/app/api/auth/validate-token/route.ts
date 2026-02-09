import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request: NextRequest) {
  console.log('🔍 Validate token endpoint hit');
  
  try {
    // Get token from URL
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'No token provided' },
        { status: 400 }
      );
    }

    console.log('🔑 Validating token:', token.substring(0, 20) + '...');

    // Create database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'alltalent_db',
      connectTimeout: 10000,
    });

    try {
      // Query for the invitation
      const [rows]: any = await connection.execute(
        'SELECT * FROM invitations WHERE token = ?',
        [token]
      );

      if (rows.length === 0) {
        console.log('❌ Token not found');
        return NextResponse.json(
          { valid: false, error: 'Invalid invitation token' },
          { status: 404 }
        );
      }

      const invitation = rows[0];
      console.log('✅ Found invitation for:', invitation.email);

      // Check if used (handle both 1/0 and true/false)
      const isUsed = invitation.used === 1 || invitation.used === true || invitation.used === '1';
      
      if (isUsed) {
        console.log('❌ Token already used');
        return NextResponse.json(
          { valid: false, error: 'This invitation has already been used' },
          { status: 410 }
        );
      }

      // Check if expired
      const expiresAt = new Date(invitation.expires_at);
      const now = new Date();
      
      if (expiresAt < now) {
        console.log('❌ Token expired on:', expiresAt.toISOString());
        return NextResponse.json(
          { valid: false, error: 'This invitation has expired' },
          { status: 410 }
        );
      }

      // Return valid invitation
      const safeInvitation = {
        id: invitation.id,
        name: invitation.name,
        email: invitation.email,
        phone: invitation.phone || null,
        location: invitation.location,
        user_type: invitation.user_type,
        message: invitation.message || null,
        expires_at: invitation.expires_at,
        created_at: invitation.created_at,
      };

      const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      console.log('🎯 Token valid! Days remaining:', daysRemaining);

      return NextResponse.json({
        valid: true,
        invitation: safeInvitation,
        message: 'Invitation is valid',
        expires: expiresAt.toLocaleDateString(),
        days_remaining: daysRemaining,
      });

    } finally {
      await connection.end();
    }

  } catch (error: any) {
    console.error('💥 CRITICAL ERROR in validate-token:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    // More specific error messages
    let userMessage = 'Internal server error';
    
    if (error.code === 'ECONNREFUSED') {
      userMessage = 'Database connection failed. Make sure MySQL is running.';
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      userMessage = 'Database access denied. Check credentials.';
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      userMessage = 'Database does not exist.';
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      userMessage = 'Invitations table not found.';
    } else if (error.message.includes('connect ETIMEDOUT')) {
      userMessage = 'Database connection timeout.';
    }

    return NextResponse.json(
      {
        valid: false,
        error: userMessage,
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}