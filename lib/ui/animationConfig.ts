/**
 * Animation Configuration System
 * Centralized configuration for all animations
 * Everything configurable, no hardcoded values
 */

import { Transition, Variants as FramerVariants } from 'framer-motion';

// ============================================
// ANIMATION PRESETS
// ============================================

export const Easing = {
  linear: [0, 0, 1, 1] as const,
  easeIn: [0.42, 0, 1, 1] as const,
  easeOut: [0, 0, 0.58, 1] as const,
  easeInOut: [0.42, 0, 0.58, 1] as const,
  circIn: [0.6, 0.04, 0.98, 0.335] as const,
  circOut: [0.075, 0.82, 0.165, 1] as const,
  circInOut: [0.785, 0.135, 0.15, 0.86] as const,
  backIn: [0.6, -0.28, 0.735, 0.045] as const,
  backOut: [0.175, 0.885, 0.32, 1.275] as const,
  backInOut: [0.68, -0.55, 0.265, 1.55] as const,
  elastic: (x: number) => x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1,
};

// ============================================
// DURATION CONFIGURATION
// ============================================

export const Duration = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8,
  verySlow: 1.2,
};

// ============================================
// TRANSITION CONFIGURATION
// ============================================

export const Transitions: Record<string, Transition> = {
  instant: { duration: Duration.instant },
  fast: { duration: Duration.fast },
  normal: { duration: Duration.normal },
  slow: { duration: Duration.slow },
  slower: { duration: Duration.slower },
  verySlow: { duration: Duration.verySlow },
  easeIn: { duration: Duration.normal, ease: Easing.easeIn },
  easeOut: { duration: Duration.normal, ease: Easing.easeOut },
  easeInOut: { duration: Duration.normal, ease: Easing.easeInOut },
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  springSoft: { type: 'spring', stiffness: 150, damping: 20 },
  springStiff: { type: 'spring', stiffness: 500, damping: 40 },
};

// ============================================
// VARIANTS CONFIGURATION
// ============================================

export const Variants: Record<string, FramerVariants> = {
  // Fade variants
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  fadeOut: {
    hidden: { opacity: 1 },
    visible: { opacity: 0 },
  },
  
  // Scale variants
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  },
  scaleOut: {
    hidden: { opacity: 1, scale: 1 },
    visible: { opacity: 0, scale: 0.8 },
  },
  
  // Slide variants
  slideInLeft: {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  },
  slideInRight: {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
  },
  slideInUp: {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  },
  slideInDown: {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
  },
  
  // Rotate variants
  rotateIn: {
    hidden: { opacity: 0, rotate: -180 },
    visible: { opacity: 1, rotate: 0 },
  },
  
  // Flip variants
  flipIn: {
    hidden: { opacity: 0, rotateY: -90 },
    visible: { opacity: 1, rotateY: 0 },
  },
  
  // Pulse variants
  pulse: {
    hidden: { scale: 1 },
    visible: { scale: [1, 1.05, 1] },
  },
  
  // Shake variants
  shake: {
    hidden: { x: 0 },
    visible: { x: [0, -10, 10, -10, 10, 0] },
  },
  
  // Bounce variants
  bounce: {
    hidden: { y: 0 },
    visible: { y: [0, -30, 0] },
  },
};

// ============================================
// BACKGROUND CONFIGURATION
// ============================================

export const BackgroundConfig = {
  particles: {
    count: 50,
    minSize: 2,
    maxSize: 6,
    minSpeed: 0.2,
    maxSpeed: 0.8,
    colors: ['#00ffff', '#ff00ff', '#00ff00', '#ffff00'],
  },
  parallax: {
    layers: 3,
    speedMultiplier: 0.5,
  },
  lightBeams: {
    count: 5,
    width: 100,
    height: 400,
    opacity: 0.1,
    rotationSpeed: 0.5,
  },
  neon: {
    glowIntensity: 0.5,
    pulseSpeed: 2,
  },
};

// ============================================
// BUTTON CONFIGURATION
// ============================================

export const ButtonConfig = {
  hover: {
    scale: 1.05,
    glowIntensity: 0.3,
    duration: Duration.fast,
  },
  click: {
    scale: 0.95,
    duration: Duration.instant,
  },
  ripple: {
    duration: Duration.normal,
    size: 200,
  },
  disabled: {
    opacity: 0.5,
    scale: 1,
  },
  success: {
    flashDuration: Duration.fast,
    flashCount: 2,
  },
};

// ============================================
// PANEL CONFIGURATION
// ============================================

export const PanelConfig = {
  glassmorphism: {
    blur: 10,
    opacity: 0.1,
    saturation: 180,
  },
  neonBorder: {
    width: 2,
    glowIntensity: 0.5,
    pulseSpeed: 3,
  },
  shadow: {
    blur: 20,
    spread: 5,
    opacity: 0.3,
  },
  gradient: {
    angle: 45,
    speed: 10,
  },
};

// ============================================
// GPU CARD CONFIGURATION
// ============================================

export const GPUCardConfig = {
  shine: {
    duration: Duration.slow,
    intensity: 0.5,
  },
  hover: {
    lift: 10,
    rotation: 5,
    duration: Duration.normal,
  },
  rarity: {
    common: { glow: '#ffffff', intensity: 0.3 },
    uncommon: { glow: '#00ff00', intensity: 0.5 },
    rare: { glow: '#0088ff', intensity: 0.7 },
    epic: { glow: '#aa00ff', intensity: 0.9 },
    legendary: { glow: '#ffaa00', intensity: 1.0 },
  },
};

// ============================================
// BUILDING CARD CONFIGURATION
// ============================================

export const BuildingCardConfig = {
  pulse: {
    duration: Duration.slower,
    scale: 1.02,
  },
  locked: {
    opacity: 0.5,
    grayscale: 1,
  },
  unlock: {
    duration: Duration.normal,
    scale: 1.1,
    flashCount: 3,
  },
};

// ============================================
// RESOURCE COUNTER CONFIGURATION
// ============================================

export const ResourceCounterConfig = {
  counting: {
    duration: Duration.normal,
    ease: Easing.easeOut,
  },
  popup: {
    duration: Duration.slow,
    distance: 50,
    fade: true,
  },
  floating: {
    duration: Duration.slower,
    distance: 100,
    spread: 20,
  },
};

// ============================================
// MINING ANIMATION CONFIGURATION
// ============================================

export const MiningAnimationConfig = {
  beam: {
    width: 50,
    opacity: 0.5,
    pulseSpeed: 1,
  },
  energyFlow: {
    speed: 2,
    particleCount: 20,
  },
  fans: {
    rotationSpeed: 5,
  },
  led: {
    blinkSpeed: 0.5,
    colors: ['#00ff00', '#ffff00', '#ff0000'],
  },
};

// ============================================
// ROBOT ANIMATION CONFIGURATION
// ============================================

export const RobotAnimationConfig = {
  walking: {
    stepDuration: 0.5,
    stepHeight: 5,
  },
  working: {
    actionDuration: 1,
    intensity: 10,
  },
  charging: {
    pulseSpeed: 1,
    glowIntensity: 0.5,
  },
};

// ============================================
// NOTIFICATION CONFIGURATION
// ============================================

export const NotificationConfig = {
  slide: {
    distance: 100,
    duration: Duration.normal,
  },
  types: {
    success: {
      color: '#00ff00',
      icon: '/assets/status/success.png',
      duration: 3000,
    },
    warning: {
      color: '#ffaa00',
      icon: '/assets/status/warning.png',
      duration: 4000,
    },
    error: {
      color: '#ff0000',
      icon: '/assets/status/error.png',
      duration: 5000,
    },
    reward: {
      color: '#ff00ff',
      icon: '/assets/resources/FREECOIN.png',
      duration: 4000,
    },
  },
};

// ============================================
// PAGE TRANSITION CONFIGURATION
// ============================================

export const PageTransitionConfig = {
  fade: {
    duration: Duration.normal,
  },
  scale: {
    duration: Duration.normal,
    scale: 0.95,
  },
  slide: {
    duration: Duration.normal,
    distance: 50,
  },
};

// ============================================
// LOADING SCREEN CONFIGURATION
// ============================================

export const LoadingScreenConfig = {
  logo: {
    pulseSpeed: 2,
    rotationSpeed: 10,
  },
  progress: {
    duration: Duration.slower,
  },
  tips: {
    interval: 5000,
    fadeDuration: Duration.normal,
  },
};

// ============================================
// PERFORMANCE CONFIGURATION
// ============================================

export const PerformanceConfig = {
  targetFPS: 60,
  pauseWhenHidden: true,
  respectReducedMotion: true,
  useGPU: true,
  batchUpdates: true,
  debounceMs: 16, // ~60fps
};

// ============================================
// MAIN CONFIGURATION
// ============================================

export const AnimationConfig = {
  easing: Easing,
  duration: Duration,
  transitions: Transitions,
  variants: Variants,
  background: BackgroundConfig,
  button: ButtonConfig,
  panel: PanelConfig,
  gpuCard: GPUCardConfig,
  buildingCard: BuildingCardConfig,
  resourceCounter: ResourceCounterConfig,
  mining: MiningAnimationConfig,
  robot: RobotAnimationConfig,
  notification: NotificationConfig,
  pageTransition: PageTransitionConfig,
  loadingScreen: LoadingScreenConfig,
  performance: PerformanceConfig,
};

// ============================================
// REDUCED MOTION CONFIGURATION
// ============================================

export const ReducedMotionConfig = {
  duration: Duration.instant,
  transitions: {
    instant: Transitions.instant,
  },
  background: {
    ...BackgroundConfig,
    particles: {
      ...BackgroundConfig.particles,
      count: 10,
      minSpeed: 0.1,
      maxSpeed: 0.2,
    },
  },
  button: {
    ...ButtonConfig,
    hover: {
      ...ButtonConfig.hover,
      scale: 1,
    },
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get appropriate configuration based on reduced motion preference
 */
export function getConfig<T>(normal: T, reduced: T): T {
  return prefersReducedMotion() ? reduced : normal;
}

/**
 * Create transition with reduced motion support
 */
export function createTransition(transition: Transition): Transition {
  if (prefersReducedMotion()) {
    return Transitions.instant;
  }
  return transition;
}

/**
 * Create variants with reduced motion support
 */
export function createVariants(variants: FramerVariants): FramerVariants {
  if (prefersReducedMotion()) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    };
  }
  return variants;
}
