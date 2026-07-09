import { supabase } from '@/lib/supabase';
import type {
  Notification,
  NotificationInsert,
  NotificationUpdate,
} from '@/types/database';

/**
 * Notification Repository
 * Handles player notifications
 */
export class NotificationRepository {
  /**
   * Get player's notifications
   */
  async getNotifications(playerId: string, limit: number = 50, offset: number = 0): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('player_id', playerId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to get notifications: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get unread notifications
   */
  async getUnreadNotifications(playerId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('player_id', playerId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get unread notifications: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(playerId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('player_id', playerId)
      .eq('is_read', false);

    if (error) {
      throw new Error(`Failed to get unread count: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(id: string): Promise<Notification | null> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get notification: ${error.message}`);
    }

    return data;
  }

  /**
   * Create notification
   */
  async createNotification(notification: NotificationInsert): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }

    return data;
  }

  /**
   * Update notification
   */
  async updateNotification(id: string, notification: NotificationUpdate): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .update(notification)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update notification: ${error.message}`);
    }

    return data;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<Notification> {
    return this.updateNotification(id, {
      is_read: true,
      read_at: new Date().toISOString(),
    });
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(playerId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('player_id', playerId)
      .eq('is_read', false);

    if (error) {
      throw new Error(`Failed to mark all as read: ${error.message}`);
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete notification: ${error.message}`);
    }
  }

  /**
   * Delete expired notifications
   */
  async deleteExpiredNotifications(): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) {
      throw new Error(`Failed to delete expired notifications: ${error.message}`);
    }
  }

  /**
   * Get notifications by type
   */
  async getNotificationsByType(playerId: string, type: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('player_id', playerId)
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get notifications by type: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get notifications by priority
   */
  async getNotificationsByPriority(playerId: string, priority: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('player_id', playerId)
      .eq('priority', priority)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get notifications by priority: ${error.message}`);
    }

    return data || [];
  }
}

export const notificationRepository = new NotificationRepository();
