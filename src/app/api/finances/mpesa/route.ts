// app/api/finances/mpesa/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// M-Pesa Configuration
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || '';
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || '';
const MPESA_PASSKEY = process.env.MPESA_PASSKEY || '';
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE || '174379';
const MPESA_ENVIRONMENT = process.env.MPESA_ENVIRONMENT || 'sandbox';

// Get M-Pesa Access Token with better error handling
async function getMpesaAccessToken() {
  // Check if credentials are configured
  if (!MPESA_CONSUMER_KEY || MPESA_CONSUMER_KEY === 'your_actual_consumer_key' || 
      !MPESA_CONSUMER_SECRET || MPESA_CONSUMER_SECRET === 'your_actual_consumer_secret') {
    throw new Error('M-Pesa credentials not configured. Please add your Consumer Key and Secret.');
  }

  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
  
  const url = MPESA_ENVIRONMENT === 'production' 
    ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
    : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
  
  try {
    console.log('🔄 Getting M-Pesa access token...');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    // Check if response is OK
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ M-Pesa token error:', response.status, errorText);
      throw new Error(`Failed to get access token: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.access_token) {
      console.error('❌ No access token in response:', data);
      throw new Error('No access token received from M-Pesa');
    }
    
    console.log('✅ M-Pesa access token obtained successfully');
    return data.access_token;
  } catch (error) {
    console.error('Error getting M-Pesa access token:', error);
    throw error;
  }
}

// Initiate STK Push with better error handling
async function initiateStkPush(phoneNumber: string, amount: number, accountReference: string) {
  try {
    const accessToken = await getMpesaAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');

    const url = MPESA_ENVIRONMENT === 'production'
      ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
      : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

    // Clean phone number
    const cleanPhone = phoneNumber.replace(/\s/g, '');
    const phoneNumberWithCountryCode = cleanPhone.startsWith('254') ? cleanPhone : `254${cleanPhone}`;

    const requestBody = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: phoneNumberWithCountryCode,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: phoneNumberWithCountryCode,
      CallBackURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/mpesa/callback`,
      AccountReference: accountReference || `PAY${Date.now()}`,
      TransactionDesc: 'Academy Payment',
    };

    console.log('🔄 Sending M-Pesa STK Push...');
    console.log('📱 Phone:', phoneNumberWithCountryCode);
    console.log('💰 Amount:', amount);
    console.log('🔗 Callback URL:', requestBody.CallBackURL);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // Check if response is OK
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ M-Pesa STK Push error:', response.status, errorText);
      throw new Error(`M-Pesa STK Push failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📨 M-Pesa Response:', data);
    
    return data;
  } catch (error) {
    console.error('Error initiating STK push:', error);
    throw error;
  }
}

// Main POST handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { player_name, amount, phone_number, player_id, date } = body;

    // Validate input
    if (!player_name || !amount || !phone_number) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: player_name, amount, phone_number are required'
      }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Amount must be greater than 0'
      }, { status: 400 });
    }

    if (!phone_number.match(/^254\d{9}$/)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid phone number format. Use 254XXXXXXXXX'
      }, { status: 400 });
    }

    // Check if M-Pesa is configured
    if (!MPESA_CONSUMER_KEY || MPESA_CONSUMER_KEY === 'your_actual_consumer_key' || 
        !MPESA_CONSUMER_SECRET || MPESA_CONSUMER_SECRET === 'your_actual_consumer_secret') {
      console.warn('⚠️ M-Pesa not configured. Recording payment without sending prompt.');
      
      const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const currentDate = date || new Date().toISOString().split('T')[0];
      
      try {
        await query(
          `INSERT INTO transactions 
           (id, player_name, date, amount, type, description, status, payment_method, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            transactionId,
            player_name,
            currentDate,
            amount,
            'PAYMENT',
            `Payment of KES ${amount} by ${player_name}`,
            'Completed',
            'Cash',
            new Date()
          ]
        );

        return NextResponse.json({
          success: true,
          message: 'Payment recorded successfully. M-Pesa integration not configured.',
          data: { 
            id: transactionId, 
            status: 'Completed',
            note: 'M-Pesa not configured - payment recorded as cash'
          }
        });
      } catch (dbError) {
        console.error('Database error:', dbError);
        return NextResponse.json({
          success: false,
          error: 'Failed to record payment in database'
        }, { status: 500 });
      }
    }

    // Generate transaction reference
    const accountReference = `PAY${Date.now()}`;
    
    try {
      // Initiate M-Pesa STK Push
      const mpesaResponse = await initiateStkPush(phone_number, amount, accountReference);

      // Check if M-Pesa request was successful
      if (mpesaResponse.ResponseCode === '0') {
        // Create pending transaction
        const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
        const currentDate = date || new Date().toISOString().split('T')[0];
        
        await query(
          `INSERT INTO transactions 
           (id, player_name, date, amount, type, description, status, payment_method, created_at, mpesa_checkout_request_id) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            transactionId,
            player_name,
            currentDate,
            amount,
            'PAYMENT',
            `M-Pesa payment of KES ${amount} by ${player_name}`,
            'Pending',
            'M-Pesa',
            new Date(),
            mpesaResponse.CheckoutRequestID || null
          ]
        );

        return NextResponse.json({
          success: true,
          message: 'M-Pesa prompt sent successfully! Check your phone.',
          data: {
            transactionId,
            checkoutRequestId: mpesaResponse.CheckoutRequestID,
            phoneNumber: phone_number,
            amount: amount,
            status: 'Pending',
            nextSteps: 'Please check your phone and enter your M-Pesa PIN to complete payment.'
          }
        });
      } else {
        // M-Pesa request failed
        const errorMessage = mpesaResponse.ResponseDescription || 'Failed to send M-Pesa prompt';
        
        // Record failed transaction
        const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
        const currentDate = date || new Date().toISOString().split('T')[0];
        
        await query(
          `INSERT INTO transactions 
           (id, player_name, date, amount, type, description, status, payment_method, created_at, failure_reason) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            transactionId,
            player_name,
            currentDate,
            amount,
            'PAYMENT',
            `Failed M-Pesa payment of KES ${amount} by ${player_name}`,
            'Failed',
            'M-Pesa',
            new Date(),
            errorMessage
          ]
        );

        return NextResponse.json({
          success: false,
          error: errorMessage,
          data: {
            transactionId,
            status: 'Failed',
            failureReason: errorMessage
          }
        }, { status: 400 });
      }
    } catch (mpesaError: any) {
      console.error('M-Pesa error:', mpesaError);
      
      // Record the failed transaction
      const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const currentDate = date || new Date().toISOString().split('T')[0];
      
      try {
        await query(
          `INSERT INTO transactions 
           (id, player_name, date, amount, type, description, status, payment_method, created_at, failure_reason) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            transactionId,
            player_name,
            currentDate,
            amount,
            'PAYMENT',
            `M-Pesa payment failed for ${player_name}`,
            'Failed',
            'M-Pesa',
            new Date(),
            mpesaError.message || 'M-Pesa API error'
          ]
        );
      } catch (dbError) {
        console.error('Failed to record error in database:', dbError);
      }

      return NextResponse.json({
        success: false,
        error: mpesaError.message || 'Failed to initiate M-Pesa payment. Please try again.'
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ M-Pesa payment error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process M-Pesa payment'
    }, { status: 500 });
  }
}