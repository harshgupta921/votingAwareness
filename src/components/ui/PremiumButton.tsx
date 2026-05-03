'use client';

import { useState, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Ripple {
  x: number;
  y: number;
  id: number;
}

interface PremiumButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export default function PremiumButton({ 
  children, 
  className = '', 
  onClick, 
  variant = 'primary',
  size = 'md' 
}: PremiumButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const addRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, id }]);
  };

  const removeRipple = (id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-800 hover:border-indigo-500/50';
      case 'outline':
        return 'bg-transparent border-2 border-white/20 text-white hover:bg-white/10';
      default:
        return 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/30';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm': return 'px-4 py-2 text-sm';
      case 'lg': return 'px-8 py-4 text-lg';
      default: return 'px-6 py-3 text-base';
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={(e) => {
        addRipple(e);
        onClick?.();
      }}
      className={`relative overflow-hidden rounded-2xl font-bold transition-all duration-300 ${getVariantStyles()} ${getSizeStyles()} ${className}`}
    >
      <span className="relative z-10">{children}</span>
      
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            onAnimationComplete={() => removeRipple(ripple.id)}
            className="absolute bg-white/30 rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 20,
              height: 20,
              marginLeft: -10,
              marginTop: -10,
            }}
          />
        ))}
      </AnimatePresence>
    </motion.button>
  );
}
