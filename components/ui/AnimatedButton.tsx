'use client';

/**
 * Animated Button
 * Hover glow, click scale, ripple effect, disabled animation, success flash
 */

import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useRef, useState, MouseEvent } from 'react';
import { ButtonConfig, prefersReducedMotion, createTransition } from '@/lib/ui/animationConfig';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  showSuccess?: boolean;
  className?: string;
}

export default function AnimatedButton({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  showSuccess = false,
  className = '',
}: AnimatedButtonProps) {
  const prefersReduced = useReducedMotion();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseDown = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled || prefersReduced) return;

    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = {
      id: Date.now(),
      x,
      y,
    };

    setRipples(prev => [...prev, newRipple]);
    setIsPressed(true);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, ButtonConfig.ripple.duration * 1000);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleMouseLeave = () => {
    setIsPressed(false);
  };

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
    success: 'bg-green-600 hover:bg-green-500 text-white',
  };

  const transition = createTransition({
    duration: ButtonConfig.hover.duration,
  });

  return (
    <motion.button
      ref={buttonRef}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      className={`
        relative overflow-hidden rounded-lg font-semibold
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={{
        transition: prefersReduced ? 'none' : 'all 0.2s ease',
      }}
      animate={{
        scale: disabled ? ButtonConfig.disabled.scale : isPressed ? ButtonConfig.click.scale : 1,
        opacity: disabled ? ButtonConfig.disabled.opacity : 1,
      }}
      whileHover={!disabled && !prefersReduced ? {
        scale: ButtonConfig.hover.scale,
        boxShadow: `0 0 ${ButtonConfig.hover.glowIntensity * 20}px ${variant === 'primary' ? 'rgba(59, 130, 246, 0.5)' : 
                   variant === 'danger' ? 'rgba(239, 68, 68, 0.5)' : 
                   variant === 'success' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(107, 114, 128, 0.5)'}`,
      } : undefined}
      transition={transition}
    >
      {/* Ripples */}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full bg-white/30"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 0,
              height: 0,
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              width: ButtonConfig.ripple.size,
              height: ButtonConfig.ripple.size,
              opacity: [0.5, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: ButtonConfig.ripple.duration,
              ease: 'easeOut',
            }}
          />
        ))}
      </AnimatePresence>

      {/* Success flash */}
      <AnimatePresence>
        {showSuccess && !prefersReduced && (
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.5, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: ButtonConfig.success.flashDuration,
              times: [0, 0.5, 1],
              repeat: ButtonConfig.success.flashCount,
            }}
          />
        )}
      </AnimatePresence>

      {/* Button content */}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
