import { supabase } from '@/lib/supabase';
import type {
  Friend,
  FriendInsert,
  FriendUpdate,
} from '@/types/database';

/**
 * Friend Repository
 * Handles player friendships
 */
export class FriendRepository {
  /**
   * Get player's friends
   */
  async getFriends(playerId: string): Promise<Friend[]> {
    const { data, error } = await supabase
      .from('friends')
      .select('*')
      .or(`requester_id.eq.${playerId},receiver_id.eq.${playerId}`)
      .eq('status', 'accepted')
      .order('accepted_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get friends: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get friend requests (received)
   */
  async getFriendRequests(playerId: string): Promise<Friend[]> {
    const { data, error } = await supabase
      .from('friends')
      .select('*')
      .eq('receiver_id', playerId)
      .eq('status', 'pending')
      .order('requested_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get friend requests: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get sent friend requests
   */
  async getSentFriendRequests(playerId: string): Promise<Friend[]> {
    const { data, error } = await supabase
      .from('friends')
      .select('*')
      .eq('requester_id', playerId)
      .eq('status', 'pending')
      .order('requested_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get sent friend requests: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get friendship between two players
   */
  async getFriendship(playerId1: string, playerId2: string): Promise<Friend | null> {
    const { data, error } = await supabase
      .from('friends')
      .select('*')
      .or(`and(requester_id.eq.${playerId1},receiver_id.eq.${playerId2}),and(requester_id.eq.${playerId2},receiver_id.eq.${playerId1})`)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get friendship: ${error.message}`);
    }

    return data;
  }

  /**
   * Send friend request
   */
  async sendFriendRequest(requesterId: string, receiverId: string): Promise<Friend> {
    const existing = await this.getFriendship(requesterId, receiverId);
    
    if (existing) {
      throw new Error('Friendship already exists');
    }

    const { data, error } = await supabase
      .from('friends')
      .insert({
        requester_id: requesterId,
        receiver_id: receiverId,
        status: 'pending',
        requested_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to send friend request: ${error.message}`);
    }

    return data;
  }

  /**
   * Accept friend request
   */
  async acceptFriendRequest(id: string): Promise<Friend> {
    return this.updateFriendship(id, {
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    });
  }

  /**
   * Decline friend request
   */
  async declineFriendRequest(id: string): Promise<void> {
    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to decline friend request: ${error.message}`);
    }
  }

  /**
   * Block player
   */
  async blockPlayer(requesterId: string, receiverId: string): Promise<Friend> {
    const existing = await this.getFriendship(requesterId, receiverId);
    
    if (existing) {
      return this.updateFriendship(existing.id, {
        status: 'blocked',
        blocked_at: new Date().toISOString(),
      });
    }

    const { data, error } = await supabase
      .from('friends')
      .insert({
        requester_id: requesterId,
        receiver_id: receiverId,
        status: 'blocked',
        blocked_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to block player: ${error.message}`);
    }

    return data;
  }

  /**
   * Remove friend
   */
  async removeFriend(id: string): Promise<void> {
    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to remove friend: ${error.message}`);
    }
  }

  /**
   * Update friendship
   */
  async updateFriendship(id: string, friendship: FriendUpdate): Promise<Friend> {
    const { data, error } = await supabase
      .from('friends')
      .update(friendship)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update friendship: ${error.message}`);
    }

    return data;
  }

  /**
   * Get blocked players
   */
  async getBlockedPlayers(playerId: string): Promise<Friend[]> {
    const { data, error } = await supabase
      .from('friends')
      .select('*')
      .eq('requester_id', playerId)
      .eq('status', 'blocked')
      .order('blocked_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get blocked players: ${error.message}`);
    }

    return data || [];
  }
}

export const friendRepository = new FriendRepository();
