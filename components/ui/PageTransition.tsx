'use client';

/**
 * Page Transitions
 * Fade, scale, slide transitions for page changes
 */

import { motion, useReducedMotion } from 'framer-motion';
import { PageTransitionConfig, createTransition } from '@/lib/ui/animationConfig';

export type TransitionType = 'fade' | 'scale' | 'slide';

interface PageTransitionProps {
  children: React.ReactNode;
  type?: TransitionType;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export default function PageTransition({
  children,
  type = 'fade',
  direction = 'right',
}: PageTransitionProps) {
  const prefersReduced = useReducedMotion();
  const transition = createTransition({
    duration: PageTransitionConfig[type].duration,
  });

  const variants = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    scale: {
      hidden: { opacity: 0, scale: PageTransitionConfig.scale.scale },
      visible: { opacity: 1, scale: 1 },
    },
    slide: {
      hidden: {
        opacity: 0,
        x: direction === 'left' ? PageTransitionConfig.slide.distance :
           direction === 'right' ? -PageTransitionConfig.slide.distance :
           direction === 'up' ? 0 : 0,
        y: direction === 'up' ? PageTransitionConfig.slide.distance :
           direction === 'down' ? -PageTransitionConfig.slide.distance :
           0,
      },
      visible: { opacity: 1, x: 0, y: 0 },
    },
  };

  return (
    <motion.div
      initial={prefersReduced ? 'visible' : 'hidden'}
      animate="visible"
      exit={prefersReduced ? 'visible' : 'hidden'}
      variants={variants[type]}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
