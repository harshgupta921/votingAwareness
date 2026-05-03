'use client';

import dynamic from 'next/dynamic';
import HeroSection from '@/components/landing/HeroSection';

const FeatureGrid = dynamic(() => import('@/components/landing/FeatureGrid'), { 
  loading: () => <div className="h-96 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-[2.5rem]" />,
  ssr: false 
});
const HowItWorks = dynamic(() => import('@/components/landing/HowItWorks'), { 
  ssr: false 
});
const StatsSection = dynamic(() => import('@/components/landing/StatsSection'), { 
  ssr: false 
});
import PremiumButton from '@/components/ui/PremiumButton';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { t } = useLanguage();
  const { user } = useAuth();
  return (
    <div className="flex flex-col flex-1 relative">
      {/* Redesigned Sections */}
      <HeroSection />
      
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <StatsSection />
        <FeatureGrid />
        <HowItWorks />
        
        {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-12 rounded-[2.5rem] bg-white/50 dark:bg-gray-900/50 backdrop-blur-3xl border border-white/20 dark:border-gray-800/50 shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6 relative z-10">
              {t('cta.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto relative z-10">
              {t('cta.desc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              {user ? (
                <Link href="/dashboard">
                  <PremiumButton variant="primary" size="lg">
                    Go to Dashboard
                  </PremiumButton>
                </Link>
              ) : (
                <Link href="/login">
                  <PremiumButton variant="primary" size="lg">
                    {t('cta.reg')}
                  </PremiumButton>
                </Link>
              )}
              <Link href="/timeline">
                <PremiumButton variant="outline" size="lg">
                  {t('cta.learn')}
                </PremiumButton>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      </motion.div>
    </div>
  );
}
