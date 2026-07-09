/**
 * Notification System
 * Manages notifications for level up, tier up, unlock, milestone, reward, and goal events
 */

import type {
  Notification,
  NotificationState,
  ProgressionEvent,
  ProgressionEventListener,
  ProgressionConfig,
} from './types';
import {
  NotificationType,
  NotificationPriority,
  ProgressionEventType,
  DEFAULT_PROGRESSION_CONFIG,
} from './types';

/**
 * Notification system class
 */
export class NotificationSystem {
  private state: NotificationState;
  private config: ProgressionConfig;
  private eventListeners: Map<ProgressionEventType, Set<ProgressionEventListener>>;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor(config?: Partial<ProgressionConfig>) {
    this.config = {
      ...DEFAULT_PROGRESSION_CONFIG,
      ...config,
    };

    this.state = {
      notifications: [],
      unreadCount: 0,
      lastReadAt: Date.now(),
    };

    this.eventListeners = new Map();
    this.cleanupInterval = null;

    this.startCleanupInterval();
  }

  /**
   * Start cleanup interval
   */
  private startCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredNotifications();
    }, 60000); // Check every minute
  }

  /**
   * Stop cleanup interval
   */
  private stopCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Cleanup expired notifications
   */
  private cleanupExpiredNotifications(): void {
    const now = Date.now();
    const beforeCount = this.state.notifications.length;

    this.state.notifications = this.state.notifications.filter(
      notification => now - notification.timestamp < this.config.notificationExpiry
    );

    if (this.state.notifications.length !== beforeCount) {
      this.updateUnreadCount();
    }
  }

  /**
   * Add notification
   */
  addNotification(notification: Notification): void {
    // Check max notifications limit
    if (this.state.notifications.length >= this.config.maxNotifications) {
      // Remove oldest notification
      this.state.notifications.shift();
    }

    this.state.notifications.push(notification);
    this.updateUnreadCount();

    // Fire event
    this.fireEvent({
      type: ProgressionEventType.NOTIFICATION_SENT,
      timestamp: Date.now(),
      playerId: '',
      empireId: '',
    } as any);
  }

  /**
   * Create level up notification
   */
  createLevelUpNotification(oldLevel: number, newLevel: number): void {
    this.addNotification({
      id: `notif_level_up_${Date.now()}`,
      type: NotificationType.LEVEL_UP,
      title: 'Level Up!',
      message: `You reached level ${newLevel}!`,
      timestamp: Date.now(),
      read: false,
      priority: NotificationPriority.HIGH,
      metadata: { oldLevel, newLevel },
    });
  }

  /**
   * Create tier up notification
   */
  createTierUpNotification(oldTier: number, newTier: number): void {
    this.addNotification({
      id: `notif_tier_up_${Date.now()}`,
      type: NotificationType.TIER_UP,
      title: 'Tier Up!',
      message: `You reached tier ${newTier}!`,
      timestamp: Date.now(),
      read: false,
      priority: NotificationPriority.HIGH,
      metadata: { oldTier, newTier },
    });
  }

  /**
   * Create unlock notification
   */
  createUnlockNotification(unlockName: string): void {
    this.addNotification({
      id: `notif_unlock_${Date.now()}`,
      type: NotificationType.UNLOCK,
      title: 'New Unlock!',
      message: `You unlocked: ${unlockName}`,
      timestamp: Date.now(),
      read: false,
      priority: NotificationPriority.MEDIUM,
      metadata: { unlockName },
    });
  }

  /**
   * Create milestone notification
   */
  createMilestoneNotification(milestoneName: string): void {
    this.addNotification({
      id: `notif_milestone_${Date.now()}`,
      type: NotificationType.MILESTONE,
      title: 'Milestone Completed!',
      message: `You completed: ${milestoneName}`,
      timestamp: Date.now(),
      read: false,
      priority: NotificationPriority.HIGH,
      metadata: { milestoneName },
    });
  }

  /**
   * Create reward notification
   */
  createRewardNotification(rewardType: string, amount?: number): void {
    const message = amount 
      ? `You received ${amount} ${rewardType}`
      : `You received a reward: ${rewardType}`;

    this.addNotification({
      id: `notif_reward_${Date.now()}`,
      type: NotificationType.REWARD,
      title: 'Reward Granted!',
      message,
      timestamp: Date.now(),
      read: false,
      priority: NotificationPriority.MEDIUM,
      metadata: { rewardType, amount },
    });
  }

  /**
   * Create goal notification
   */
  createGoalNotification(goalTitle: string): void {
    this.addNotification({
      id: `notif_goal_${Date.now()}`,
      type: NotificationType.GOAL,
      title: 'Goal Completed!',
      message: `You completed: ${goalTitle}`,
      timestamp: Date.now(),
      read: false,
      priority: NotificationPriority.MEDIUM,
      metadata: { goalTitle },
    });
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): boolean {
    const notification = this.state.notifications.find(n => n.id === notificationId);
    if (!notification || notification.read) return false;

    notification.read = true;
    this.updateUnreadCount();
    return true;
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    for (const notification of this.state.notifications) {
      notification.read = true;
    }
    this.state.lastReadAt = Date.now();
    this.updateUnreadCount();
  }

  /**
   * Delete notification
   */
  deleteNotification(notificationId: string): boolean {
    const index = this.state.notifications.findIndex(n => n.id === notificationId);
    if (index === -1) return false;

    this.state.notifications.splice(index, 1);
    this.updateUnreadCount();
    return true;
  }

  /**
   * Clear all notifications
   */
  clearAllNotifications(): void {
    this.state.notifications = [];
    this.updateUnreadCount();
  }

  /**
   * Update unread count
   */
  private updateUnreadCount(): void {
    this.state.unreadCount = this.state.notifications.filter(n => !n.read).length;
  }

  /**
   * Get notification
   */
  getNotification(notificationId: string): Notification | undefined {
    return this.state.notifications.find(n => n.id === notificationId);
  }

  /**
   * Get all notifications
   */
  getAllNotifications(): Notification[] {
    return [...this.state.notifications];
  }

  /**
   * Get unread notifications
   */
  getUnreadNotifications(): Notification[] {
    return this.state.notifications.filter(n => !n.read);
  }

  /**
   * Get notifications by type
   */
  getNotificationsByType(type: NotificationType): Notification[] {
    return this.state.notifications.filter(n => n.type === type);
  }

  /**
   * Get notifications by priority
   */
  getNotificationsByPriority(priority: NotificationPriority): Notification[] {
    return this.state.notifications.filter(n => n.priority === priority);
  }

  /**
   * Get unread count
   */
  getUnreadCount(): number {
    return this.state.unreadCount;
  }

  /**
   * Get state
   */
  getState(): NotificationState {
    return {
      notifications: [...this.state.notifications],
      unreadCount: this.state.unreadCount,
      lastReadAt: this.state.lastReadAt,
    };
  }

  /**
   * Set state
   */
  setState(state: NotificationState): void {
    this.state = {
      notifications: [...state.notifications],
      unreadCount: state.unreadCount,
      lastReadAt: state.lastReadAt,
    };
  }

  /**
   * Reset notifications
   */
  reset(): void {
    this.state = {
      notifications: [],
      unreadCount: 0,
      lastReadAt: Date.now(),
    };
  }

  /**
   * Register event listener
   */
  on(eventType: ProgressionEventType, listener: ProgressionEventListener): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener);
  }

  /**
   * Unregister event listener
   */
  off(eventType: ProgressionEventType, listener: ProgressionEventListener): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Fire event to listeners
   */
  private fireEvent(event: ProgressionEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      for (const listener of listeners) {
        listener(event);
      }
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ProgressionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get configuration
   */
  getConfig(): ProgressionConfig {
    return { ...this.config };
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopCleanupInterval();
  }
}
