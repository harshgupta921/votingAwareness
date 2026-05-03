'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { UserPlus, CalendarDays, Megaphone, Vote, BarChart3, Flag } from 'lucide-react';

export default function TimelinePage() {
  const { t } = useLanguage();

  const timelineEvents = [
    {
      id: 1,
      title: t('timeline.event.1.title') || 'Voter Registration',
      date: t('timeline.event.1.date') || 'Ongoing - Stops before elections',
      description: t('timeline.event.1.desc') || 'Ensure your name is on the electoral roll. Apply via Form 6 if you are a new voter.',
      icon: <UserPlus className="w-6 h-6 text-indigo-500" />,
      color: 'border-indigo-500',
      bg: 'bg-indigo-50 dark:bg-indigo-900/30'
    },
    {
      id: 2,
      title: t('timeline.event.2.title') || 'Election Schedule Announcement',
      date: t('timeline.event.2.date') || 'Model Code of Conduct kicks in',
      description: t('timeline.event.2.desc') || 'The Election Commission of India (ECI) announces the polling dates, phases, and counting day.',
      icon: <CalendarDays className="w-6 h-6 text-purple-500" />,
      color: 'border-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/30'
    },
    {
      id: 3,
      title: t('timeline.event.3.title') || 'Campaigning Period',
      date: t('timeline.event.3.date') || 'Ends 48 hours before polling',
      description: t('timeline.event.3.desc') || 'Candidates campaign and release manifestos. Time for you to research the candidates in your constituency.',
      icon: <Megaphone className="w-6 h-6 text-orange-500" />,
      color: 'border-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-900/30'
    },
    {
      id: 4,
      title: t('timeline.event.4.title') || 'Voting Day (Polling)',
      date: t('timeline.event.4.date') || 'As per your phase/constituency',
      description: t('timeline.event.4.desc') || 'Go to your designated polling booth. Press the button against the candidate of your choice on the EVM.',
      icon: <Vote className="w-6 h-6 text-emerald-500" />,
      color: 'border-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-900/30'
    },
    {
      id: 5,
      title: t('timeline.event.5.title') || 'Counting and Results',
      date: t('timeline.event.5.date') || 'Usually 2-3 weeks after Phase 1',
      description: t('timeline.event.5.desc') || 'Votes are counted, and results are declared by the ECI.',
      icon: <BarChart3 className="w-6 h-6 text-rose-500" />,
      color: 'border-rose-500',
      bg: 'bg-rose-50 dark:bg-rose-900/30'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 w-full relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-20"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-bold mb-6">
          <Flag className="w-4 h-4" /> {t('timeline.badge')}
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl tracking-tight mb-4">
          {t('timeline.title')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 font-medium max-w-2xl mx-auto">
          {t('timeline.subtitle')}
        </p>
      </motion.div>

      <div className="relative">
        {/* Animated Vertical Line */}
        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gray-200 dark:bg-gray-800 rounded-full transform md:-translate-x-1/2 overflow-hidden">
          <motion.div 
            className="w-full bg-gradient-to-b from-indigo-500 via-purple-500 to-rose-500"
            initial={{ height: 0 }}
            animate={{ height: "100%" }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
        </div>

        <div className="space-y-16">
          {timelineEvents.map((event, index) => {
            const isEven = index % 2 === 0;
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1, type: "spring" }}
                className={`relative flex items-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                {/* Center Icon */}
                <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-2xl bg-white dark:bg-gray-900 border-2 border-indigo-500/20 dark:border-indigo-400/20 shadow-xl flex items-center justify-center z-10 hover:scale-110 hover:rotate-6 transition-all duration-300">
                  <div className={`w-12 h-12 rounded-xl ${event.bg} flex items-center justify-center`}>
                    {event.icon}
                  </div>
                </div>

                {/* Content Card */}
                <div className={`pl-20 md:pl-0 md:w-1/2 ${isEven ? 'md:pr-16 text-left md:text-right' : 'md:pl-16 text-left'}`}>
                  <motion.div 
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-xl shadow-indigo-500/5 dark:shadow-none border border-white/80 dark:border-gray-800/80 hover:shadow-2xl hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300 relative overflow-hidden group"
                  >
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${event.bg} -z-10`} />
                    
                    <div className={`flex items-center gap-3 mb-4 ${isEven ? 'md:flex-row-reverse' : 'flex-row'}`}>
                      <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-bold tracking-wide bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 shadow-sm border border-gray-200 dark:border-gray-600">
                        Phase {event.id}
                      </span>
                    </div>

                    <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white mb-2 leading-tight">
                      {event.title}
                    </h3>
                    <p className={`text-xs md:text-sm font-bold uppercase tracking-wider mb-4 ${event.color.replace('border-', 'text-')}`}>
                      {event.date}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 font-medium leading-relaxed text-sm md:text-base">
                      {event.description}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
