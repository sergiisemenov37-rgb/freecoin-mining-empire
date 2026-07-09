import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  const baseStyles = 'bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-4 shadow-xl';
  
  const CardComponent = onClick ? motion.div : 'div';
  const motionProps = onClick
    ? {
        whileHover: { scale: 1.02, borderColor: 'rgba(34, 211, 238, 0.5)' },
        whileTap: { scale: 0.98 },
        onClick,
      }
    : {};

  return (
    <CardComponent className={`${baseStyles} ${className}`} {...motionProps}>
      {children}
    </CardComponent>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`mb-3 ${className}`}>{children}</div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-lg font-bold text-white ${className}`}>{children}</h3>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);
