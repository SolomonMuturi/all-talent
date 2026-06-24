// app/api/finances/mpesa/config/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const isConfigured = !!(
    process.env.MPESA_CONSUMER_KEY &&
    process.env.MPESA_CONSUMER_KEY !== 'your_actual_consumer_key_here' &&
    process.env.MPESA_CONSUMER_SECRET &&
    process.env.MPESA_CONSUMER_SECRET !== 'your_actual_consumer_secret_here' &&
    process.env.MPESA_PASSKEY &&
    process.env.MPESA_PASSKEY !== 'your_actual_passkey_here'
  );

  return NextResponse.json({
    configured: isConfigured,
    environment: process.env.MPESA_ENVIRONMENT || 'sandbox',
    shortcode: process.env.MPESA_SHORTCODE || '174379',
  });
}