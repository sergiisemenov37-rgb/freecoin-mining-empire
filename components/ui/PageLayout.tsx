import React from 'react';
import { motion } from 'framer-motion';
import AnimatedBackground from './AnimatedBackground';

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
        className={`min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 pb-24 ${className}`}
      >
        {(title || showBackButton) && (
          <div className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-lg border-b border-gray-800 px-4 py-4">
            <div className="flex items-center gap-4 max-w-lg mx-auto">
              {showBackButton && (
                <button
                  onClick={onBackClick}
                  className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                </button>
              )}
              {title && <h1 className="text-xl font-bold text-white">{title}</h1>}
            </div>
          </div>
        )}
        <div className="px-4 py-6 max-w-lg mx-auto">{children}</div>
      </motion.div>
    </>
  );
};
