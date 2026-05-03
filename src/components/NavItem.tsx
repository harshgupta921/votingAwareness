'use client';

import { memo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface NavItemProps {
  href: string;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

export const NavItem = memo(({ href, label, isActive, onClick }: NavItemProps) => (
  <Link
    href={href}
    onClick={onClick}
    className={`relative px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
      isActive
        ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/30 shadow-sm border border-indigo-100/50 dark:border-indigo-800/50"
        : "text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
    }`}
    aria-current={isActive ? 'page' : undefined}
  >
    {label}
    {isActive && (
      <motion.div 
        layoutId="navIndicator"
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-t-full"
      />
    )}
  </Link>
));

NavItem.displayName = 'NavItem';
