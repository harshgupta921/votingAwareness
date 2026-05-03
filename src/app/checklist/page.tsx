'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { updateVoterReadiness } from '@/lib/db';

// Sub-components
import ProfileForm from '@/components/checklist/ProfileForm';
import ReadinessCard from '@/components/checklist/ReadinessCard';
import ChecklistStepItem from '@/components/checklist/ChecklistStepItem';

/**
 * ChecklistPage helps users prepare for elections through a step-by-step process.
 * Features:
 * - User profile collection (age, state)
 * - Persistent checklist progress in Firestore
 * - Readiness score calculation
 * - Interactive step-by-step guidance
 */
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
      try {
        const checklistProgress = newCompletedSteps.map(stepId => ({
          id: stepId.toString(),
          completed: true,
          timestamp: Date.now()
        }));
        
        const newScore = Math.round((newCompletedSteps.length / steps.length) * 100);
        
        await updateUserProgress({ checklistProgress });
        await updateVoterReadiness(user.uid, newScore);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.age && profile.state && user && userData) {
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
    }
  };

  const progress = Math.round((completedSteps.length / steps.length) * 100);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!hasSubmittedProfile) {
    return (
      <ProfileForm 
        profile={profile}
        setProfile={setProfile}
        onSubmit={handleProfileSubmit}
        isSaving={isSaving}
        t={t}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 w-full relative z-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl tracking-tight mb-4">{t('checklist.title')}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">{t('checklist.subtitle')}</p>
      </motion.div>

      <ReadinessCard 
        progress={progress}
        completedCount={completedSteps.length}
        totalCount={steps.length}
        isSaving={isSaving}
        t={t}
      />

      <div className="space-y-5">
        {steps.map((step, index) => (
          <ChecklistStepItem 
            key={step.id}
            step={step}
            index={index}
            isCompleted={completedSteps.includes(step.id)}
            isActive={activeStep === step.id}
            isSaving={isSaving}
            onToggle={toggleStep}
            onActiveChange={setActiveStep}
            onNext={(id) => {
              toggleStep(id);
              if (id < steps.length) setActiveStep(id + 1);
            }}
            t={t}
          />
        ))}
      </div>
    </div>
  );
}
