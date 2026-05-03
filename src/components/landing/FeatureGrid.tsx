'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Bot, MapPin, Calendar, CheckSquare, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function FeatureGrid() {
  const { t } = useLanguage();

  const features = [
    {
      title: t('features.assistant.title'),
      description: t('features.assistant.desc'),
      icon: <Bot className="w-10 h-10 text-indigo-500" />,
      href: '/assistant',
      gradient: 'from-indigo-500/20 to-blue-500/20',
      accent: 'bg-indigo-500'
    },
    {
      title: t('features.timeline.title'),
      description: t('features.timeline.desc'),
      icon: <Calendar className="w-10 h-10 text-emerald-500" />,
      href: '/timeline',
      gradient: 'from-emerald-500/20 to-teal-500/20',
      accent: 'bg-emerald-500'
    },
    {
      title: t('features.checklist.title'),
      description: t('features.checklist.desc'),
      icon: <CheckSquare className="w-10 h-10 text-orange-500" />,
      href: '/checklist',
      gradient: 'from-orange-500/20 to-amber-500/20',
      accent: 'bg-orange-500'
    },
    {
      title: t('features.map.title'),
      description: t('features.map.desc'),
      icon: <MapPin className="w-10 h-10 text-rose-500" />,
      href: '/map',
      gradient: 'from-rose-500/20 to-pink-500/20',
      accent: 'bg-rose-500'
    }
  ];

  return (
    <section className="py-32 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-black tracking-[0.2em] uppercase mb-6"
          >
            Capabilities
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl lg:text-7xl font-black text-gray-900 dark:text-white mb-8 tracking-tighter"
          >
            {t('features.section.title')}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto font-medium"
          >
            {t('features.section.subtitle')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              whileHover={{ y: -15, scale: 1.02 }}
              className="group relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-[3rem] blur-3xl`} />
              
              <div className="relative h-full bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl border border-white/50 dark:border-gray-800/50 rounded-[3rem] p-10 shadow-2xl transition-all duration-500 group-hover:border-indigo-500/30">
                <div className="flex justify-between items-start mb-10">
                  <div className="w-20 h-20 inline-flex items-center justify-center rounded-[2rem] bg-white dark:bg-gray-800 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    {feature.icon}
                  </div>
                  <div className={`w-3 h-3 rounded-full ${feature.accent} animate-pulse shadow-[0_0_15px_rgba(0,0,0,0.1)]`} />
                </div>

                <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-10 font-bold leading-relaxed text-lg">
                  {feature.description}
                </p>
                
                <Link
                  href={feature.href}
                  className="flex items-center gap-3 text-sm font-black text-indigo-600 dark:text-indigo-400 group/link"
                >
                  <span className="relative uppercase tracking-widest">
                    {t('explore')}
                    <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-indigo-600/30 dark:bg-indigo-400/30" />
                    <motion.div 
                      className="absolute -bottom-1 left-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
                      initial={{ width: 0 }}
                      whileHover={{ width: '100%' }}
                    />
                  </span>
                  <div className="p-2 rounded-full bg-indigo-500/10 group-hover/link:bg-indigo-500 group-hover/link:text-white transition-all duration-300">
                    <ArrowRight className="w-5 h-5 group-hover/link:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
