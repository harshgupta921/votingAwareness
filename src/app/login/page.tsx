'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import PremiumButton from '@/components/ui/PremiumButton';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';

export default function LoginPage() {
  const { user, signInWithGoogle } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (user) {
      window.location.assign('/dashboard');
    }
  }, [user]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/40 dark:border-gray-800/50 shadow-2xl text-center"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-500/20">
          <ShieldCheck className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
          Welcome to VoteIndia
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-10 font-medium">
          Sign in to access your personalized election assistant, save locations, and track your progress.
        </p>

        <PremiumButton 
          onClick={signInWithGoogle}
          className="w-full py-5 flex items-center justify-center gap-3"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 bg-white rounded-full p-0.5" alt="Google" />
          Sign in with Google
        </PremiumButton>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
          <p>Secure authentication via Firebase</p>
        </div>
      </motion.div>
    </div>
  );
}
