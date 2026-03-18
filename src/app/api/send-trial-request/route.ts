// app/api/send-trial-request/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  let connection;
  
  try {
    // Parse request body
    const body = await request.json();
    const { name, email, phone, location, userType, message } = body;

    // Validate required fields
    if (!name || !email || !location || !userType) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Validate userType
    const validUserTypes = ['player', 'coach', 'scout', 'academy'];
    if (!validUserTypes.includes(userType)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user type' },
        { status: 400 }
      );
    }

    // Generate unique token for registration
    const token = crypto.randomBytes(32).toString('hex');
    
    // Set expiration (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // ============================================
    // STORE INVITATION IN DATABASE
    // ============================================
    try {
      // REMOVED: The duplicate check for existing active invitations
      // This allows users to submit multiple requests with the same email

      // Store new invitation in database
      await db.invitations.create({
        token,
        name,
        email,
        phone,
        location,
        user_type: userType as any,
        message,
        expires_at: expiresAt
      });

      console.log(`✅ Invitation stored in database for ${email}`);
    } catch (dbError: any) {
      console.error('❌ Database error:', dbError);
      
      // Handle specific database errors
      if (dbError.code === 'ER_DUP_ENTRY') {
        return NextResponse.json(
          { success: false, message: 'Invitation already exists. Please try again.' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to process your request. Please try again later.' 
        },
        { status: 500 }
      );
    }

    // Generate registration link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const registrationLink = `${appUrl}/register?token=${token}`;

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // ============================================
    // EMAIL 1: Send request details to SOLOMON
    // ============================================
    const mailToSolomon = {
      from: `"TalantaTrack" <${process.env.EMAIL_USER}>`,
      to: 'solomonnjuguna8@gmail.com',
      subject: `New TalantaTrack Free Trial Request - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #22c55e;">New Free Trial Request from TalantaTrack</h2>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #333;">Request Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #666; width: 150px;"><strong>Name:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #666;"><strong>Email:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #666;"><strong>Phone:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${phone || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #666;"><strong>Location:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${location}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #666;"><strong>User Type:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${userType}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #666;"><strong>Message:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${message || 'No additional message'}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #666;"><strong>Registration Link:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                  <a href="${registrationLink}" style="color: #22c55e; word-break: break-all;">${registrationLink}</a>
                  <br><small>Token: ${token}</small>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px; color: #666;"><strong>Expires:</strong></td>
                <td style="padding: 10px;">${expiresAt.toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 10px; color: #666;"><strong>Request Date:</strong></td>
                <td style="padding: 10px;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p style="margin: 0; color: #2e7d32;">
              <strong>Action Required:</strong> Please follow up with this lead within 24 hours.
            </p>
            <p style="margin: 5px 0 0 0; color: #2e7d32; font-size: 14px;">
              This invitation has been stored in the database with ID: <strong>${token.substring(0, 12)}...</strong>
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
            <p>This is an automated message from TalantaTrack Free Trial Form.</p>
            <p>Database: ${process.env.DB_NAME || 'alltalent_db'}</p>
          </div>
        </div>
      `,
      // Plain text version
      text: `
New Free Trial Request from TalantaTrack

Request Details:
Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Location: ${location}
User Type: ${userType}
Message: ${message || 'No additional message'}
Registration Link: ${registrationLink}
Token: ${token}
Expires: ${expiresAt.toLocaleDateString()}
Request Date: ${new Date().toLocaleString()}

Action Required: Please follow up with this lead within 24 hours.
Invitation stored in database with token: ${token.substring(0, 12)}...
      `.trim(),
    };

    // ============================================
    // EMAIL 2: Send COMBINED confirmation + registration to USER
    // ============================================
    const mailToUser = {
      from: `"TalantaTrack" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Your TalantaTrack Registration Link`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px 0;">
            <h1 style="color: #22c55e; margin: 0;">TalantaTrack</h1>
            <p style="color: #666; margin: 5px 0;">Football Talent Platform</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">Thank You for Your Interest!</h2>
            
            <p>Hi ${name},</p>
            
            <p>We've received your request for a free trial of TalantaTrack. Here's your exclusive registration link:</p>
            
            <div style="text-align: center; margin: 30px 0; padding: 20px; background: white; border-radius: 10px; border: 2px solid #22c55e;">
              <a href="${registrationLink}" 
                 style="background: linear-gradient(to right, #22c55e, #3b82f6); 
                        color: white; padding: 15px 30px; text-decoration: none; 
                        border-radius: 5px; font-size: 18px; font-weight: bold; display: inline-block;">
                🚀 Complete Registration
              </a>
              <p style="margin-top: 15px; color: #666; font-size: 14px;">
                Click above to create your account and start your 14-day free trial
              </p>
            </div>
            
            <p><strong>Your Request Summary:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li><strong>User Type:</strong> ${userType}</li>
              <li><strong>Location:</strong> ${location}</li>
              ${message ? `<li><strong>Your Message:</strong> ${message}</li>` : ''}
            </ul>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h3 style="color: #856404; margin-top: 0;">⚠️ Important Information:</h3>
              <ul style="margin: 10px 0; padding-left: 20px; color: #856404;">
                <li>This link expires on ${expiresAt.toLocaleDateString()}</li>
                <li>Do not share this link with anyone</li>
                <li>Your 14-day free trial starts immediately after registration</li>
              </ul>
            </div>
            
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #1565c0;">
                <strong>Need immediate assistance?</strong><br>
                Email us at: <a href="mailto:solomonnjuguna8@gmail.com" style="color: #1565c0;">solomonnjuguna8@gmail.com</a>
              </p>
            </div>
            
            <div style="margin-top: 20px; padding: 10px; background-color: #f5f5f5; border-radius: 5px; font-size: 12px; color: #666;">
              <p style="margin: 0;">
                <strong>Note:</strong> This invitation is unique to you and has been securely stored in our system.
                If you encounter any issues, please reply to this email with your invitation code: 
                <code style="background: #eee; padding: 2px 5px; border-radius: 3px;">${token.substring(0, 12)}...</code>
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} TalantaTrack. All rights reserved.</p>
          </div>
        </div>
      `,
      // Plain text version
      text: `
TalantaTrack
Football Talent Platform

Thank You for Your Interest!

Hi ${name},

We've received your request for a free trial of TalantaTrack. Here's what happens next:

Your Registration Link: ${registrationLink}

Click this link to create your account and start your 14-day free trial.

Your Request Summary:
- User Type: ${userType}
- Location: ${location}
${message ? `- Your Message: ${message}\n` : ''}

Important Information:
• This link expires on ${expiresAt.toLocaleDateString()}
• Do not share this link with anyone
• Your 14-day free trial starts immediately after registration

Your invitation code: ${token.substring(0, 12)}...

Need immediate assistance?
Email us at: solomonnjuguna8@gmail.com

This is an automated message. Please do not reply to this email.
© ${new Date().getFullYear()} TalantaTrack. All rights reserved.
      `.trim(),
    };

    // Send both emails
    await transporter.sendMail(mailToSolomon);
    await transporter.sendMail(mailToUser);

    console.log(`✅ Emails sent successfully to ${email} and solomonnjuguna8@gmail.com`);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Thank you! Check your email for the registration link.' 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Error in send-trial-request:', error);
    
    // Provide specific error messages
    let errorMessage = 'Failed to send request. Please try again.';
    let statusCode = 500;
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please contact support.';
    } else if (error.code === 'EENVELOPE') {
      errorMessage = 'Invalid email address. Please check your email and try again.';
      statusCode = 400;
    } else if (error.message?.includes('ENOTFOUND')) {
      errorMessage = 'Network error. Please check your internet connection.';
    } else if (error.message?.includes('database')) {
      errorMessage = 'Database connection issue. Please try again later.';
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: statusCode }
    );
  }
}