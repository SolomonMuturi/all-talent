import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const messages = await query(`
      SELECT * FROM messages
      ORDER BY timestamp DESC
      LIMIT 50
    `);

    return NextResponse.json(
      Array.isArray(messages) ? messages : [],
      { status: 200 }
    );
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
    const data = await request.json();
    const {
      channel = 'In-App',
      recipientGroup = '',
      content = '',
      scheduledDate = null
    } = data;

    if (!content || !recipientGroup) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const status = scheduledDate ? 'Scheduled' : 'Sent';
    const timestamp = scheduledDate ? new Date(scheduledDate) : new Date();

    await query(
      `INSERT INTO messages (content, channel, recipient_group, status, timestamp)
       VALUES (?, ?, ?, ?, ?)`,
      [content, channel, recipientGroup, status, timestamp]
    );

    return NextResponse.json({ success: true }, { status: 201 });
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
    await query(`DELETE FROM messages`);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Delete messages error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
