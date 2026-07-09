import React from 'react';
import { motion } from 'framer-motion';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'cyan' | 'green' | 'white';
}

export const Loader: React.FC<LoaderProps> = ({ size = 'md', color = 'cyan' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const colors = {
    cyan: 'border-cyan-500 border-t-transparent',
    green: 'border-green-500 border-t-transparent',
    white: 'border-white border-t-transparent',
  };

  return (
    <div className="flex items-center justify-center">
      <motion.div
        className={`rounded-full ${sizes[size]} ${colors[color]}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
};

export const PageLoader: React.FC = () => (
  <div className="fixed inset-0 bg-gray-950 flex items-center justify-center z-50">
    <Loader size="lg" color="cyan" />
  </div>
);
