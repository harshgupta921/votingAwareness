'use client';

import { motion } from 'framer-motion';
import { Sparkles, User, MapPin, Loader2, ChevronRight } from 'lucide-react';

interface ProfileFormProps {
  profile: { age: string; state: string };
  setProfile: (profile: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSaving: boolean;
  t: (key: string) => string;
}

export default function ProfileForm({
  profile,
  setProfile,
  onSubmit,
  isSaving,
  t
}: ProfileFormProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 w-full relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-bold mb-6">
          <Sparkles className="w-4 h-4" /> {t('nav.checklist')}
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl tracking-tight">
          {t('checklist.title')}
        </h1>
        <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 font-medium">
          {t('checklist.profile.title')}
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-indigo-500/5 dark:shadow-none border border-white/80 dark:border-gray-800/80 p-8 sm:p-10 transition-colors duration-300"
      >
        <form onSubmit={onSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
              <User className="w-4 h-4 text-indigo-500" /> {t('checklist.profile.age')}
            </label>
            <input
              type="number"
              required
              min="18"
              value={profile.age}
              onChange={(e) => setProfile({ ...profile, age: e.target.value })}
              className="w-full rounded-2xl border-2 border-gray-200 dark:border-gray-700 px-5 py-3.5 bg-white/50 dark:bg-gray-900/50 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-900 dark:text-white transition-all font-medium"
              placeholder={t('checklist.profile.agePlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
              <MapPin className="w-4 h-4 text-rose-500" /> {t('checklist.profile.state')}
            </label>
            <input
              type="text"
              required
              value={profile.state}
              onChange={(e) => setProfile({ ...profile, state: e.target.value })}
              className="w-full rounded-2xl border-2 border-gray-200 dark:border-gray-700 px-5 py-3.5 bg-white/50 dark:bg-gray-900/50 focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 text-gray-900 dark:text-white transition-all font-medium"
              placeholder={t('checklist.profile.statePlaceholder')}
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full flex justify-center items-center py-4 px-6 rounded-2xl shadow-xl shadow-indigo-500/30 text-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : t('checklist.profile.submit')} <ChevronRight className="ml-2 w-5 h-5" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
