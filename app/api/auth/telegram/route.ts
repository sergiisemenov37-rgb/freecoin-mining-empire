/**
 * Telegram Authentication API Route
 * Verifies Telegram initData and authenticates users
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTelegramAuth } from '@/lib/telegram/TelegramAuth';
import { createServerClientClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { initData } = await request.json();

    if (!initData) {
      return NextResponse.json(
        { success: false, error: 'Missing initData' },
        { status: 400 }
      );
    }

    // Verify Telegram initData signature
    const telegramAuth = getTelegramAuth();
    const authData = telegramAuth.parseInitData(initData);

    if (!authData) {
      return NextResponse.json(
        { success: false, error: 'Invalid Telegram data' },
        { status: 401 }
      );
    }

    // Check if auth date is recent
    if (!telegramAuth.isAuthDateValid(authData.auth_date)) {
      return NextResponse.json(
        { success: false, error: 'Expired authentication data' },
        { status: 401 }
      );
    }

    // Get Supabase client
    const supabase = await createServerClientClient();

    // Check if player exists
    const { data: existingPlayer, error: fetchError } = await supabase
      .from('players')
      .select('*')
      .eq('telegram_id', authData.telegram_id)
      .single();

    let playerData;

    if (fetchError || !existingPlayer) {
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

      const { data: newPlayer, error: insertError } = await supabase
        .from('players')
        .insert(playerDataForInsert)
        .select()
        .single();

      if (insertError) {
        console.error('Error creating player:', insertError);
        return NextResponse.json(
          { success: false, error: 'Failed to create player' },
          { status: 500 }
        );
      }

      playerData = newPlayer;
    } else {
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
        console.error('Error updating player:', updateError);
        return NextResponse.json(
          { success: false, error: 'Failed to update player' },
          { status: 500 }
        );
      }

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

    return NextResponse.json({
      success: true,
      session,
      player: playerData,
    });
  } catch (error) {
    console.error('Telegram authentication error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
