'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function CursorGlow() {
  const [mounted, setMounted] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  if (!mounted) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none z-[-1] opacity-40 dark:opacity-20 blur-[100px]"
      style={{
        x: springX,
        y: springY,
        translateX: '-50%',
        translateY: '-50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(168, 85, 247, 0.2) 50%, transparent 100%)',
      }}
    />
  );
}
