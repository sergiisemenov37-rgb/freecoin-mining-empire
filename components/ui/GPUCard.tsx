'use client';

/**
 * GPU Card
 * Shine animation, hover lift, rotation, glow by rarity
 */

import { motion, useReducedMotion, useMotionValue, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import { GPUCardConfig, createTransition } from '@/lib/ui/animationConfig';
import Image from 'next/image';
import { AssetManager } from '@/lib/assets/AssetManager';

interface GPUCardProps {
  children: React.ReactNode;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  className?: string;
}

export default function GPUCard({ children, rarity, className = '' }: GPUCardProps) {
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [GPUCardConfig.hover.rotation, -GPUCardConfig.hover.rotation]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-GPUCardConfig.hover.rotation, GPUCardConfig.hover.rotation]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReduced || !ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  const rarityConfig = GPUCardConfig.rarity[rarity];
  const transition = createTransition({
    duration: GPUCardConfig.hover.duration,
  });

  return (
    <motion.div
      ref={ref}
      className={`
        relative rounded-xl overflow-hidden cursor-pointer
        ${className}
      `}
      style={{
        background: 'linear-gradient(135deg, rgba(30, 30, 40, 0.9), rgba(20, 20, 30, 0.9))',
        boxShadow: prefersReduced 
          ? 'none' 
          : `0 10px 40px ${rarityConfig.glow}${Math.round(rarityConfig.intensity * 255).toString(16).padStart(2, '0')}`,
        transformStyle: 'preserve-3d',
        rotateX: prefersReduced ? 0 : rotateX,
        rotateY: prefersReduced ? 0 : rotateY,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      animate={{
        y: isHovered && !prefersReduced ? -GPUCardConfig.hover.lift : 0,
      }}
      transition={transition}
    >
      {/* Shine effect */}
      {!prefersReduced && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
          }}
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: GPUCardConfig.shine.duration,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}

      {/* Rarity glow */}
      {!prefersReduced && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{
            border: `2px solid ${rarityConfig.glow}`,
            boxShadow: `0 0 ${rarityConfig.intensity * 30}px ${rarityConfig.glow}`,
          }}
          animate={{
            opacity: isHovered ? rarityConfig.intensity : rarityConfig.intensity * 0.5,
          }}
          transition={transition}
        />
      )}

      {/* Content */}
      <div className="relative z-10 p-6">
        <div className="flex items-center gap-4">
          <Image 
            src={AssetManager.hardware.GPU} 
            alt="GPU" 
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
