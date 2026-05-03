'use client';

import { motion } from 'framer-motion';
import { Award, Loader2 } from 'lucide-react';

interface ReadinessCardProps {
  progress: number;
  completedCount: number;
  totalCount: number;
  isSaving: boolean;
  t: (key: string) => string;
}

export default function ReadinessCard({
  progress,
  completedCount,
  totalCount,
  isSaving,
  t
}: ReadinessCardProps) {
  const getScoreColor = () => {
    if (progress < 30) return 'text-rose-500 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20';
    if (progress < 70) return 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20';
    if (progress < 100) return 'text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20';
    return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-indigo-500/5 dark:shadow-none border border-white/80 dark:border-gray-800/80 p-6 sm:p-8 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 transition-colors duration-300 relative overflow-hidden"
    >
      {isSaving && (
        <div className="absolute top-2 right-4 flex items-center gap-1 text-[10px] text-indigo-500 font-bold">
          <Loader2 className="w-3 h-3 animate-spin" /> Saving...
        </div>
      )}
      <div className="flex items-center gap-5">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 shadow-inner ${getScoreColor()}`}>
          <Award className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{t('checklist.readiness')}</h2>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {progress}%
          </div>
        </div>
      </div>
      
      <div className="w-full md:w-1/2 flex flex-col gap-2">
        <div className="flex justify-between text-sm font-bold text-gray-600 dark:text-gray-300">
          <span>{t('checklist.progress')}</span>
          <span>{completedCount} / {totalCount} {t('checklist.completed')}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
          <motion.div 
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full" 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}
