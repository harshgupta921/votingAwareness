'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

export default function StatsSection() {
  const { t } = useLanguage();
  const stats = [
    { label: t('stats.voters.label'), value: t('stats.voters.value'), color: 'from-blue-600 to-indigo-600' },
    { label: t('stats.stations.label'), value: t('stats.stations.value'), color: 'from-indigo-600 to-purple-600' },
    { label: t('stats.queries.label'), value: t('stats.queries.value'), color: 'from-purple-600 to-pink-600' },
    { label: t('stats.languages.label'), value: t('stats.languages.value'), color: 'from-pink-600 to-rose-600' },
  ];

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-white/40 dark:bg-gray-900/40 backdrop-blur-3xl rounded-[3rem] border border-white/50 dark:border-gray-800/50 p-12 lg:p-20 shadow-2xl overflow-hidden">
          {/* Animated Background Glow */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-indigo-500/5 blur-[120px] animate-pulse" />
            <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-pink-500/5 blur-[120px] animate-pulse" />
          </div>

          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                className="text-center group"
              >
                <div className="relative inline-block mb-4">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                    className={`text-5xl lg:text-7xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent tracking-tighter`}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </div>
                <div className="text-xs lg:text-sm font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 group-hover:text-indigo-500 transition-colors duration-300">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
