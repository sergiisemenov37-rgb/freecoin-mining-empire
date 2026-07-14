'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export default function GlassCard({ children, className = '', hover = true, glow = true, onClick }: GlassCardProps) {
  return (
    <motion.div
      className={`
        relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden
        ${hover ? 'hover:bg-white/10 hover:border-white/20' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {glow && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-500"
          whileHover={{ opacity: 1 }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
