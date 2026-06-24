// app/api/finances/transactions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// M-Pesa Daraja API configuration
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const MPESA_PASSKEY = process.env.MPESA_PASSKEY;
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE;
const MPESA_ENVIRONMENT = process.env.MPESA_ENVIRONMENT || 'sandbox'; // 'sandbox' or 'production'

async function getMpesaAccessToken() {
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
  
  const response = await fetch(
    MPESA_ENVIRONMENT === 'production' 
      ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
      : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  );

  const data = await response.json();
  return data.access_token;
}

async function initiateMpesaPayment(phoneNumber: string, amount: number, accountReference: string) {
  const accessToken = await getMpesaAccessToken();
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');

  const response = await fetch(
    MPESA_ENVIRONMENT === 'production'
      ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
      : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: MPESA_SHORTCODE,
        PhoneNumber: phoneNumber,
        CallBackURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/mpesa/callback`,
        AccountReference: accountReference,
        TransactionDesc: 'Academy Payment',
      }),
    }
  );

  return response.json();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { player_name, amount, phone_number, description } = body;

    // Validate phone number
    if (!phone_number || !phone_number.match(/^254\d{9}$/)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid phone number format. Use 254XXXXXXXXX'
      }, { status: 400 });
    }

    // Generate transaction reference
    const transactionRef = `TXN${Date.now()}`;

    // Initiate M-Pesa payment
    const mpesaResponse = await initiateMpesaPayment(
      phone_number,
      amount,
      transactionRef
    );

    // Check if M-Pesa request was successful
    if (mpesaResponse.ResponseCode === '0') {
      // Save transaction with M-Pesa details
      const result = await query(
        `INSERT INTO transactions 
         (id, player_name, date, amount, type, description, status, created_at, payment_method, mpesa_checkout_request_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          transactionRef,
          player_name,
          new Date().toISOString().split('T')[0],
          amount,
          'PAYMENT',
          description || `Payment by ${player_name}`,
          'Pending',
          new Date(),
          'M-Pesa',
          mpesaResponse.CheckoutRequestID
        ]
      );

      return NextResponse.json({
        success: true,
        data: {
          transactionId: transactionRef,
          checkoutRequestId: mpesaResponse.CheckoutRequestID,
          message: 'M-Pesa payment prompt sent successfully'
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: mpesaResponse.ResponseDescription || 'Failed to initiate M-Pesa payment'
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Payment error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process payment'
    }, { status: 500 });
  }
}