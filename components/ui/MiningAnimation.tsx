'use client';

/**
 * Mining Animation
 * Mining beam, energy flow, rotating fans, LED blinking
 */

import { motion, useReducedMotion } from 'framer-motion';
import { MiningAnimationConfig } from '@/lib/ui/animationConfig';
import Image from 'next/image';
import { Assets } from '@/lib/assets';

interface MiningAnimationProps {
  isActive: boolean;
  className?: string;
}

export default function MiningAnimation({ isActive, className = '' }: MiningAnimationProps) {
  const prefersReduced = useReducedMotion();

  return (
    <div className={`relative ${className}`}>
      {/* Mining beam */}
      {!prefersReduced && (
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2"
          style={{
            width: MiningAnimationConfig.beam.width,
            height: '100%',
            background: 'linear-gradient(180deg, rgba(0, 255, 255, 0.5), rgba(0, 255, 255, 0.1), transparent)',
            transformOrigin: 'top center',
          }}
          animate={isActive ? {
            opacity: [MiningAnimationConfig.beam.opacity * 0.5, MiningAnimationConfig.beam.opacity, MiningAnimationConfig.beam.opacity * 0.5],
            scaleY: [0.8, 1, 0.8],
          } : { opacity: 0, scaleY: 0 }}
          transition={{
            duration: MiningAnimationConfig.beam.pulseSpeed,
            repeat: isActive ? Infinity : 0,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Energy flow particles */}
      {!prefersReduced && isActive && (
        <>
          {Array.from({ length: MiningAnimationConfig.energyFlow.particleCount }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 w-2 h-2 rounded-full bg-cyan-400"
              style={{
                transform: 'translateX(-50%)',
                boxShadow: '0 0 10px #00ffff',
              }}
              initial={{ top: '0%', opacity: 1 }}
              animate={{
                top: ['0%', '100%'],
                opacity: [1, 0],
              }}
              transition={{
                duration: MiningAnimationConfig.energyFlow.speed,
                repeat: Infinity,
                delay: i * 0.1,
                ease: 'linear',
              }}
            />
          ))}
        </>
      )}

      {/* Rotating fans */}
      {!prefersReduced && (
        <>
          <motion.div
            className="absolute top-4 left-4 w-8 h-8"
            animate={isActive ? { rotate: 360 } : { rotate: 0 }}
            transition={{
              duration: 60 / MiningAnimationConfig.fans.rotationSpeed,
              repeat: isActive ? Infinity : 0,
              ease: 'linear',
            }}
          >
            <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
              <circle cx="16" cy="16" r="14" stroke="#00ffff" strokeWidth="2" fill="none" />
              <path d="M16 2 L16 30 M2 16 L30 16" stroke="#00ffff" strokeWidth="2" />
              <circle cx="16" cy="16" r="4" fill="#00ffff" />
            </svg>
          </motion.div>
          <motion.div
            className="absolute top-4 right-4 w-8 h-8"
            animate={isActive ? { rotate: -360 } : { rotate: 0 }}
            transition={{
              duration: 60 / MiningAnimationConfig.fans.rotationSpeed,
              repeat: isActive ? Infinity : 0,
              ease: 'linear',
            }}
          >
            <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
              <circle cx="16" cy="16" r="14" stroke="#00ffff" strokeWidth="2" fill="none" />
              <path d="M16 2 L16 30 M2 16 L30 16" stroke="#00ffff" strokeWidth="2" />
              <circle cx="16" cy="16" r="4" fill="#00ffff" />
            </svg>
          </motion.div>
        </>
      )}

      {/* LED indicators */}
      {!prefersReduced && (
        <>
          <motion.div
            className="absolute bottom-4 left-4 w-3 h-3 rounded-full"
            animate={isActive ? {
              backgroundColor: MiningAnimationConfig.led.colors,
              boxShadow: MiningAnimationConfig.led.colors.map(c => `0 0 10px ${c}`),
            } : { backgroundColor: '#333333', boxShadow: 'none' }}
            transition={{
              duration: MiningAnimationConfig.led.blinkSpeed,
              repeat: isActive ? Infinity : 0,
            }}
          />
          <motion.div
            className="absolute bottom-4 right-4 w-3 h-3 rounded-full"
            animate={isActive ? {
              backgroundColor: MiningAnimationConfig.led.colors,
              boxShadow: MiningAnimationConfig.led.colors.map(c => `0 0 10px ${c}`),
            } : { backgroundColor: '#333333', boxShadow: 'none' }}
            transition={{
              duration: MiningAnimationConfig.led.blinkSpeed,
              repeat: isActive ? Infinity : 0,
              delay: MiningAnimationConfig.led.blinkSpeed / 2,
            }}
          />
        </>
      )}

      {/* Status indicator */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12">
        <Image 
          src={isActive ? Assets.actions.collect : Assets.status.offline} 
          alt={isActive ? 'Mining' : 'Paused'} 
          width={48} 
          height={48} 
          className="object-contain"
        />
      </div>
    </div>
  );
}
