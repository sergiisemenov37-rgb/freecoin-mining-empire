'use client';

import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
}

export default function AnimatedCounter({ value, duration = 1, className = '' }: AnimatedCounterProps) {
  const [current, setCurrent] = useState(0);
  const spring = useSpring(current, { duration: duration * 1000 });
  const display = useTransform(spring, (latest) => Math.round(latest));

  useEffect(() => {
    setCurrent(value);
  }, [value]);

  return (
    <motion.span className={className} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {display}
    </motion.span>
  );
}
