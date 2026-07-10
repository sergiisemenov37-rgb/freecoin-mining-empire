/**
 * Telegram Authentication API Route
 * Verifies Telegram initData and authenticates users using official @tma.js/init-data-node
 * Updated: 2026-07-10 - Migrated to official library
 */

import { NextRequest, NextResponse } from 'next/server';
import { validate, parse, type InitData } from '@tma.js/init-data-node';
import { createServerClientClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  console.log('[TelegramAuthAPI] =========================================');
  console.log('[TelegramAuthAPI] NEW OFFICIAL LIBRARY VERSION - 2026-07-10');
  console.log('[TelegramAuthAPI] Authentication request received');
  console.log('[TelegramAuthAPI] Request URL:', request.url);
  console.log('[TelegramAuthAPI] Request method:', request.method);
  
  try {
    const { initData } = await request.json();
    console.log('[TelegramAuthAPI] initData received:', !!initData, 'length:', initData?.length);
    console.log('[TelegramAuthAPI] initData (first 100 chars):', initData?.substring(0, 100));

    if (!initData) {
      console.error('[TelegramAuthAPI] ERROR: Missing initData');
      return NextResponse.json(
        { success: false, error: 'Missing initData' },
        { status: 400 }
      );
    }

    // Get bot token from environment
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    console.log('[TelegramAuthAPI] TELEGRAM_BOT_TOKEN present:', !!botToken);
    
    if (!botToken) {
      console.error('[TelegramAuthAPI] ERROR: TELEGRAM_BOT_TOKEN environment variable is not set');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Validate initData using official @tma.js/init-data-node
    console.log('[TelegramAuthAPI] Validating initData with official library');
    try {
      validate(initData, botToken, {
        expiresIn: 86400, // 24 hours
      });
      console.log('[TelegramAuthAPI] initData validation successful');
    } catch (error) {
      console.error('[TelegramAuthAPI] ERROR: initData validation failed:', error);
      return NextResponse.json(
        { success: false, error: 'Invalid Telegram data - signature verification failed' },
        { status: 401 }
      );
    }

    // Parse initData using official library
    console.log('[TelegramAuthAPI] Parsing initData with official library');
    const parsedInitData: InitData = parse(initData);
    console.log('[TelegramAuthAPI] Parsed initData, user.id:', parsedInitData.user?.id);

    if (!parsedInitData.user) {
      console.error('[TelegramAuthAPI] ERROR: No user data in parsed initData');
      return NextResponse.json(
        { success: false, error: 'Invalid Telegram data - no user information' },
        { status: 401 }
      );
    }

    // Get Supabase client
    console.log('[TelegramAuthAPI] Getting Supabase client');
    const supabase = await createServerClientClient();

    // Check if player exists
    console.log('[TelegramAuthAPI] Checking for existing player with telegram_id:', parsedInitData.user.id);
    const { data: existingPlayer, error: fetchError } = await supabase
      .from('players')
      .select('*')
      .eq('telegram_id', parsedInitData.user.id)
      .single();

    console.log('[TelegramAuthAPI] Existing player found:', !!existingPlayer, 'fetchError:', !!fetchError);

    let playerData;

    if (fetchError || !existingPlayer) {
      console.log('[TelegramAuthAPI] Creating new player');
      // Create new player
      const playerDataForInsert = {
        telegram_id: parsedInitData.user.id,
        telegram_username: parsedInitData.user.username || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
        is_active: true,
        is_banned: false,
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
          telegram_username: parsedInitData.user.username || null,
          updated_at: new Date().toISOString(),
          last_active_at: new Date().toISOString(),
        })
        .eq('telegram_id', parsedInitData.user.id)
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
      telegram_id: parsedInitData.user.id,
      player_id: playerData.id,
      username: parsedInitData.user.username || null,
      display_name: `${parsedInitData.user.first_name} ${parsedInitData.user.last_name || ''}`.trim() || parsedInitData.user.username || `User ${parsedInitData.user.id}`,
      avatar: parsedInitData.user.photo_url || null,
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
