'use client';

/**
 * Robot Animation
 * Walking interpolation, working animation, charging animation
 */

import { motion, useReducedMotion } from 'framer-motion';
import { RobotAnimationConfig } from '@/lib/ui/animationConfig';
import Image from 'next/image';
import { Assets } from '@/lib/assets';

interface RobotAnimationProps {
  state: 'idle' | 'walking' | 'working' | 'charging';
  className?: string;
}

export default function RobotAnimation({ state, className = '' }: RobotAnimationProps) {
  const prefersReduced = useReducedMotion();

  return (
    <div className={`relative ${className}`}>
      {/* Robot body */}
      <motion.div
        className="relative w-16 h-16"
        animate={
          state === 'walking' && !prefersReduced
            ? {
                y: [0, -RobotAnimationConfig.walking.stepHeight, 0],
              }
            : state === 'working' && !prefersReduced
            ? {
                rotate: [-5, 5, -5],
              }
            : {}
        }
        transition={
          state === 'walking' && !prefersReduced
            ? {
                duration: RobotAnimationConfig.walking.stepDuration,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : state === 'working' && !prefersReduced
            ? {
                duration: RobotAnimationConfig.working.actionDuration,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : {}
        }
      >
        {/* Robot icon */}
        <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center">
          <Image 
            src={Assets.hardware.robot} 
            alt="Robot" 
            width={48} 
            height={48} 
            className="object-contain"
          />
        </div>

        {/* Working animation - tools */}
        {state === 'working' && !prefersReduced && (
          <>
            <motion.div
              className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8"
              animate={{
                rotate: [0, -45, 0],
              }}
              transition={{
                duration: RobotAnimationConfig.working.actionDuration / 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Image 
                src={Assets.actions.repair} 
                alt="Repair" 
                width={32} 
                height={32} 
                className="object-contain"
              />
            </motion.div>
            <motion.div
              className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8"
              animate={{
                rotate: [0, 45, 0],
              }}
              transition={{
                duration: RobotAnimationConfig.working.actionDuration / 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: RobotAnimationConfig.working.actionDuration / 4,
              }}
            >
              <Image 
                src={Assets.actions.upgrade} 
                alt="Upgrade" 
                width={32} 
                height={32} 
                className="object-contain"
              />
            </motion.div>
          </>
        )}

        {/* Charging animation - energy particles */}
        {state === 'charging' && !prefersReduced && (
          <>
            <motion.div
              className="absolute inset-0 rounded-lg"
              animate={{
                boxShadow: [
                  `0 0 ${RobotAnimationConfig.charging.glowIntensity * 10}px rgba(0, 255, 255, ${RobotAnimationConfig.charging.glowIntensity})`,
                  `0 0 ${RobotAnimationConfig.charging.glowIntensity * 30}px rgba(0, 255, 255, ${RobotAnimationConfig.charging.glowIntensity * 1.5})`,
                  `0 0 ${RobotAnimationConfig.charging.glowIntensity * 10}px rgba(0, 255, 255, ${RobotAnimationConfig.charging.glowIntensity})`,
                ],
              }}
              transition={{
                duration: RobotAnimationConfig.charging.pulseSpeed,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-cyan-400"
                style={{
                  left: `${25 + i * 25}%`,
                  top: '50%',
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: RobotAnimationConfig.charging.pulseSpeed,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </>
        )}
      </motion.div>

      {/* Walking animation - legs */}
      {state === 'walking' && !prefersReduced && (
        <>
          <motion.div
            className="absolute -bottom-4 left-2 w-3 h-6 bg-gray-600 rounded"
            animate={{
              rotate: [-30, 30, -30],
            }}
            transition={{
              duration: RobotAnimationConfig.walking.stepDuration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute -bottom-4 right-2 w-3 h-6 bg-gray-600 rounded"
            animate={{
              rotate: [30, -30, 30],
            }}
            transition={{
              duration: RobotAnimationConfig.walking.stepDuration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </>
      )}

      {/* State indicator */}
      <motion.div
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs"
        style={{
          backgroundColor:
            state === 'idle' ? '#888888' :
            state === 'walking' ? '#00ff00' :
            state === 'working' ? '#ffaa00' :
            state === 'charging' ? '#00ffff' : '#888888',
        }}
        animate={
          state === 'charging' && !prefersReduced
            ? {
                scale: [1, 1.2, 1],
              }
            : {}
        }
        transition={
          state === 'charging' && !prefersReduced
            ? {
                duration: RobotAnimationConfig.charging.pulseSpeed,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : {}
        }
      >
        {state === 'idle' ? (
          <Image src={Assets.status.offline} alt="Idle" width={16} height={16} className="object-contain" />
        ) : state === 'walking' ? (
          <Image src={Assets.status.online} alt="Walking" width={16} height={16} className="object-contain" />
        ) : state === 'working' ? (
          <Image src={Assets.status.loading} alt="Working" width={16} height={16} className="object-contain" />
        ) : state === 'charging' ? (
          <Image src={Assets.status.loading} alt="Charging" width={16} height={16} className="object-contain" />
        ) : (
          '?'
        )}
      </motion.div>
    </div>
  );
}
