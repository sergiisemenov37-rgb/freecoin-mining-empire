import { friendRepository } from '@/repositories/FriendRepository';
import type {
  FriendInsert,
  FriendUpdate,
} from '@/types/database';

/**
 * Friend Service
 * Service layer for friend operations
 * No business logic - only CRUD operations
 */
export class FriendService {
  /**
   * Get player's friends
   */
  async getFriends(playerId: string) {
    return friendRepository.getFriends(playerId);
  }

  /**
   * Get friend requests (received)
   */
  async getFriendRequests(playerId: string) {
    return friendRepository.getFriendRequests(playerId);
  }

  /**
   * Get sent friend requests
   */
  async getSentFriendRequests(playerId: string) {
    return friendRepository.getSentFriendRequests(playerId);
  }

  /**
   * Get friendship between two players
   */
  async getFriendship(playerId1: string, playerId2: string) {
    return friendRepository.getFriendship(playerId1, playerId2);
  }

  /**
   * Send friend request
   */
  async sendFriendRequest(requesterId: string, receiverId: string) {
    return friendRepository.sendFriendRequest(requesterId, receiverId);
  }

  /**
   * Accept friend request
   */
  async acceptFriendRequest(id: string) {
    return friendRepository.acceptFriendRequest(id);
  }

  /**
   * Decline friend request
   */
  async declineFriendRequest(id: string) {
    return friendRepository.declineFriendRequest(id);
  }

  /**
   * Block player
   */
  async blockPlayer(requesterId: string, receiverId: string) {
    return friendRepository.blockPlayer(requesterId, receiverId);
  }

  /**
   * Remove friend
   */
  async removeFriend(id: string) {
    return friendRepository.removeFriend(id);
  }

  /**
   * Update friendship
   */
  async updateFriendship(id: string, friendship: FriendUpdate) {
    return friendRepository.updateFriendship(id, friendship);
  }

  /**
   * Get blocked players
   */
  async getBlockedPlayers(playerId: string) {
    return friendRepository.getBlockedPlayers(playerId);
  }
}

export const friendService = new FriendService();
