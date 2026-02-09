// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 Registration API called');
    
    const { name, email, password, token, userType, location, phone } = await request.json();

    console.log('📝 Registration data:', { name, email, token: token?.substring(0, 20) + '...', userType });

    // Validate required fields
    if (!name || !email || !password || !token) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Name, email, password, and invitation token are required.' 
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format');
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      console.log('❌ Password too short');
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    // Validate token and get invitation
    console.log('🔍 Validating token...');
    const validationResult = await db.invitations.isValid(token);
    
    if (!validationResult.valid) {
      console.log('❌ Invalid token:', validationResult.reason);
      return NextResponse.json(
        { 
          success: false, 
          error: validationResult.reason || 'Invalid invitation token.' 
        },
        { 
          status: validationResult.reason === 'Token not found' ? 404 : 
                 validationResult.reason === 'Token expired' ? 410 : 
                 validationResult.reason === 'Token already used' ? 410 : 400 
        }
      );
    }

    const invitation = validationResult.invitation;
    console.log('✅ Token validated, invitation:', {
      id: invitation.id,
      email: invitation.email,
      user_type: invitation.user_type
    });

    // Check if invitation email matches registration email
    if (invitation.email.toLowerCase() !== email.toLowerCase()) {
      console.log('❌ Email mismatch:', { invitationEmail: invitation.email, registrationEmail: email });
      return NextResponse.json(
        { 
          success: false, 
          error: 'This invitation is for a different email address.' 
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    console.log('🔍 Checking if user already exists...');
    const existingUser = await db.users.findByEmail(email);
    if (existingUser) {
      console.log('❌ User already exists:', existingUser.email);
      // Mark invitation as used if user already exists
      await db.invitations.markAsUsed(token);
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'This email is already registered. Please login instead.' 
        },
        { status: 409 }
      );
    }

    // Hash the password
    console.log('🔐 Hashing password...');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Determine user type (use from invitation if provided, otherwise from request)
    const finalUserType = invitation.user_type || userType || 'player';
    
    // Validate user type
    const validUserTypes = ['player', 'coach', 'scout', 'academy'];
    if (!validUserTypes.includes(finalUserType)) {
      console.log('❌ Invalid user type:', finalUserType);
      return NextResponse.json(
        { success: false, error: 'Invalid user type.' },
        { status: 400 }
      );
    }

    console.log('👤 Creating user in database...');
    // Create user in users table
    const userId = await db.users.create({
      name,
      email,
      password_hash: passwordHash,
      phone: phone || invitation.phone || null,
      location: location || invitation.location || null,
      user_type: finalUserType as 'player' | 'coach' | 'scout' | 'academy',
      invitation_token: token
    });

    console.log('✅ User created with ID:', userId);

    // Mark invitation as used
    console.log('📝 Marking invitation as used...');
    await db.invitations.markAsUsed(token);

    // Calculate trial end date (14 days from now)
    const trialStartedAt = new Date();
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    // Optional: Send welcome email
    try {
      await sendWelcomeEmail(email, name, trialEndsAt);
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError);
      // Don't fail registration if email fails
    }

    // Log successful registration
    console.log(`✅ User registered successfully: ${email} (ID: ${userId})`);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Registration successful! Your 14-day free trial has started.',
        user: {
          id: userId,
          name,
          email,
          user_type: finalUserType,
          trial_started: trialStartedAt.toISOString(),
          trial_ends_at: trialEndsAt.toISOString(),
          invitation_used: true
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ Registration error:', error);
    
    // Handle specific database errors
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists.' },
        { status: 409 }
      );
    }
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return NextResponse.json(
        { success: false, error: 'Invalid invitation reference.' },
        { status: 400 }
      );
    }
    
    if (error.code === 'ER_DATA_TOO_LONG') {
      return NextResponse.json(
        { success: false, error: 'Some data is too long. Please check your input.' },
        { status: 400 }
      );
    }

    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.error('❌ Table does not exist. Please run database initialization.');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database configuration error. Please contact support.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Registration failed. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Helper function to send welcome email
async function sendWelcomeEmail(email: string, name: string, trialEndsAt: Date) {
  // Only send if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('Email credentials not configured, skipping welcome email');
    return;
  }

  const nodemailer = await import('nodemailer');
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const loginUrl = `${appUrl}/login`;
  const formattedTrialEnds = trialEndsAt.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  await transporter.sendMail({
    from: `"TalantaTrack" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🎉 Welcome to TalantaTrack - Your Free Trial Has Started!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px 0; background: linear-gradient(to right, #22c55e, #3b82f6); color: white; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to TalantaTrack!</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Football Talent Platform</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <p>Hi <strong>${name}</strong>,</p>
          
          <p>Congratulations! Your account has been successfully created and your <strong>14-day free trial</strong> has started.</p>
          
          <div style="text-align: center; margin: 30px 0; padding: 20px; background: white; border-radius: 10px; border: 2px solid #22c55e;">
            <a href="${loginUrl}" 
               style="background: linear-gradient(to right, #22c55e, #3b82f6); 
                      color: white; padding: 15px 30px; text-decoration: none; 
                      border-radius: 5px; font-size: 18px; font-weight: bold; display: inline-block;">
              🚀 Start Using TalantaTrack
            </a>
            <p style="margin-top: 15px; color: #666; font-size: 14px;">
              Click above to log in and explore all features
            </p>
          </div>
          
          <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2e7d32;">📋 Your Trial Details:</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li><strong>Duration:</strong> 14 days free trial</li>
              <li><strong>Start Date:</strong> ${new Date().toLocaleDateString()}</li>
              <li><strong>End Date:</strong> ${formattedTrialEnds}</li>
              <li><strong>Features:</strong> Full access to all TalantaTrack features</li>
            </ul>
          </div>
          
          <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1565c0;">💡 Getting Started Tips:</h3>
            <ol style="margin: 10px 0; padding-left: 20px;">
              <li>Complete your profile setup</li>
              <li>Explore the dashboard features</li>
              <li>Upload your first player/talent profile</li>
              <li>Try out the match scheduling feature</li>
              <li>Check out the analytics dashboard</li>
            </ol>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;">
              <strong>⚠️ Trial Expiration:</strong> You'll receive reminders 3 days and 1 day before your trial ends.
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              Need help or have questions?<br>
              Email us at: <a href="mailto:solomonnjuguna8@gmail.com" style="color: #1565c0;">solomonnjuguna8@gmail.com</a>
            </p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; background: #f0f0f0; border-radius: 0 0 10px 10px; color: #666; font-size: 12px;">
          <p style="margin: 0;">
            This is an automated message. Please do not reply to this email.<br>
            © ${new Date().getFullYear()} TalantaTrack. All rights reserved.
          </p>
        </div>
      </div>
    `,
  });

  console.log(`📧 Welcome email sent to ${email}`);
}

// GET method for testing
export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const connectionTest = await db.testConnection();
    
    return NextResponse.json({
      success: true,
      message: 'Registration API is working',
      timestamp: new Date().toISOString(),
      database: connectionTest.success ? 'Connected' : 'Disconnected',
      environment: process.env.NODE_ENV,
      table_info: {
        invitations: await db.query('SHOW TABLES LIKE "invitations"'),
        users: await db.query('SHOW TABLES LIKE "users"')
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}