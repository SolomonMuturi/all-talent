import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const tickets = await query(`
      SELECT 
        t.*,
        e.title as event_title,
        e.event_date,
        p.name as player_name,
        p.email as player_email,
        p.phone as player_phone
      FROM tickets t
      LEFT JOIN academy_events e ON t.event_id = e.id
      LEFT JOIN players p ON t.player_id = p.id
      ORDER BY t.created_at DESC
    `);

    // Format dates properly
    const formattedTickets = tickets.map((ticket: any) => ({
      ...ticket,
      event_date: ticket.event_date ? new Date(ticket.event_date).toISOString() : null,
      ticket_date: ticket.ticket_date ? new Date(ticket.ticket_date).toISOString() : null,
      created_at: ticket.created_at ? new Date(ticket.created_at).toISOString() : null,
      updated_at: ticket.updated_at ? new Date(ticket.updated_at).toISOString() : null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        tickets: formattedTickets,
        count: formattedTickets.length
      }
    });
  } catch (error: any) {
    console.error('Failed to fetch tickets:', error);
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
      event_id,
      player_id,
      player_name,
      player_email,
      ticket_type,
      quantity,
      total_amount,
      payment_status = 'Pending',
      ticket_status = 'Pending'
    } = data;

    if (!event_id || !player_id || !ticket_type || !quantity) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const ticketId = `TKT${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const ticketNumber = `TKT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    await query(
      `INSERT INTO tickets 
       (id, ticket_number, event_id, player_id, player_name, player_email, ticket_type, quantity, total_amount, payment_status, ticket_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ticketId,
        ticketNumber,
        event_id,
        player_id,
        player_name || null,
        player_email || null,
        ticket_type,
        quantity,
        total_amount || 0,
        payment_status,
        ticket_status
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Ticket created successfully',
      data: { 
        id: ticketId,
        ticket_number: ticketNumber
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create ticket error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}