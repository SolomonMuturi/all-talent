import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET: List all clubs
export async function GET() {
  try {
    const clubs = await query(`
      SELECT 
        id,
        name,
        logo_url AS logoUrl,
        admin_email AS adminEmail,
        subscription_plan_id,
        mrr,
        player_count,
        status,
        renewal_date,
        sms_credits,
        ai_credits,
        created_at,
        updated_at
      FROM clubs
      ORDER BY created_at DESC
      LIMIT 100
    `);

    return NextResponse.json({
      success: true,
      data: clubs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: Create a new club
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      name,
      adminEmail,
      logoUrl = '',
      subscriptionPlanId = null,
      mrr = 0,
      playerCount = 0,
      status = 'Trialing',
      renewalDate = null,
      smsCredits = 0,
      aiCredits = 0,
    } = data;

    if (!name || !adminEmail) {
      return NextResponse.json(
        { success: false, error: 'Club name and admin email are required.' },
        { status: 400 }
      );
    }

    const clubId = `CLUB${Date.now()}${Math.floor(Math.random() * 1000)}`;
    await query(
      `INSERT INTO clubs (
        id, name, logo_url, admin_email, subscription_plan_id, mrr, player_count, status, renewal_date, sms_credits, ai_credits, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        clubId,
        name,
        logoUrl,
        adminEmail,
        subscriptionPlanId,
        mrr,
        playerCount,
        status,
        renewalDate,
        smsCredits,
        aiCredits,
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Club created successfully',
      data: { id: clubId, name, adminEmail },
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT: Update club subscription plan, status, mrr, and renewal_date
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, subscription_plan_id, status, mrr, renewal_date } = data;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Club ID is required.' },
        { status: 400 }
      );
    }

    const fields = [];
    const values = [];

    if (subscription_plan_id) {
      fields.push('subscription_plan_id = ?');
      values.push(subscription_plan_id);
    }
    if (status) {
      fields.push('status = ?');
      values.push(status);
    }
    if (typeof mrr !== 'undefined') {
      fields.push('mrr = ?');
      values.push(mrr);
    }
    if (renewal_date) {
      fields.push('renewal_date = ?');
      values.push(renewal_date);
    }

    if (fields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update.' },
        { status: 400 }
      );
    }

    values.push(id);

    await query(
      `UPDATE clubs SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );

    return NextResponse.json({
      success: true,
      message: 'Club updated successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
