/**
 * Telegram Authentication API Route
 * Verifies Telegram initData and authenticates users using official @tma.js/init-data-node
 * Updated: 2026-07-10 - Migrated to official library
 */

import { NextRequest, NextResponse } from 'next/server';
import { validate, parse, type InitData } from '@tma.js/init-data-node';
import { createServerClientClient } from '@/lib/supabase/client';
import { createAdminClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { initData } = await request.json();

    if (!initData) {
      return NextResponse.json(
        { success: false, error: 'Missing initData' },
        { status: 400 }
      );
    }

    // Get bot token from environment
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Validate initData using official @tma.js/init-data-node
    try {
      validate(initData, botToken, {
        expiresIn: 86400, // 24 hours
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid Telegram data - signature verification failed' },
        { status: 401 }
      );
    }

    // Parse initData using official library
    const parsedInitData: InitData = parse(initData);

    if (!parsedInitData.user) {
      return NextResponse.json(
        { success: false, error: 'Invalid Telegram data - no user information' },
        { status: 401 }
      );
    }

    // Get Supabase admin client (bypasses RLS for Telegram auth)
    const supabase = createAdminClient();

    // Check if player exists
    const { data: existingPlayer, error: fetchError } = await supabase
      .from('players')
      .select('*')
      .eq('telegram_id', parsedInitData.user.id)
      .single();

    let playerData;

    if (fetchError || !existingPlayer) {
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

      const { data: newPlayer, error: insertError } = await supabase
        .from('players')
        .insert(playerDataForInsert)
        .select()
        .single();

      if (insertError) {
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
          telegram_username: parsedInitData.user.username || null,
          updated_at: new Date().toISOString(),
          last_active_at: new Date().toISOString(),
        })
        .eq('telegram_id', parsedInitData.user.id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json(
          { success: false, error: 'Failed to update player' },
          { status: 500 }
        );
      }

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

    return NextResponse.json({
      success: true,
      session,
      player: playerData,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
