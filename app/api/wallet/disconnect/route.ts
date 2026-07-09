/**
 * Wallet Disconnect API Route
 * Removes wallet address from Supabase
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClientClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  console.log('[WalletDisconnectAPI] Wallet disconnect request received');
  
  try {
    const sessionHeader = request.headers.get('x-telegram-session');
    let telegramId = null;
    
    if (sessionHeader) {
      try {
        const session = JSON.parse(sessionHeader);
        telegramId = session.telegram_id;
      } catch (error) {
        console.error('[WalletDisconnectAPI] Error parsing session:', error);
      }
    }

    if (!telegramId) {
      console.error('[WalletDisconnectAPI] No telegram_id in session');
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const supabase = await createServerClientClient();

    // Remove wallet address from player
    const { data: updatedPlayer, error: updateError } = await supabase
      .from('players')
      .update({
        wallet_address: null,
        wallet_name: null,
        wallet_connected_at: null,
      })
      .eq('telegram_id', telegramId)
      .select()
      .single();

    if (updateError) {
      console.error('[WalletDisconnectAPI] Error updating player:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to disconnect wallet' },
        { status: 500 }
      );
    }

    console.log('[WalletDisconnectAPI] Wallet disconnected successfully');

    return NextResponse.json({
      success: true,
      player: updatedPlayer,
    });
  } catch (error) {
    console.error('[WalletDisconnectAPI] Wallet disconnect error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
