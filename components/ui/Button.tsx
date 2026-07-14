import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import Image from 'next/image';
import { AssetManager } from '@/lib/assets/AssetManager';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'whileTap' | 'whileHover'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden flex items-center justify-center';
  
  const variants = {
    primary: 'text-white',
    secondary: 'text-gray-100',
    ghost: 'text-gray-300',
    danger: 'text-white',
    success: 'text-white',
    warning: 'text-white',
  };
  
  const buttonImages = {
    primary: '/assets/buttons/button_primary.png',
    secondary: '/assets/buttons/button_secondary.png',
    ghost: '/assets/buttons/button_secondary.png',
    danger: '/assets/buttons/button_danger.png',
    success: '/assets/buttons/button_success.png',
    warning: '/assets/buttons/button_warning.png',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm min-h-[36px]',
    md: 'px-6 py-3 text-base min-h-[44px]',
    lg: 'px-8 py-4 text-lg min-h-[52px]',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      whileFocus={{ scale: 1.02 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      style={{
        backgroundImage: `url(${buttonImages[variant]})`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <Image 
            src={AssetManager.status.loading} 
            alt="Loading" 
            width={20} 
            height={20} 
            className="animate-spin"
          />
          Loading...
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
};
