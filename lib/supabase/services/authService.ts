/**
 * Auth Service
 * Handles authentication with Supabase and Telegram integration
 */

import { createServerClientClient, createAdminClient } from '../client';
import { PlayerService } from './playerService';

export class AuthService {
  /**
   * Sign up with Telegram
   */
  static async signUpWithTelegram(telegramId: bigint, telegramUsername?: string) {
    const supabase = await createServerClientClient();
    
    // Check if player already exists
    const existingPlayer = await PlayerService.getPlayerByTelegramId(telegramId);
    if (existingPlayer) {
      throw new Error('Player already exists');
    }

    // Create auth user with Telegram metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: `${telegramId}@telegram.temp`,
      password: crypto.randomUUID(),
      options: {
        data: {
          telegram_id: telegramId.toString(),
          telegram_username: telegramUsername,
        },
      },
    });

    if (authError) throw authError;

    // Create player record
    const player = await PlayerService.createPlayer({
      telegram_id: Number(telegramId),
      telegram_username: telegramUsername,
    });

    // Create player profile
    await PlayerService.createPlayerProfile({
      player_id: player.id,
      display_name: telegramUsername || `Player${telegramId}`,
      level: 1,
      experience: 0,
    });

    return { authData, player };
  }

  /**
   * Sign in with Telegram
   */
  static async signInWithTelegram(telegramId: bigint) {
    const supabase = await createServerClientClient();
    
    // Get player by Telegram ID
    const player = await PlayerService.getPlayerByTelegramId(telegramId);
    if (!player) {
      throw new Error('Player not found');
    }

    // Get auth user by metadata
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;

    const authUser = users.find(u => u.user_metadata.telegram_id === telegramId.toString());
    if (!authUser) {
      throw new Error('Auth user not found');
    }

    // Sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: `${telegramId}@telegram.temp`,
      password: '', // Password is not needed for this flow
    });

    if (signInError) throw signInError;

    // Update last active
    await PlayerService.updateLastActive(player.id);

    return { signInData, player };
  }

  /**
   * Get current user
   */
  static async getCurrentUser() {
    const supabase = await createServerClientClient();
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    return user;
  }

  /**
   * Get player from current auth user
   */
  static async getPlayerFromAuth() {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error('No authenticated user');
    }

    const telegramId = BigInt(user.user_metadata.telegram_id);
    return PlayerService.getPlayerByTelegramId(telegramId);
  }

  /**
   * Sign out
   */
  static async signOut() {
    const supabase = await createServerClientClient();
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  /**
   * Delete user account
   */
  static async deleteAccount() {
    const supabase = createAdminClient();
    const user = await this.getCurrentUser();
    
    if (!user) {
      throw new Error('No authenticated user');
    }

    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) throw error;
  }
}
