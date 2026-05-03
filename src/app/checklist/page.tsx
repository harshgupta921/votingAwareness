'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, ChevronRight, Award, ShieldCheck, Sparkles, User, MapPin, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { updateVoterReadiness } from '@/lib/db';

export default function ChecklistPage() {
  const { t } = useLanguage();
  const { user, userData, loading: authLoading, updateUserProgress } = useAuth();
  
  const [hasSubmittedProfile, setHasSubmittedProfile] = useState(false);
  const [profile, setProfile] = useState({ age: '', firstTime: 'yes', state: '' });
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activeStep, setActiveStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Sync with Firestore data when loaded
  useEffect(() => {
    if (userData) {
      if (userData.checklistProgress && userData.checklistProgress.length > 0) {
        setCompletedSteps(userData.checklistProgress.map(item => parseInt(item.id)));
      }
      if (userData.profile.age || userData.profile.state) {
        setHasSubmittedProfile(true);
      }
    }
  }, [userData]);

  const steps = [
    { id: 1, title: t('checklist.step1.title'), description: t('checklist.step1.desc'), details: t('checklist.step1.details') },
    { id: 2, title: t('checklist.step2.title'), description: t('checklist.step2.desc'), details: t('checklist.step2.details') },
    { id: 3, title: t('checklist.step3.title'), description: t('checklist.step3.desc'), details: t('checklist.step3.details') },
    { id: 4, title: t('checklist.step4.title'), description: t('checklist.step4.desc'), details: t('checklist.step4.details') },
    { id: 5, title: t('checklist.step5.title'), description: t('checklist.step5.desc'), details: t('checklist.step5.details') },
    { id: 6, title: t('checklist.step6.title'), description: t('checklist.step6.desc'), details: t('checklist.step6.details') }
  ];

  const toggleStep = async (id: number) => {
    const newCompletedSteps = completedSteps.includes(id) 
      ? completedSteps.filter(step => step !== id) 
      : [...completedSteps, id];
    
    setCompletedSteps(newCompletedSteps);
    
    if (user) {
      setIsSaving(true);
      const checklistProgress = newCompletedSteps.map(stepId => ({
        id: stepId.toString(),
        completed: true,
        timestamp: Date.now()
      }));
      
      const newScore = Math.round((newCompletedSteps.length / steps.length) * 100);
      
      await updateUserProgress({ checklistProgress });
      await updateVoterReadiness(user.uid, newScore);
      setIsSaving(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.age && profile.state) {
      if (user && userData) {
        setIsSaving(true);
        try {
          await updateUserProgress({
            profile: {
              ...userData.profile,
              age: profile.age,
              state: profile.state,
            }
          });
          setHasSubmittedProfile(true);
        } catch (error) {
          console.error('Failed to update profile:', error);
          alert('Failed to save profile. Please try again.');
        } finally {
          setIsSaving(false);
        }
      } else if (user && !userData) {
        // Handle case where auth exists but data hasn't loaded
        alert('Still loading your data. Please wait a moment.');
      }
    }
  };

  const progress = Math.round((completedSteps.length / steps.length) * 100);

  const getScoreColor = () => {
    if (progress < 30) return 'text-rose-500 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20';
    if (progress < 70) return 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20';
    if (progress < 100) return 'text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20';
    return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20';
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!hasSubmittedProfile) {
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
          <form onSubmit={handleProfileSubmit} className="space-y-8">
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 w-full relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl tracking-tight mb-4">
          {t('checklist.title')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          {t('checklist.subtitle')}
        </p>
      </motion.div>

      {/* Readiness Score Card */}
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
            <span>{completedSteps.length} / {steps.length} {t('checklist.completed')}</span>
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

      <div className="space-y-5">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isActive = activeStep === step.id;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-[1.5rem] transition-all duration-300 overflow-hidden border-2 cursor-pointer ${
                isActive 
                  ? 'border-indigo-400 dark:border-indigo-500 shadow-xl shadow-indigo-500/10 bg-white dark:bg-gray-900 transform scale-[1.02]' 
                  : isCompleted 
                    ? 'border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 opacity-70 hover:opacity-100'
                    : 'border-transparent dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 hover:border-indigo-200 dark:hover:border-indigo-800/50 hover:shadow-lg hover:bg-white dark:hover:bg-gray-900'
              }`}
            >
              <div 
                className="p-6 flex items-start gap-5"
                onClick={() => setActiveStep(step.id)}
              >
                <button 
                  disabled={isSaving}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStep(step.id);
                  }}
                  className="mt-1 flex-shrink-0 transition-transform hover:scale-110 disabled:opacity-50"
                >
                  {isCompleted ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${isActive ? 'border-indigo-500 text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-300 dark:border-gray-600 text-transparent'}`}>
                      <Circle className="w-4 h-4 fill-current opacity-20" />
                    </div>
                  )}
                </button>
                
                <div className="flex-1">
                  <h3 className={`text-xl font-bold tracking-tight transition-colors ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                    {step.title}
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                    {step.description}
                  </p>
                  
                  <AnimatePresence>
                    {isActive && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700">
                          <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl p-4 border border-indigo-100/50 dark:border-indigo-800/30">
                            <p className="text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed font-medium">
                              {step.details}
                            </p>
                          </div>
                          {!isCompleted && (
                            <button
                              disabled={isSaving}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStep(step.id);
                                if (step.id < steps.length) setActiveStep(step.id + 1);
                              }}
                              className="mt-5 inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-indigo-600 dark:hover:bg-indigo-400 hover:text-white shadow-md transition-all duration-300 disabled:opacity-50"
                            >
                              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : t('checklist.done')} <ChevronRight className="ml-2 w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
