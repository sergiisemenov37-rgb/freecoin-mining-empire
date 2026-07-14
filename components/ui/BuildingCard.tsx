'use client';

/**
 * Building Card
 * Pulse when available, locked animation, unlock animation
 */

import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { BuildingCardConfig, createTransition } from '@/lib/ui/animationConfig';
import Image from 'next/image';
import { AssetManager } from '@/lib/assets/AssetManager';

interface BuildingCardProps {
  children: React.ReactNode;
  isAvailable: boolean;
  isLocked: boolean;
  justUnlocked?: boolean;
  className?: string;
}

export default function BuildingCard({
  children,
  isAvailable,
  isLocked,
  justUnlocked = false,
  className = '',
}: BuildingCardProps) {
  const prefersReduced = useReducedMotion();
  const transition = createTransition({
    duration: BuildingCardConfig.pulse.duration,
  });

  return (
    <motion.div
      className={`
        relative rounded-xl overflow-hidden
        ${className}
      `}
      style={{
        background: 'linear-gradient(135deg, rgba(30, 30, 40, 0.9), rgba(20, 20, 30, 0.9))',
        filter: isLocked && !prefersReduced ? `grayscale(${BuildingCardConfig.locked.grayscale})` : 'none',
        opacity: isLocked ? BuildingCardConfig.locked.opacity : 1,
      }}
      animate={
        isAvailable && !isLocked && !prefersReduced
          ? {
              scale: [1, BuildingCardConfig.pulse.scale, 1],
            }
          : {}
      }
      transition={
        isAvailable && !isLocked && !prefersReduced
          ? {
              duration: BuildingCardConfig.pulse.duration,
              repeat: Infinity,
              ease: 'easeInOut',
            }
          : transition
      }
    >
      {/* Unlock animation */}
      <AnimatePresence>
        {justUnlocked && !prefersReduced && (
          <>
            <motion.div
              className="absolute inset-0 bg-white"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [1, BuildingCardConfig.unlock.scale, 1],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: BuildingCardConfig.unlock.duration,
                times: [0, 0.5, 1],
              }}
            />
            {Array.from({ length: BuildingCardConfig.unlock.flashCount }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-xl"
                style={{
                  border: '3px solid #00ff00',
                  boxShadow: '0 0 20px #00ff00',
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.8, 1.1, 1],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: BuildingCardConfig.unlock.duration,
                  delay: i * 0.1,
                  times: [0, 0.5, 1],
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Locked overlay */}
      {isLocked && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={transition}
        >
          <motion.div
            className="w-16 h-16"
            animate={{ rotate: 360 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <Image 
              src={AssetManager.status.locked} 
              alt="Locked" 
              width={64} 
              height={64} 
              className="object-contain"
            />
          </motion.div>
        </motion.div>
      )}

      {/* Content */}
      <div className="relative z-10 p-6">
        <div className="flex items-center gap-4">
          <Image 
            src={AssetManager.buildings.STARTER_ROOM} 
            alt="Building" 
            width={64} 
            height={64} 
            className="object-contain"
          />
          {children}
        </div>
      </div>
    </motion.div>
  );
}
