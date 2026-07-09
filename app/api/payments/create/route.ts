/**
 * Payment Create API Route
 * Creates a new payment transaction
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClientClient } from '@/lib/supabase/client';
import { PaymentMethod, PaymentType, PaymentStatus } from '@/lib/payments/PaymentTypes';

export async function POST(request: NextRequest) {
  console.log('[PaymentCreateAPI] Payment create request received');
  
  try {
    const { method, type, amount, currency, description, metadata } = await request.json();
    console.log('[PaymentCreateAPI] Payment data:', { method, type, amount, currency });

    if (!method || !type || !amount || !currency) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sessionHeader = request.headers.get('x-telegram-session');
    let telegramId = null;
    
    if (sessionHeader) {
      try {
        const session = JSON.parse(sessionHeader);
        telegramId = session.telegram_id;
      } catch (error) {
        console.error('[PaymentCreateAPI] Error parsing session:', error);
      }
    }

    if (!telegramId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const supabase = await createServerClientClient();

    // Get player ID from telegram_id
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id')
      .eq('telegram_id', telegramId)
      .single();

    if (playerError || !player) {
      return NextResponse.json(
        { success: false, error: 'Player not found' },
        { status: 404 }
      );
    }

    // Create payment transaction
    const { data: payment, error: paymentError } = await supabase
      .from('payment_transactions')
      .insert({
        player_id: player.id,
        method,
        type,
        amount,
        currency,
        status: PaymentStatus.PENDING,
        metadata,
      })
      .select()
      .single();

    if (paymentError) {
      console.error('[PaymentCreateAPI] Error creating payment:', paymentError);
      return NextResponse.json(
        { success: false, error: 'Failed to create payment' },
        { status: 500 }
      );
    }

    console.log('[PaymentCreateAPI] Payment created successfully:', payment);

    return NextResponse.json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error('[PaymentCreateAPI] Payment create error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
