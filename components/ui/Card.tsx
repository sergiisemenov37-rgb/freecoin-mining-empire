import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, glow = true }) => {
  const baseStyles = 'bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl relative overflow-hidden';
  
  const CardComponent = onClick ? motion.div : motion.div;
  const motionProps = onClick
    ? {
        whileHover: { scale: 1.02, y: -2, borderColor: 'rgba(34, 211, 238, 0.3)' },
        whileTap: { scale: 0.98 },
        onClick,
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      }
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      };

  return (
    <CardComponent className={`${baseStyles} ${className}`} {...motionProps}>
      {glow && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500"
          whileHover={{ opacity: 1 }}
        />
      )}
      <div className="relative z-10">{children}</div>
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
