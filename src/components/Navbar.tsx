'use client';

import Link from 'next/link';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Globe, Menu, X, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { NavItem } from './NavItem';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const { user, signInWithGoogle, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setIsScrolled(latest > 20);
    });
  }, [scrollY]);

  const navItems = [
    { href: '/', label: t('nav.home') },
    { href: '/assistant', label: t('nav.assistant') },
    { href: '/timeline', label: t('nav.timeline') },
    { href: '/quiz', label: t('nav.quiz') },
    { href: '/checklist', label: t('nav.checklist') },
    { href: '/map', label: t('nav.map') },
  ];

  const displayNavItems = user 
    ? [{ href: '/dashboard', label: 'Dashboard' }, ...navItems]
    : navItems;

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "py-3" : "py-5"
      }`}
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`relative flex items-center justify-between h-16 rounded-[2rem] px-6 transition-all duration-500 ${
          isScrolled 
            ? "bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/40 dark:border-gray-800/50 shadow-xl shadow-indigo-500/5" 
            : "bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border border-white/20 dark:border-gray-800/30 shadow-lg"
        }`}>
          
          <div className="absolute inset-0 rounded-[2rem] overflow-hidden -z-10 pointer-events-none">
            <div className="absolute -left-10 -top-10 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/20 blur-2xl rounded-full" />
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/20 blur-2xl rounded-full" />
          </div>

          <div className="flex-shrink-0 flex items-center z-10">
            <Link href="/" className="flex items-center gap-2 group" aria-label="VoteIndia Home">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent tracking-tight">
                VoteIndia
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex md:items-center md:space-x-1 z-10">
            {displayNavItems.map((item) => (
              <NavItem 
                key={item.href}
                href={item.href}
                label={item.label}
                isActive={pathname === item.href}
              />
            ))}
            
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />

            <div className="relative group mx-2">
              <button 
                className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer p-2 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                aria-haspopup="true"
                aria-expanded="false"
                aria-label={`Current language: ${language}`}
              >
                <Globe className="w-5 h-5" />
                <span className="text-sm font-bold uppercase">{language}</span>
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 origin-top-right bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/50 dark:border-gray-700/50 rounded-2xl shadow-xl shadow-indigo-500/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 overflow-hidden">
                <div className="py-2" role="menu">
                  {(['en', 'hi', 'ta', 'te', 'bn', 'mr'] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      role="menuitem"
                      onClick={() => setLanguage(lang)}
                      className={`block w-full text-left px-5 py-2.5 text-sm font-medium transition-colors ${
                        language === lang 
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी (Hindi)' : lang === 'ta' ? 'தமிழ் (Tamil)' : lang === 'te' ? 'తెలుగు (Telugu)' : lang === 'bn' ? 'বাংলা (Bengali)' : 'मराठी (Marathi)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <ThemeToggle />
            
            {user ? (
              <div className="flex items-center gap-3 ml-2 pl-2">
                <Link href="/dashboard" aria-label="View Dashboard">
                  <img src={user.photoURL || ''} alt="" className="w-9 h-9 rounded-full border-2 border-indigo-200 dark:border-indigo-800 shadow-sm hover:scale-110 transition-transform" />
                </Link>
                <button
                  onClick={signOut}
                  className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                  aria-label="Logout"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login">
                <button
                  className="ml-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300"
                  aria-label="Sign In with Google"
                >
                  Sign In
                </button>
              </Link>
            )}
          </div>

          <div className="flex items-center md:hidden z-10">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-500 hover:text-indigo-600 bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-white/50 dark:hover:border-gray-700/50 shadow-sm transition-all focus:outline-none"
              aria-label={isOpen ? "Close Menu" : "Open Menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-full left-4 right-4 mt-2"
          >
            <div className="p-4 rounded-3xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/50 dark:border-gray-800/50 shadow-2xl shadow-indigo-500/10 flex flex-col gap-2">
              {displayNavItems.map((item) => (
                <NavItem 
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  isActive={pathname === item.href}
                  onClick={() => setIsOpen(false)}
                />
              ))}
              
              <div className="h-px bg-gray-200 dark:bg-gray-800 my-2" />
              
              <div className="px-2">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Language</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['en', 'hi', 'ta', 'te', 'bn', 'mr'] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => { setLanguage(lang); setIsOpen(false); }}
                      className={`text-center py-2 rounded-xl text-sm font-bold uppercase transition-colors ${
                        language === lang
                          ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/50'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                      aria-label={`Switch to ${lang}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-200 dark:bg-gray-800 my-2" />

              <div className="flex items-center justify-between px-2">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Theme Preference</span>
                <ThemeToggle />
              </div>

              <div className="h-px bg-gray-200 dark:bg-gray-800 my-2" />

              {user ? (
                <button
                  onClick={() => { signOut(); setIsOpen(false); }}
                  className="w-full py-3 rounded-xl text-center font-bold text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => { signInWithGoogle(); setIsOpen(false); }}
                  className="w-full py-3 rounded-xl text-center font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md shadow-indigo-500/20"
                >
                  Sign In
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
