'use client';

/**
 * Animated Background
 * Moving particles, slow parallax, floating light beams, neon atmosphere
 */

import { motion, useAnimation, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { BackgroundConfig, prefersReducedMotion, createTransition } from '@/lib/ui/animationConfig';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
}

interface LightBeam {
  id: number;
  x: number;
  y: number;
  rotation: number;
}

export default function AnimatedBackground() {
  const prefersReduced = useReducedMotion();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [lightBeams, setLightBeams] = useState<LightBeam[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize particles
  useEffect(() => {
    if (prefersReduced) return;

    const config = prefersReducedMotion() 
      ? { ...BackgroundConfig, particles: { ...BackgroundConfig.particles, count: 10 } }
      : BackgroundConfig;

    const newParticles: Particle[] = [];
    for (let i = 0; i < config.particles.count; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: config.particles.minSize + Math.random() * (config.particles.maxSize - config.particles.minSize),
        speed: config.particles.minSpeed + Math.random() * (config.particles.maxSpeed - config.particles.minSpeed),
        color: config.particles.colors[Math.floor(Math.random() * config.particles.colors.length)],
      });
    }
    setParticles(newParticles);

    const newLightBeams: LightBeam[] = [];
    for (let i = 0; i < config.lightBeams.count; i++) {
      newLightBeams.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotation: Math.random() * 360,
      });
    }
    setLightBeams(newLightBeams);
  }, [prefersReduced]);

  // Track mouse position for parallax
  useEffect(() => {
    if (prefersReduced) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [prefersReduced]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
      }}
    >
      {/* Base gradient overlay */}
      <motion.div
        className="absolute inset-0"
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: BackgroundConfig.neon.pulseSpeed,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 255, 0.1) 0%, transparent 50%)',
        }}
      />

      {/* Parallax layers */}
      {!prefersReduced && (
        <>
          {/* Layer 1 - Slowest */}
          <motion.div
            className="absolute inset-0"
            animate={{
              x: (mousePosition.x - 50) * BackgroundConfig.parallax.speedMultiplier * 0.3,
              y: (mousePosition.y - 50) * BackgroundConfig.parallax.speedMultiplier * 0.3,
            }}
            transition={{ type: 'spring', stiffness: 100, damping: 30 }}
          >
            {particles.slice(0, Math.floor(particles.length / 3)).map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute rounded-full"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                  boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 3 / particle.speed,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>

          {/* Layer 2 - Medium */}
          <motion.div
            className="absolute inset-0"
            animate={{
              x: (mousePosition.x - 50) * BackgroundConfig.parallax.speedMultiplier * 0.6,
              y: (mousePosition.y - 50) * BackgroundConfig.parallax.speedMultiplier * 0.6,
            }}
            transition={{ type: 'spring', stiffness: 100, damping: 30 }}
          >
            {particles.slice(Math.floor(particles.length / 3), Math.floor(particles.length * 2 / 3)).map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute rounded-full"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                  boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.4, 0.9, 0.4],
                }}
                transition={{
                  duration: 2.5 / particle.speed,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>

          {/* Layer 3 - Fastest */}
          <motion.div
            className="absolute inset-0"
            animate={{
              x: (mousePosition.x - 50) * BackgroundConfig.parallax.speedMultiplier,
              y: (mousePosition.y - 50) * BackgroundConfig.parallax.speedMultiplier,
            }}
            transition={{ type: 'spring', stiffness: 100, damping: 30 }}
          >
            {particles.slice(Math.floor(particles.length * 2 / 3)).map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute rounded-full"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                  boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                }}
                animate={{
                  y: [0, -40, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2 / particle.speed,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>

          {/* Light beams */}
          {lightBeams.map((beam) => (
            <motion.div
              key={beam.id}
              className="absolute"
              style={{
                left: `${beam.x}%`,
                top: `${beam.y}%`,
                width: BackgroundConfig.lightBeams.width,
                height: BackgroundConfig.lightBeams.height,
                background: 'linear-gradient(180deg, transparent, rgba(0, 255, 255, 0.1), transparent)',
                transformOrigin: 'top center',
              }}
              animate={{
                rotate: beam.rotation,
                opacity: [BackgroundConfig.lightBeams.opacity, BackgroundConfig.lightBeams.opacity * 1.5, BackgroundConfig.lightBeams.opacity],
              }}
              transition={{
                rotate: {
                  duration: BackgroundConfig.lightBeams.rotationSpeed * 10,
                  repeat: Infinity,
                  ease: 'linear',
                },
                opacity: {
                  duration: BackgroundConfig.lightBeams.rotationSpeed * 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
            />
          ))}
        </>
      )}

      {/* Neon glow overlay */}
      <motion.div
        className="absolute inset-0"
        animate={{
          opacity: [BackgroundConfig.neon.glowIntensity * 0.5, BackgroundConfig.neon.glowIntensity, BackgroundConfig.neon.glowIntensity * 0.5],
        }}
        transition={{
          duration: BackgroundConfig.neon.pulseSpeed,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(255, 0, 255, 0.05) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(0, 255, 255, 0.05) 0%, transparent 50%)',
        }}
      />
    </div>
  );
}
