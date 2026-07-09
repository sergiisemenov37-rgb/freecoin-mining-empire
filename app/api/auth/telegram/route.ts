/**
 * Telegram Authentication API Route
 * Verifies Telegram initData and authenticates users
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTelegramAuth } from '@/lib/telegram/TelegramAuth';
import { createServerClientClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  console.log('[TelegramAuthAPI] Authentication request received');
  
  try {
    const { initData } = await request.json();
    console.log('[TelegramAuthAPI] initData received:', !!initData, 'length:', initData?.length);

    if (!initData) {
      console.error('[TelegramAuthAPI] Missing initData');
      return NextResponse.json(
        { success: false, error: 'Missing initData' },
        { status: 400 }
      );
    }

    // Verify Telegram initData signature
    console.log('[TelegramAuthAPI] Parsing initData');
    const telegramAuth = getTelegramAuth();
    const authData = telegramAuth.parseInitData(initData);
    
    console.log('[TelegramAuthAPI] Auth data parsed:', !!authData, 'telegram_id:', authData?.telegram_id);

    if (!authData) {
      console.error('[TelegramAuthAPI] Invalid Telegram data - parseInitData returned null');
      return NextResponse.json(
        { success: false, error: 'Invalid Telegram data' },
        { status: 401 }
      );
    }

    // Check if auth date is recent
    const isDateValid = telegramAuth.isAuthDateValid(authData.auth_date);
    console.log('[TelegramAuthAPI] Auth date valid:', isDateValid, 'auth_date:', authData.auth_date);
    
    if (!isDateValid) {
      console.error('[TelegramAuthAPI] Expired authentication data');
      return NextResponse.json(
        { success: false, error: 'Expired authentication data' },
        { status: 401 }
      );
    }

    // Get Supabase client
    console.log('[TelegramAuthAPI] Getting Supabase client');
    const supabase = await createServerClientClient();

    // Check if player exists
    console.log('[TelegramAuthAPI] Checking for existing player with telegram_id:', authData.telegram_id);
    const { data: existingPlayer, error: fetchError } = await supabase
      .from('players')
      .select('*')
      .eq('telegram_id', authData.telegram_id)
      .single();

    console.log('[TelegramAuthAPI] Existing player found:', !!existingPlayer, 'fetchError:', !!fetchError);

    let playerData;

    if (fetchError || !existingPlayer) {
      console.log('[TelegramAuthAPI] Creating new player');
      // Create new player
      const playerDataForInsert = {
        telegram_id: authData.telegram_id,
        username: authData.username,
        display_name: `${authData.first_name} ${authData.last_name || ''}`.trim() || authData.username || `User ${authData.telegram_id}`,
        avatar: authData.photo_url,
        language: authData.language_code,
        last_login: new Date().toISOString(),
        is_premium: authData.is_premium,
        created_at: new Date().toISOString(),
      };

      console.log('[TelegramAuthAPI] Player data for insert:', playerDataForInsert);

      const { data: newPlayer, error: insertError } = await supabase
        .from('players')
        .insert(playerDataForInsert)
        .select()
        .single();

      if (insertError) {
        console.error('[TelegramAuthAPI] Error creating player:', insertError);
        return NextResponse.json(
          { success: false, error: 'Failed to create player' },
          { status: 500 }
        );
      }

      console.log('[TelegramAuthAPI] New player created:', newPlayer);
      playerData = newPlayer;
    } else {
      console.log('[TelegramAuthAPI] Updating existing player');
      // Update existing player
      const { data: updatedPlayer, error: updateError } = await supabase
        .from('players')
        .update({
          username: authData.username,
          display_name: `${authData.first_name} ${authData.last_name || ''}`.trim() || authData.username || `User ${authData.telegram_id}`,
          avatar: authData.photo_url,
          language: authData.language_code,
          last_login: new Date().toISOString(),
          is_premium: authData.is_premium,
        })
        .eq('telegram_id', authData.telegram_id)
        .select()
        .single();

      if (updateError) {
        console.error('[TelegramAuthAPI] Error updating player:', updateError);
        return NextResponse.json(
          { success: false, error: 'Failed to update player' },
          { status: 500 }
        );
      }

      console.log('[TelegramAuthAPI] Player updated:', updatedPlayer);
      playerData = updatedPlayer;
    }

    // Create session
    const session = {
      telegram_id: authData.telegram_id,
      player_id: playerData.id,
      username: authData.username,
      display_name: playerData.display_name,
      avatar: playerData.avatar,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };

    console.log('[TelegramAuthAPI] Session created:', session);
    console.log('[TelegramAuthAPI] Authentication successful, returning response');

    return NextResponse.json({
      success: true,
      session,
      player: playerData,
    });
  } catch (error) {
    console.error('[TelegramAuthAPI] Telegram authentication error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
