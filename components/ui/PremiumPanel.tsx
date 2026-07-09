'use client';

/**
 * Premium Panel
 * Glassmorphism, neon borders, smooth shadows, animated gradients
 */

import { motion, useReducedMotion } from 'framer-motion';
import { PanelConfig, createTransition } from '@/lib/ui/animationConfig';

interface PremiumPanelProps {
  children: React.ReactNode;
  variant?: 'default' | 'neon' | 'gradient';
  className?: string;
}

export default function PremiumPanel({
  children,
  variant = 'default',
  className = '',
}: PremiumPanelProps) {
  const prefersReduced = useReducedMotion();

  const transition = createTransition({
    duration: 0.3,
  });

  return (
    <motion.div
      className={`
        relative rounded-2xl overflow-hidden
        ${className}
      `}
      style={{
        backdropFilter: prefersReduced ? 'none' : `blur(${PanelConfig.glassmorphism.blur}px)`,
        WebkitBackdropFilter: prefersReduced ? 'none' : `blur(${PanelConfig.glassmorphism.blur}px)`,
        backgroundColor: `rgba(255, 255, 255, ${PanelConfig.glassmorphism.opacity})`,
        boxShadow: prefersReduced ? 'none' : `0 ${PanelConfig.shadow.blur}px ${PanelConfig.shadow.spread}px rgba(0, 0, 0, ${PanelConfig.shadow.opacity})`,
        ...(variant === 'gradient' && !prefersReduced
          ? {
              background: `linear-gradient(${PanelConfig.gradient.angle}deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.1))`,
              backgroundSize: '200% 200%',
            }
          : {}),
        ...(variant === 'default'
          ? {
              background: `rgba(255, 255, 255, ${PanelConfig.glassmorphism.opacity})`,
            }
          : {}),
      }}
      animate={
        !prefersReduced && variant === 'gradient'
          ? {
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }
          : undefined
      }
      transition={
        !prefersReduced && variant === 'gradient'
          ? {
              duration: PanelConfig.gradient.speed,
              repeat: Infinity,
              ease: 'linear',
            }
          : transition
      }
    >
      {/* Neon border */}
      {variant === 'neon' && !prefersReduced && (
        <>
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{
              border: `${PanelConfig.neonBorder.width}px solid rgba(59, 130, 246, ${PanelConfig.neonBorder.glowIntensity})`,
              boxShadow: `0 0 ${PanelConfig.neonBorder.glowIntensity * 20}px rgba(59, 130, 246, ${PanelConfig.neonBorder.glowIntensity})`,
            }}
            animate={{
              opacity: [PanelConfig.neonBorder.glowIntensity * 0.5, PanelConfig.neonBorder.glowIntensity, PanelConfig.neonBorder.glowIntensity * 0.5],
            }}
            transition={{
              duration: PanelConfig.neonBorder.pulseSpeed,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{
              border: `${PanelConfig.neonBorder.width}px solid rgba(147, 51, 234, ${PanelConfig.neonBorder.glowIntensity})`,
              boxShadow: `0 0 ${PanelConfig.neonBorder.glowIntensity * 20}px rgba(147, 51, 234, ${PanelConfig.neonBorder.glowIntensity})`,
            }}
            animate={{
              opacity: [PanelConfig.neonBorder.glowIntensity * 0.5, PanelConfig.neonBorder.glowIntensity, PanelConfig.neonBorder.glowIntensity * 0.5],
            }}
            transition={{
              duration: PanelConfig.neonBorder.pulseSpeed,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: PanelConfig.neonBorder.pulseSpeed / 2,
            }}
          />
        </>
      )}

      {/* Content */}
      <div className="relative z-10 p-6">{children}</div>
    </motion.div>
  );
}
