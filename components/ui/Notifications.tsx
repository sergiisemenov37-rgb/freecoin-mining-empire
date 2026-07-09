'use client';

/**
 * Notifications
 * Slide animation, success, warning, error, reward
 */

import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { NotificationConfig, createTransition } from '@/lib/ui/animationConfig';
import Image from 'next/image';

export type NotificationType = 'success' | 'warning' | 'error' | 'reward';

interface Notification {
  id: number;
  type: NotificationType;
  message: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (type: NotificationType, message: string) => {
    const id = Date.now();
    const config = NotificationConfig.types[type];
    
    setNotifications(prev => [...prev, { id, type, message }]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, config.duration);
  };

  return { notifications, addNotification };
}

interface NotificationsProps {
  notifications: Notification[];
  onRemove: (id: number) => void;
}

export default function Notifications({ notifications, onRemove }: NotificationsProps) {
  const prefersReduced = useReducedMotion();
  const transition = createTransition({
    duration: NotificationConfig.slide.duration,
  });

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {notifications.map((notification) => {
          const config = NotificationConfig.types[notification.type];
          
          return (
            <motion.div
              key={notification.id}
              className={`
                relative px-4 py-3 rounded-lg shadow-lg
                flex items-center gap-3 min-w-[300px]
              `}
              style={{
                backgroundColor: config.color + '20',
                border: `2px solid ${config.color}`,
                boxShadow: prefersReduced ? 'none' : `0 4px 20px ${config.color}40`,
              }}
              initial={{ x: NotificationConfig.slide.distance, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: NotificationConfig.slide.distance, opacity: 0 }}
              transition={transition}
            >
              {/* Icon */}
              <motion.div
                className="w-8 h-8"
                animate={
                  !prefersReduced
                    ? {
                        scale: [1, 1.2, 1],
                      }
                    : {}
                }
                transition={
                  !prefersReduced
                    ? {
                        duration: 0.5,
                        repeat: 1,
                      }
                    : {}
                }
              >
                <Image 
                  src={config.icon} 
                  alt={notification.type} 
                  width={32} 
                  height={32} 
                  className="object-contain"
                />
              </motion.div>

              {/* Message */}
              <span className="flex-1 text-white font-medium">{notification.message}</span>

              {/* Close button */}
              <button
                onClick={() => onRemove(notification.id)}
                className="text-white/50 hover:text-white transition-colors"
              >
                ×
              </button>

              {/* Progress bar */}
              {!prefersReduced && (
                <motion.div
                  className="absolute bottom-0 left-0 h-1"
                  style={{
                    backgroundColor: config.color,
                  }}
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{
                    duration: config.duration / 1000,
                    ease: 'linear',
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
