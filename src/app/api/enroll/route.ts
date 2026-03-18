// app/api/enroll/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Configure file upload directories
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const AVATAR_DIR = path.join(UPLOAD_DIR, 'avatars');
const DOCUMENTS_DIR = path.join(UPLOAD_DIR, 'documents');

// Ensure directories exist
function ensureDirectories() {
  if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });
  if (!existsSync(AVATAR_DIR)) mkdirSync(AVATAR_DIR, { recursive: true });
  if (!existsSync(DOCUMENTS_DIR)) mkdirSync(DOCUMENTS_DIR, { recursive: true });
}

export async function POST(request: NextRequest) {
  try {
    ensureDirectories();
    
    const formData = await request.formData();
    
    // Extract form data
    const fullName = formData.get('fullName') as string;
    const dateOfBirth = formData.get('dateOfBirth') as string;
    const position = formData.get('position') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const email = formData.get('email') as string;
    const team = formData.get('team') as string || 'Unassigned';
    
    // Extract files
    const profilePicture = formData.get('profilePicture') as File;
    const birthCertificate = formData.get('birthCertificate') as File;
    const releaseLetter = formData.get('releaseLetter') as File;
    
    // Validate required fields
    if (!fullName || !dateOfBirth || !position) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: fullName, dateOfBirth, position' },
        { status: 400 }
      );
    }
    
    // Calculate age
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    // Generate unique IDs
    const playerNumber = `TT${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;
    
    // Handle file uploads
    let avatarUrl = null;
    let birthCertificateUrl = null;
    let releaseLetterUrl = null;
    
    // Upload profile picture
    if (profilePicture && profilePicture.size > 0) {
      const avatarExt = profilePicture.name.split('.').pop() || 'jpg';
      const avatarFilename = `${playerNumber}_avatar.${avatarExt}`;
      const avatarPath = path.join(AVATAR_DIR, avatarFilename);
      const avatarBuffer = Buffer.from(await profilePicture.arrayBuffer());
      await writeFile(avatarPath, avatarBuffer);
      avatarUrl = `/uploads/avatars/${avatarFilename}`;
    }
    
    // Upload birth certificate
    if (birthCertificate && birthCertificate.size > 0) {
      const certExt = birthCertificate.name.split('.').pop() || 'pdf';
      const certFilename = `${playerNumber}_birth_cert.${certExt}`;
      const certPath = path.join(DOCUMENTS_DIR, certFilename);
      const certBuffer = Buffer.from(await birthCertificate.arrayBuffer());
      await writeFile(certPath, certBuffer);
      birthCertificateUrl = `/uploads/documents/${certFilename}`;
    }
    
    // Upload release letter
    if (releaseLetter && releaseLetter.size > 0) {
      const letterExt = releaseLetter.name.split('.').pop() || 'pdf';
      const letterFilename = `${playerNumber}_release_letter.${letterExt}`;
      const letterPath = path.join(DOCUMENTS_DIR, letterFilename);
      const letterBuffer = Buffer.from(await releaseLetter.arrayBuffer());
      await writeFile(letterPath, letterBuffer);
      releaseLetterUrl = `/uploads/documents/${letterFilename}`;
    }
    
    // Start database transaction
    const connection = await getConnection();
    await connection.beginTransaction();
    
    try {
      // Insert player
      const [playerResult] = await connection.query(
        `INSERT INTO players (
          name, age, position, avatar_url, team, phone_number, email,
          date_of_birth, attendance, discipline_score, \`rank\`, points,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          fullName,
          age,
          position,
          avatarUrl,
          team,
          phoneNumber || null,
          email || null,
          dateOfBirth,
          0,  // attendance
          100, // discipline_score
          0,  // rank
          0,  // points
        ]
      );
      
      const playerId = (playerResult as any).insertId;
      
      // Create birth certificate record if uploaded
      if (birthCertificateUrl) {
        const certificateId = `CERT${Date.now()}${uuidv4().slice(0, 8)}`;
        await connection.query(
          `INSERT INTO certificates (id, player_id, module_name, date) 
           VALUES (?, ?, ?, CURDATE())`,
          [certificateId, playerId, 'Birth Certificate Verification']
        );
      }
      
      // Create release letter record if uploaded
      if (releaseLetterUrl) {
        const certificateId = `CERT${Date.now()}${uuidv4().slice(0, 8)}`;
        await connection.query(
          `INSERT INTO certificates (id, player_id, module_name, date) 
           VALUES (?, ?, ?, CURDATE())`,
          [certificateId, playerId, 'Previous Club Release Letter']
        );
      }
      
      // Create guardian user account if email provided
      if (email) {
        const username = email.split('@')[0] + '_guardian';
        const tempPassword = Math.random().toString(36).slice(-8);
        const passwordHash = await hashPassword(tempPassword);
        
        await connection.query(
          `INSERT INTO users (username, email, password_hash, full_name, role) 
           VALUES (?, ?, ?, ?, 'VIEWER')`,
          [username, email, passwordHash, `Guardian of ${fullName}`]
        );
      }
      
      // Create enrollment transaction
      const transactionId = `TXN${Date.now()}${uuidv4().slice(0, 8)}`;
      await connection.query(
        `INSERT INTO transactions (id, player_name, date, amount, type, status, description) 
         VALUES (?, ?, CURDATE(), 5000, 'FEE_PAYMENT', 'PENDING', ?)`,
        [transactionId, fullName, `Enrollment fee for ${fullName}`]
      );
      
      // Commit transaction
      await connection.commit();
      
      return NextResponse.json({
        success: true,
        message: 'Player enrolled successfully',
        data: {
          playerId,
          playerNumber,
          name: fullName,
          position,
          age,
          team,
          avatarUrl,
          documents: {
            birthCertificate: birthCertificateUrl,
            releaseLetter: releaseLetterUrl
          },
          transactionId
        }
      }, { status: 201 });
      
    } catch (error: any) {
      await connection.rollback();
      console.error('Database error:', error);
      throw error;
    } finally {
      connection.release();
    }
    
  } catch (error: any) {
    console.error('Enrollment error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to enroll player',
        details: process.env.NODE_ENV === 'development' ? error.code : undefined
      },
      { status: 500 }
    );
  }
}