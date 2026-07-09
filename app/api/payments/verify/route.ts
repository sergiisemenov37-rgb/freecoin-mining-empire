/**
 * Payment Verify API Route
 * Verifies a payment transaction
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClientClient } from '@/lib/supabase/client';
import { PaymentStatus } from '@/lib/payments/PaymentTypes';

export async function POST(request: NextRequest) {
  console.log('[PaymentVerifyAPI] Payment verify request received');
  
  try {
    const { paymentId, transactionHash } = await request.json();
    console.log('[PaymentVerifyAPI] Verify data:', { paymentId, transactionHash });

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: 'Missing payment ID' },
        { status: 400 }
      );
    }

    const supabase = await createServerClientClient();

    // Update payment with transaction hash and mark as completed
    const { data: payment, error: updateError } = await supabase
      .from('payment_transactions')
      .update({
        transaction_hash: transactionHash,
        status: PaymentStatus.COMPLETED,
        completed_at: new Date().toISOString(),
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (updateError) {
      console.error('[PaymentVerifyAPI] Error verifying payment:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to verify payment' },
        { status: 500 }
      );
    }

    console.log('[PaymentVerifyAPI] Payment verified successfully:', payment);

    return NextResponse.json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error('[PaymentVerifyAPI] Payment verify error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
