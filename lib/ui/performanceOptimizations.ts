/**
 * Performance Optimizations
 * 60 FPS target, pause when hidden, reduced motion support
 */

import { useEffect, useRef, useState } from 'react';
import { PerformanceConfig } from './animationConfig';

/**
 * Hook to pause animations when page is hidden
 */
export function usePauseWhenHidden() {
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!PerformanceConfig.pauseWhenHidden) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause animations
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      } else {
        // Resume animations
        // This is a placeholder - actual implementation would depend on the animation system
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
}

/**
 * Hook to limit animation updates to target FPS
 */
export function useTargetFPS(targetFPS: number = PerformanceConfig.targetFPS) {
  const lastTimeRef = useRef<number>(Date.now());
  const frameInterval = 1000 / targetFPS;

  const shouldUpdate = () => {
    const now = Date.now();
    const elapsed = now - lastTimeRef.current;

    if (elapsed > frameInterval) {
      lastTimeRef.current = now - (elapsed % frameInterval);
      return true;
    }

    return false;
  };

  return { shouldUpdate };
}

/**
 * Hook to debounce rapid updates
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = PerformanceConfig.debounceMs
): T {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const debouncedCallback = ((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Hook to batch updates for better performance
 */
export function useBatchUpdates<T>(callback: (batch: T[]) => void, batchSize: number = 10) {
  const batchRef = useRef<T[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const add = (item: T) => {
    batchRef.current.push(item);

    if (batchRef.current.length >= batchSize) {
      flush();
    }
  };

  const flush = () => {
    if (batchRef.current.length > 0) {
      callback(batchRef.current);
      batchRef.current = [];
    }
  };

  useEffect(() => {
    // Flush any remaining items on unmount
    return () => {
      flush();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { add, flush };
}

/**
 * Hook to check if GPU acceleration is available
 */
export function useGPUAcceleration() {
  const [gpuAvailable, setGpuAvailable] = useState(true);

  useEffect(() => {
    if (!PerformanceConfig.useGPU) {
      setGpuAvailable(false);
      return;
    }

    // Check for GPU support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      setGpuAvailable(false);
    }
  }, []);

  return gpuAvailable;
}

/**
 * Hook to monitor actual FPS
 */
export function useFPSMonitor() {
  const [fps, setFps] = useState(60);
  const frameCountRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastTimeRef.current;
      const currentFPS = (frameCountRef.current / elapsed) * 1000;
      
      setFps(Math.round(currentFPS));
      
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }, 1000);

    const updateFrame = () => {
      frameCountRef.current++;
      requestAnimationFrame(updateFrame);
    };

    requestAnimationFrame(updateFrame);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return fps;
}

/**
 * Hook to optimize animations for low-end devices
 */
export function usePerformanceMode() {
  const [isLowEnd, setIsLowEnd] = useState(false);

  useEffect(() => {
    // Detect low-end device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as any).deviceMemory || 8;

    if (isMobile || cores < 4 || memory < 4) {
      setIsLowEnd(true);
    }
  }, []);

  return isLowEnd;
}

/**
 * Hook to respect reduced motion preferences
 */
export function useReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    if (!PerformanceConfig.respectReducedMotion) {
      setPrefersReduced(false);
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReduced(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReduced;
}

/**
 * Hook to optimize component rendering
 */
export function useRenderOptimization(shouldRender: boolean) {
  const [isVisible, setIsVisible] = useState(shouldRender);
  const observerRef = useRef<IntersectionObserver | undefined>(undefined);

  useEffect(() => {
    if (!shouldRender) return;

    const element = document.activeElement;
    if (!element) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          setIsVisible(entry.isIntersecting);
        });
      },
      {
        threshold: 0.1,
      }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [shouldRender]);

  return isVisible;
}
