/**
 * Wallet Connect API Route
 * Saves wallet address to Supabase with primary wallet support
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClientClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  console.log('[WalletConnectAPI] Wallet connect request received');
  
  try {
    const { address, walletName, isPrimary } = await request.json();
    console.log('[WalletConnectAPI] Wallet data:', { address, walletName, isPrimary });

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Missing wallet address' },
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
        console.error('[WalletConnectAPI] Error parsing session:', error);
      }
    }

    if (!telegramId) {
      console.error('[WalletConnectAPI] No telegram_id in session');
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const supabase = await createServerClientClient();

    // Update player with wallet address
    const { data: updatedPlayer, error: updateError } = await supabase
      .from('players')
      .update({
        wallet_address: address,
        wallet_name: walletName || null,
        wallet_connected_at: new Date().toISOString(),
      })
      .eq('telegram_id', telegramId)
      .select()
      .single();

    if (updateError) {
      console.error('[WalletConnectAPI] Error updating player:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to save wallet' },
        { status: 500 }
      );
    }

    console.log('[WalletConnectAPI] Wallet saved successfully:', updatedPlayer);

    return NextResponse.json({
      success: true,
      player: updatedPlayer,
      isPrimary,
    });
  } catch (error) {
    console.error('[WalletConnectAPI] Wallet connect error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
