import { notificationRepository } from '@/repositories/NotificationRepository';
import type {
  NotificationInsert,
  NotificationUpdate,
} from '@/types/database';

/**
 * Notification Service
 * Service layer for notification operations
 * No business logic - only CRUD operations
 */
export class NotificationService {
  /**
   * Get player's notifications
   */
  async getNotifications(playerId: string, limit: number = 50, offset: number = 0) {
    return notificationRepository.getNotifications(playerId, limit, offset);
  }

  /**
   * Get unread notifications
   */
  async getUnreadNotifications(playerId: string) {
    return notificationRepository.getUnreadNotifications(playerId);
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(playerId: string) {
    return notificationRepository.getUnreadCount(playerId);
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(id: string) {
    return notificationRepository.getNotificationById(id);
  }

  /**
   * Create notification
   */
  async createNotification(notification: NotificationInsert) {
    return notificationRepository.createNotification(notification);
  }

  /**
   * Update notification
   */
  async updateNotification(id: string, notification: NotificationUpdate) {
    return notificationRepository.updateNotification(id, notification);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string) {
    return notificationRepository.markAsRead(id);
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(playerId: string) {
    return notificationRepository.markAllAsRead(playerId);
  }

  /**
   * Delete notification
   */
  async deleteNotification(id: string) {
    return notificationRepository.deleteNotification(id);
  }

  /**
   * Delete expired notifications
   */
  async deleteExpiredNotifications() {
    return notificationRepository.deleteExpiredNotifications();
  }

  /**
   * Get notifications by type
   */
  async getNotificationsByType(playerId: string, type: string) {
    return notificationRepository.getNotificationsByType(playerId, type);
  }

  /**
   * Get notifications by priority
   */
  async getNotificationsByPriority(playerId: string, priority: string) {
    return notificationRepository.getNotificationsByPriority(playerId, priority);
  }
}

export const notificationService = new NotificationService();
