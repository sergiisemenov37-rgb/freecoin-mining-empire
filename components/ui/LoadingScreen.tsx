'use client';

/**
 * Loading Screen
 * Animated logo, progress bar, random gameplay tips
 */

import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { LoadingScreenConfig } from '@/lib/ui/animationConfig';
import Image from 'next/image';
import { Assets } from '@/lib/assets';

const GAMEPLAY_TIPS = [
  'Build more data centers to increase your mining power',
  'Research new technologies to unlock advanced hardware',
  'Use robots to automate your mining operations',
  'Keep your energy grid balanced for optimal performance',
  'Upgrade your hardware to mine FreeCoin faster',
  'Expand your empire by building more structures',
  'Monitor your cooling systems to prevent overheating',
  'Join forces with other players for multiplayer bonuses',
  'Complete achievements to earn special rewards',
  'Plan your research path carefully for maximum efficiency',
];

interface LoadingScreenProps {
  progress: number;
  onComplete?: () => void;
}

export default function LoadingScreen({ progress, onComplete }: LoadingScreenProps) {
  const prefersReduced = useReducedMotion();
  const [currentTip, setCurrentTip] = useState(0);
  const [showTip, setShowTip] = useState(true);

  // Cycle through tips
  useEffect(() => {
    if (prefersReduced) return;

    const interval = setInterval(() => {
      setShowTip(false);
      setTimeout(() => {
        setCurrentTip(prev => (prev + 1) % GAMEPLAY_TIPS.length);
        setShowTip(true);
      }, LoadingScreenConfig.tips.fadeDuration * 1000);
    }, LoadingScreenConfig.tips.interval);

    return () => clearInterval(interval);
  }, [prefersReduced]);

  // Trigger completion when progress reaches 100
  useEffect(() => {
    if (progress >= 100 && onComplete) {
      onComplete();
    }
  }, [progress, onComplete]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="text-center">
        {/* Animated logo */}
        <motion.div
          className="mb-8"
          animate={
            !prefersReduced
              ? {
                  rotate: 360,
                  scale: [1, 1.1, 1],
                }
              : {}
          }
          transition={
            !prefersReduced
              ? {
                  rotate: {
                    duration: 60 / LoadingScreenConfig.logo.rotationSpeed,
                    repeat: Infinity,
                    ease: 'linear',
                  },
                  scale: {
                    duration: LoadingScreenConfig.logo.pulseSpeed,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                }
              : {}
          }
        >
          <div className="w-32 h-32">
            <Image 
              src={Assets.resources.energy} 
              alt="Logo" 
              width={128} 
              height={128} 
              className="object-contain"
            />
          </div>
        </motion.div>

        {/* Game title */}
        <motion.h1
          className="text-4xl font-bold text-white mb-8"
          animate={
            !prefersReduced
              ? {
                  opacity: [0.5, 1, 0.5],
                }
              : { opacity: 1 }
          }
          transition={
            !prefersReduced
              ? {
                  duration: LoadingScreenConfig.logo.pulseSpeed,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
              : {}
          }
        >
          FreeCoin Mining Empire
        </motion.h1>

        {/* Progress bar */}
        <div className="w-80 mx-auto mb-8">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{
                duration: LoadingScreenConfig.progress.duration,
                ease: 'easeOut',
              }}
            />
          </div>
          <motion.div
            className="mt-2 text-white font-semibold"
            animate={
              !prefersReduced
                ? {
                    opacity: [0.5, 1, 0.5],
                  }
                : { opacity: 1 }
            }
            transition={
              !prefersReduced
                ? {
                    duration: LoadingScreenConfig.logo.pulseSpeed,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }
                : {}
            }
          >
            {Math.round(progress)}%
          </motion.div>
        </div>

        {/* Gameplay tips */}
        <AnimatePresence mode="wait">
          {showTip && (
            <motion.p
              key={currentTip}
              className="text-gray-400 text-sm max-w-md mx-auto px-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{
                duration: LoadingScreenConfig.tips.fadeDuration,
              }}
            >
              {GAMEPLAY_TIPS[currentTip]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
