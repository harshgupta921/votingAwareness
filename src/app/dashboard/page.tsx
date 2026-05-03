'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  CheckCircle2, 
  MapPin, 
  MessageSquare, 
  Trophy, 
  ArrowRight, 
  Calendar,
  Clock,
  ExternalLink,
  Home,
  Bookmark,
  Map as MapIcon,
  Navigation
} from 'lucide-react';
import Link from 'next/link';

const DashboardPage = () => {
  const { user, userData, loading } = useAuth();
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-3xl font-bold mb-4">Please log in to view your dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Access your personalized election assistant and track your progress.</p>
        <Link 
          href="/" 
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition-all"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const voterReadiness = userData?.readinessScore?.score || 0;
  const completedSteps = userData?.checklistProgress?.filter(item => item.completed).length || 0;
  const totalSteps = 6;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);
  
  const savedLocations = userData?.savedLocations || [];
  const defaultLocation = savedLocations.find(l => l.isDefault) || savedLocations[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-indigo-500/20 shadow-lg shadow-indigo-500/10">
            <img src={user.photoURL || ''} alt="" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">
              Jai Hind, <span className="text-indigo-600 dark:text-indigo-400">{user.displayName?.split(' ')[0] || 'Voter'}</span>!
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Your personalized election command center is active.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Stats Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-8"
        >
          {/* Readiness Score */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-3xl border border-white dark:border-gray-800 p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-500/5">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-black mb-1">Voter Readiness</h2>
                <p className="text-sm text-gray-500 font-medium tracking-wide uppercase">Election Preparedness Level</p>
              </div>
              <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-5 py-2.5 rounded-2xl font-black text-xl border border-indigo-100 dark:border-indigo-800/50">
                <Trophy className="w-6 h-6 text-indigo-500" />
                <span>{voterReadiness}</span>
                <span className="text-xs text-indigo-400/70 dark:text-indigo-500/70 font-bold ml-1">/ 100</span>
              </div>
            </div>

            <div className="relative h-5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-10 shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${voterReadiness}%` }}
                transition={{ duration: 1.5, ease: "circOut" }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-gray-50/50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 group hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="text-3xl font-black">{progressPercentage}%</div>
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Checklist Progress</div>
                  </div>
                </div>
                <Link href="/checklist" className="text-indigo-600 dark:text-indigo-400 text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                  Finish remaining tasks <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-gray-50/50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 group hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                    <MapPin className="w-7 h-7" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-lg font-black truncate max-w-[150px]">
                      {defaultLocation?.label || 'Not Set'}
                    </div>
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Primary Location</div>
                  </div>
                </div>
                <Link href="/map" className="text-indigo-600 dark:text-indigo-400 text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                  Navigate on map <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Saved Locations Summary */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-3xl border border-white dark:border-gray-800 p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-500/5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black flex items-center gap-3">
                <Bookmark className="w-6 h-6 text-indigo-500" />
                Saved Locations
              </h3>
              <Link href="/map" className="text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:underline">
                Manage All
              </Link>
            </div>

            {savedLocations.length === 0 ? (
              <div className="p-10 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
                <Bookmark className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No locations saved yet. Save your home or booth for quick access.</p>
                <Link href="/map" className="mt-4 inline-flex items-center gap-2 text-indigo-600 font-bold group">
                  Open Map <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedLocations.slice(0, 4).map(loc => (
                  <div key={loc.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 flex flex-col gap-3 group hover:border-indigo-200 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-sm text-indigo-500">
                        {loc.type === 'home' ? <Home className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-900 dark:text-white truncate">{loc.label}</p>
                        <p className="text-[10px] text-gray-500 truncate font-medium uppercase tracking-wider">{loc.type}</p>
                      </div>
                      {loc.isDefault && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <Link 
                        href={`/map?lat=${loc.lat}&lng=${loc.lng}`}
                        className="flex-1 py-1.5 rounded-lg bg-white dark:bg-gray-800 text-[10px] font-bold text-center hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all"
                      >
                        View Map
                      </Link>
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 rounded-lg bg-indigo-600 text-white text-[10px] font-bold text-center hover:bg-indigo-700 transition-all"
                      >
                        Navigate
                      </a>
                    </div>
                  </div>
                ))}
                {savedLocations.length > 4 && (
                  <Link href="/map" className="p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center hover:bg-gray-50 transition-all">
                    <p className="text-sm font-bold text-gray-400">+{savedLocations.length - 4} more</p>
                  </Link>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* AI Assistant Promo */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group"
          >
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black mb-3 leading-tight">Need Smart Guidance?</h3>
              <p className="text-indigo-100/80 mb-8 font-medium leading-relaxed">Your AI assistant is trained on local election rules and your specific location data.</p>
              <Link 
                href="/assistant" 
                className="w-full flex items-center justify-center gap-2 bg-white text-indigo-600 py-4 rounded-2xl font-black hover:bg-indigo-50 transition-colors shadow-xl"
              >
                Ask Assistant
              </Link>
            </div>
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-white/10 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 bg-purple-500/20 rounded-full blur-[80px]"></div>
          </motion.div>

          {/* Activity Log */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-3xl border border-white dark:border-gray-800 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-500/5"
          >
            <h3 className="text-xl font-black mb-6 flex items-center gap-3">
              <Clock className="w-6 h-6 text-indigo-500" />
              Recent Flow
            </h3>
            <div className="space-y-6 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 dark:before:bg-gray-800">
              <div className="flex gap-4 relative z-10">
                <div className="w-4 h-4 rounded-full bg-indigo-500 border-4 border-white dark:border-gray-900 shadow-sm mt-1"></div>
                <div>
                  <p className="text-sm font-bold dark:text-white">Active Session Started</p>
                  <p className="text-xs text-gray-400 font-medium mt-1">Just now</p>
                </div>
              </div>
              <div className="flex gap-4 relative z-10">
                <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-900 shadow-sm mt-1"></div>
                <div>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Viewed Voter Map</p>
                  <p className="text-xs text-gray-400 font-medium mt-1">3 hours ago</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Recommended Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-16"
      >
        <h2 className="text-3xl font-black mb-8 tracking-tight">Priority Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white dark:border-gray-800 p-8 rounded-[2.5rem] hover:border-indigo-500/50 transition-all cursor-pointer group shadow-xl shadow-indigo-500/5">
            <div className="p-4 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Voter Registration</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 font-medium leading-relaxed">Verify your details in the electoral roll for the upcoming elections.</p>
            <Link href="/checklist" className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black">
              Start Verification <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white dark:border-gray-800 p-8 rounded-[2.5rem] hover:border-indigo-500/50 transition-all cursor-pointer group shadow-xl shadow-indigo-500/5">
            <div className="p-4 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
              <Navigation className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Booth Navigation</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 font-medium leading-relaxed">Save your primary location to get real-time directions to your booth.</p>
            <Link href="/map" className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black">
              Set Home Base <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white dark:border-gray-800 p-8 rounded-[2.5rem] hover:border-indigo-500/50 transition-all cursor-pointer group shadow-xl shadow-indigo-500/5">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
              <ExternalLink className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Official Resources</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 font-medium leading-relaxed">Access official ECI portals for forms and candidate declarations.</p>
            <a href="https://voters.eci.gov.in" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black">
              Visit ECI Portal <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
