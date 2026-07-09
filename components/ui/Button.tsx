import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import Image from 'next/image';
import { Assets } from '@/lib/assets';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'whileTap' | 'whileHover'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
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
  const baseStyles = 'font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden';
  
  const variants = {
    primary: 'text-white',
    secondary: 'text-gray-100',
    ghost: 'text-gray-300',
    danger: 'text-white',
  };
  
  const buttonImages = {
    primary: Assets.buttons.primary,
    secondary: Assets.buttons.secondary,
    ghost: Assets.buttons.secondary,
    danger: Assets.buttons.danger,
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      style={{
        backgroundImage: `url(${buttonImages[variant]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <Image 
            src={Assets.status.loading} 
            alt="Loading" 
            width={20} 
            height={20} 
            className="animate-spin mr-2"
          />
          Loading...
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
};
