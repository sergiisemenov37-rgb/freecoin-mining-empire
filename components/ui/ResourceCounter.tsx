'use client';

/**
 * Resource Counter
 * Smooth counting animation, income popup, floating numbers
 */

import { motion, useReducedMotion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { ResourceCounterConfig, createTransition } from '@/lib/ui/animationConfig';
import Image from 'next/image';
import { AssetManager } from '@/lib/assets/AssetManager';

interface ResourceCounterProps {
  value: number;
  previousValue?: number;
  showPopup?: boolean;
  popupValue?: number;
  className?: string;
}

interface FloatingNumber {
  id: number;
  value: number;
  x: number;
  y: number;
}

export default function ResourceCounter({
  value,
  previousValue = 0,
  showPopup = false,
  popupValue = 0,
  className = '',
}: ResourceCounterProps) {
  const prefersReduced = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(previousValue);
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Smooth counting animation
  useEffect(() => {
    if (prefersReduced) {
      setDisplayValue(value);
      return;
    }

    const duration = ResourceCounterConfig.counting.duration * 1000;
    const startTime = Date.now();
    const startValue = displayValue;
    const endValue = value;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (easeOut)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = startValue + (endValue - startValue) * easedProgress;
      setDisplayValue(Math.round(currentValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, displayValue, prefersReduced]);

  // Floating numbers on value change
  useEffect(() => {
    if (prefersReduced || value === previousValue) return;

    const diff = value - previousValue;
    if (diff === 0) return;

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    const newFloatingNumber: FloatingNumber = {
      id: Date.now(),
      value: diff,
      x: rect.width / 2,
      y: rect.height / 2,
    };

    setFloatingNumbers(prev => [...prev, newFloatingNumber]);

    setTimeout(() => {
      setFloatingNumbers(prev => prev.filter(f => f.id !== newFloatingNumber.id));
    }, ResourceCounterConfig.floating.duration * 1000);
  }, [value, previousValue, prefersReduced]);

  const transition = createTransition({
    duration: ResourceCounterConfig.popup.duration,
  });

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Main counter */}
      <div className="flex items-center gap-2">
        <Image 
          src={AssetManager.resources.FREECOIN} 
          alt="FreeCoin" 
          width={24} 
          height={24} 
          className="object-contain"
        />
        <motion.span
          className="text-2xl font-bold text-white"
          animate={{
            color: value > previousValue ? '#00ff00' : value < previousValue ? '#ff0000' : '#ffffff',
          }}
          transition={transition}
        >
          {displayValue.toLocaleString()}
        </motion.span>
      </div>

      {/* Income popup */}
      <AnimatePresence>
        {showPopup && !prefersReduced && (
          <motion.div
            className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-bold text-green-400"
            initial={{ opacity: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 0],
              y: [0, -ResourceCounterConfig.popup.distance],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: ResourceCounterConfig.popup.duration,
              times: [0, 0.3, 1],
            }}
          >
            +{popupValue.toLocaleString()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating numbers */}
      <AnimatePresence>
        {floatingNumbers.map((floating) => (
          <motion.div
            key={floating.id}
            className={`absolute text-sm font-bold ${
              floating.value > 0 ? 'text-green-400' : 'text-red-400'
            }`}
            style={{
              left: floating.x,
              top: floating.y,
            }}
            initial={{ opacity: 1, y: 0, x: 0 }}
            animate={{
              opacity: 0,
              y: -ResourceCounterConfig.floating.distance,
              x: (Math.random() - 0.5) * ResourceCounterConfig.floating.spread,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: ResourceCounterConfig.floating.duration,
              ease: 'easeOut',
            }}
          >
            {floating.value > 0 ? '+' : ''}{floating.value.toLocaleString()}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
