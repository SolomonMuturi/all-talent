import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function GET(request: NextRequest) {
  try {
    const messages = await query(`
      SELECT 
        id,
        channel,
        recipient_group as recipientGroup,
        subject,
        content,
        status,
        priority,
        timestamp,
        attachments
      FROM messages 
      ORDER BY timestamp DESC 
      LIMIT 50
    `);

    // Parse attachments JSON for each message
    const formattedMessages = (Array.isArray(messages) ? messages : []).map((msg: any) => ({
      ...msg,
      attachments: msg.attachments ? JSON.parse(msg.attachments) : []
    }));

    return NextResponse.json(formattedMessages, { status: 200 });
  } catch (error: any) {
    console.error('Fetch messages error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const channel = formData.get('channel') as string;
    const recipientGroup = formData.get('recipientGroup') as string;
    const subject = formData.get('subject') as string;
    const content = formData.get('content') as string;
    const priority = formData.get('priority') as string;
    const scheduledDate = formData.get('scheduledDate') as string;
    
    // Validate required fields
    if (!content || !recipientGroup || !subject) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: subject, content, and recipientGroup are required' },
        { status: 400 }
      );
    }

    // Handle file attachments
    const attachments: string[] = [];
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'messages');
    
    // Ensure upload directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    // Process uploaded files
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('attachment_') && value instanceof File) {
        const file = value as File;
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${timestamp}-${safeName}`;
        const filepath = path.join(uploadDir, filename);
        
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);
        
        attachments.push(`/uploads/messages/${filename}`);
      }
    }
    
    const status = scheduledDate && new Date(scheduledDate) > new Date() ? 'Scheduled' : 'Sent';
    const messageTimestamp = scheduledDate && new Date(scheduledDate) > new Date() 
      ? new Date(scheduledDate) 
      : new Date();

    // Insert message into database
    const result = await query(
      `INSERT INTO messages (channel, recipient_group, subject, content, priority, status, timestamp, attachments)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        channel || 'In-App',
        recipientGroup,
        subject,
        content,
        priority || 'Normal',
        status,
        messageTimestamp,
        JSON.stringify(attachments)
      ]
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully',
      data: { id: result.insertId }
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Create message error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Message ID required' },
        { status: 400 }
      );
    }
    
    await query('DELETE FROM messages WHERE id = ?', [id]);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Message deleted successfully' 
    });
  } catch (error: any) {
    console.error('Delete message error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}