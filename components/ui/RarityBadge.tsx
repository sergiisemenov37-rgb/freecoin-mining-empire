'use client';

import { motion } from 'framer-motion';

type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

interface RarityBadgeProps {
  rarity: Rarity;
  children: React.ReactNode;
  className?: string;
}

const rarityConfig = {
  common: {
    color: 'from-gray-400 to-gray-600',
    glow: 'shadow-gray-500/50',
    border: 'border-gray-400',
    text: 'text-gray-400',
  },
  uncommon: {
    color: 'from-green-400 to-green-600',
    glow: 'shadow-green-500/50',
    border: 'border-green-400',
    text: 'text-green-400',
  },
  rare: {
    color: 'from-blue-400 to-blue-600',
    glow: 'shadow-blue-500/50',
    border: 'border-blue-400',
    text: 'text-blue-400',
  },
  epic: {
    color: 'from-purple-400 to-purple-600',
    glow: 'shadow-purple-500/50',
    border: 'border-purple-400',
    text: 'text-purple-400',
  },
  legendary: {
    color: 'from-yellow-400 to-orange-500',
    glow: 'shadow-yellow-500/50',
    border: 'border-yellow-400',
    text: 'text-yellow-400',
  },
};

export default function RarityBadge({ rarity, children, className = '' }: RarityBadgeProps) {
  const config = rarityConfig[rarity];

  return (
    <motion.div
      className={`
        relative px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
        bg-gradient-to-r ${config.color} ${config.text}
        border ${config.border}
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      animate={{
        boxShadow: [
          `0 0 10px ${config.glow.split('/')[0]}`,
          `0 0 20px ${config.glow.split('/')[0]}`,
          `0 0 10px ${config.glow.split('/')[0]}`,
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}
