'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { UserPlus, FileText, CheckCircle, Vote } from 'lucide-react';

export default function HowItWorks() {
  const { t } = useLanguage();

  const steps = [
    {
      title: t('how.step1.title'),
      desc: t('how.step1.desc'),
      icon: <UserPlus className="w-6 h-6" />,
      color: 'bg-blue-500'
    },
    {
      title: t('how.step2.title'),
      desc: t('how.step2.desc'),
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-purple-500'
    },
    {
      title: t('how.step3.title'),
      desc: t('how.step3.desc'),
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-pink-500'
    },
    {
      title: t('how.step4.title'),
      desc: t('how.step4.desc'),
      icon: <Vote className="w-6 h-6" />,
      color: 'bg-orange-500'
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            {t('how.title')}
          </motion.h2>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-600 to-pink-600 mx-auto rounded-full" />
        </div>

        <div className="relative">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-800 -translate-y-1/2 hidden lg:block" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.5, type: "spring" }}
                className="relative flex flex-col items-center text-center"
              >
                <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center text-white shadow-2xl mb-6 relative z-10 transform hover:rotate-12 transition-transform`}>
                  {step.icon}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center text-sm font-bold text-gray-900 dark:text-white shadow-md border border-gray-100 dark:border-gray-800">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
