import React from 'react';
import { motion } from 'framer-motion';
import AnimatedBackground from './AnimatedBackground';
import { AssetManager } from '@/lib/assets/AssetManager';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  className?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  showBackButton = false,
  onBackClick,
  className = '',
}) => {
  return (
    <>
      <AnimatedBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`min-h-screen pb-24 ${className}`}
      >
        {(title || showBackButton) && (
          <div className="sticky top-0 z-30 glass-panel border-b border-cyan-500/30 px-4 py-4">
            <div className="flex items-center gap-4 max-w-lg mx-auto">
              {showBackButton && (
                <motion.button
                  onClick={onBackClick}
                  className="p-2 -ml-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </motion.button>
              )}
              {title && (
                <motion.h1 
                  className="text-xl font-bold text-white neon-text"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {title}
                </motion.h1>
              )}
            </div>
          </div>
        )}
        <div className="px-4 py-6 max-w-lg mx-auto">{children}</div>
      </motion.div>
    </>
  );
};
