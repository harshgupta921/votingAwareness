'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowRight, Bot, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PremiumButton from '@/components/ui/PremiumButton';
import { useAuth } from '@/contexts/AuthContext';

export default function HeroSection() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const titleWords = t('hero.title').split(',');
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Advanced Welcome Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-white/50 dark:border-gray-800/50 text-gray-900 dark:text-white mb-12 shadow-2xl group cursor-default"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-sm rounded-full animate-pulse opacity-50" />
            <Sparkles className="w-5 h-5 text-indigo-500 relative z-10" />
          </div>
          <span className="text-sm font-black tracking-widest uppercase">
            {user ? (
              <span className="flex items-center gap-2">
                WELCOME BACK, <span className="text-indigo-600 dark:text-indigo-400">{user.displayName?.toUpperCase()}</span>
              </span>
            ) : (
              t('hero.badge')
            )}
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
        </motion.div>

        {/* Staggered Heading */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative"
        >
          <motion.h1 className="text-7xl sm:text-8xl lg:text-9xl font-black tracking-tight text-gray-900 dark:text-white leading-[0.95] mb-10">
            <motion.span variants={item} className="inline-block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent pb-4">
              {titleWords[0]}
            </motion.span>
            <br />
            <motion.span variants={item} className="inline-block relative">
              {titleWords[1] || ''}
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 1.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute -bottom-4 left-0 h-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-full opacity-30 blur-[1px]"
              />
            </motion.span>
          </motion.h1>

          <motion.div variants={item} className="max-w-3xl mx-auto">
            <p className="text-2xl sm:text-3xl text-gray-600 dark:text-gray-400 font-bold leading-tight tracking-tight">
              {t('hero.subtitle')}
            </p>
          </motion.div>
        </motion.div>
        
        {/* Action Group */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-16 flex flex-col sm:flex-row justify-center items-center gap-8"
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-[22px] blur-xl opacity-20 group-hover:opacity-60 transition duration-500" />
            <Link href="/assistant">
              <PremiumButton 
                className="w-full sm:w-auto relative px-12 py-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 border border-white/10 rounded-[20px] shadow-2xl"
              >
                <span className="flex items-center gap-3 text-lg">
                  <Bot className="w-7 h-7" />
                  {t('hero.cta2')}
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
              </PremiumButton>
            </Link>
          </div>

          <Link href={user ? "/dashboard" : "/login"}>
            <PremiumButton 
              variant="secondary"
              className="w-full sm:w-auto px-12 py-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl border-white/40 dark:border-gray-800/40 rounded-[20px] text-lg hover:shadow-indigo-500/10 shadow-xl transition-all duration-500"
            >
              {user ? "Go to Dashboard" : "Register Now"}
            </PremiumButton>
          </Link>
        </motion.div>

        {/* Floating Features Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="mt-24 pt-8 border-t border-gray-200/50 dark:border-gray-800/50 max-w-4xl mx-auto flex flex-wrap justify-center gap-12"
        >
          {['AI Guidance', 'Live Maps', 'Checklist', 'Multilingual'].map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              <div className="w-1 h-1 rounded-full bg-indigo-500" />
              {feature}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
