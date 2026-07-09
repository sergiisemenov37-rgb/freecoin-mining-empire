/**
 * HapticButton Component
 * Button with Telegram Haptic Feedback support
 */

'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { useTelegram } from '@/hooks/useTelegram';

interface HapticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  hapticStyle?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
  hapticOnHover?: boolean;
}

export const HapticButton = forwardRef<HTMLButtonElement, HapticButtonProps>(
  ({ hapticStyle = 'medium', hapticOnHover = false, onClick, onMouseEnter, ...props }, ref) => {
    const { hapticImpact, isTelegram } = useTelegram();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isTelegram) {
        hapticImpact(hapticStyle);
      }
      onClick?.(e);
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (hapticOnHover && isTelegram) {
        hapticImpact('light');
      }
      onMouseEnter?.(e);
    };

    return (
      <button
        ref={ref}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        {...props}
      />
    );
  }
);

HapticButton.displayName = 'HapticButton';
