// app/api/mpesa/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('M-Pesa Callback received:', JSON.stringify(body, null, 2));

    const { Body } = body;

    if (!Body || !Body.stkCallback) {
      console.error('Invalid callback structure:', body);
      return NextResponse.json({ ResultCode: 1, ResultDesc: 'Invalid callback' });
    }

    const { stkCallback } = Body;
    const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } = stkCallback;

    // Update transaction based on result
    if (ResultCode === 0) {
      // Payment successful
      console.log('✅ M-Pesa payment successful for checkout:', CheckoutRequestID);
      
      let amount = 0;
      let transactionDate = null;
      
      if (CallbackMetadata && CallbackMetadata.Item) {
        const amountItem = CallbackMetadata.Item.find((item: any) => item.Name === 'Amount');
        const dateItem = CallbackMetadata.Item.find((item: any) => item.Name === 'TransactionDate');
        
        if (amountItem) amount = amountItem.Value;
        if (dateItem) transactionDate = dateItem.Value;
      }

      // Update transaction to Completed
      await query(
        `UPDATE transactions 
         SET status = 'Completed', 
             mpesa_transaction_id = ?,
             completed_at = ?
         WHERE mpesa_checkout_request_id = ?`,
        [
          stkCallback.TransactionID || null,
          transactionDate ? new Date(transactionDate) : new Date(),
          CheckoutRequestID
        ]
      );

      return NextResponse.json({ 
        ResultCode: 0, 
        ResultDesc: 'Payment confirmed successfully' 
      });
    } else {
      // Payment failed
      console.error('❌ M-Pesa payment failed:', ResultDesc);
      
      await query(
        `UPDATE transactions 
         SET status = 'Failed', 
             failure_reason = ?
         WHERE mpesa_checkout_request_id = ?`,
        [ResultDesc, CheckoutRequestID]
      );

      return NextResponse.json({ 
        ResultCode: 0, 
        ResultDesc: 'Payment failure recorded' 
      });
    }
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    return NextResponse.json({ 
      ResultCode: 1, 
      ResultDesc: 'Failed to process callback' 
    });
  }
}