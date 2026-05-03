'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Accessibility, 
  Type, 
  ZoomIn, 
  ZoomOut, 
  Sun, 
  Moon, 
  Contrast, 
  Link as LinkIcon, 
  Underline, 
  RefreshCcw, 
  X,
  Volume2,
  SquareSquare
} from 'lucide-react';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from 'next-themes';

export default function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    state, 
    increaseFontSize, 
    decreaseFontSize, 
    resetFontSize, 
    toggleHighContrast, 
    toggleHighlightLinks, 
    toggleUnderlineLinks, 
    toggleReadableFont, 
    resetAll,
    readAloud,
    stopReadAloud,
    isSpeaking
  } = useAccessibility();

  const { language } = useLanguage();
  const { theme, setTheme, systemTheme } = useTheme();

  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = currentTheme === 'dark';

  const toggleDarkMode = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const handleReadPage = () => {
    if (isSpeaking) {
      stopReadAloud();
    } else {
      // Read the main content
      const content = document.getElementById('main-content')?.innerText || document.body.innerText;
      readAloud(content);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        className="fixed left-4 bottom-4 md:bottom-8 z-50 p-4 bg-indigo-600 text-white rounded-full shadow-2xl hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Accessibility Options"
      >
        <Accessibility className="w-6 h-6" />
      </motion.button>

      {/* Accessibility Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.9 }}
            className="fixed left-4 bottom-24 md:bottom-28 z-50 w-[320px] max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl overflow-hidden"
            role="dialog"
            aria-label="Accessibility Settings Panel"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Accessibility className="w-5 h-5 text-indigo-500" />
                Accessibility Menu
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                aria-label="Close Accessibility Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Options List */}
            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              
              {/* Text to Speech */}
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Screen Reader</p>
                <button
                  onClick={handleReadPage}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                    isSpeaking 
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 text-gray-700 dark:text-gray-300'
                  }`}
                  aria-pressed={isSpeaking}
                >
                  <span className="flex items-center gap-3 font-medium">
                    <Volume2 className="w-5 h-5" />
                    {isSpeaking ? 'Stop Reading' : 'Read Page Aloud'}
                  </span>
                </button>
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Text Size ({state.fontSize}%)</p>
                <div className="flex gap-2">
                  <button onClick={decreaseFontSize} className="flex-1 p-3 flex justify-center items-center rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-300 text-gray-700 dark:text-gray-300 transition-all" aria-label="Decrease Font Size">
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <button onClick={increaseFontSize} className="flex-1 p-3 flex justify-center items-center rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-300 text-gray-700 dark:text-gray-300 transition-all" aria-label="Increase Font Size">
                    <ZoomIn className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Contrast & Colors */}
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Contrast</p>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={toggleDarkMode}
                    className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-300 text-gray-700 dark:text-gray-300 transition-all"
                  >
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    <span className="text-xs font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>
                  <button 
                    onClick={toggleHighContrast}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      state.highContrast ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 text-gray-700 dark:text-gray-300'
                    }`}
                    aria-pressed={state.highContrast}
                  >
                    <Contrast className="w-5 h-5" />
                    <span className="text-xs font-medium">High Contrast</span>
                  </button>
                </div>
              </div>

              {/* Links & Formatting */}
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Links & Formatting</p>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={toggleHighlightLinks}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      state.highlightLinks ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 text-gray-700 dark:text-gray-300'
                    }`}
                    aria-pressed={state.highlightLinks}
                  >
                    <LinkIcon className="w-5 h-5" />
                    <span className="text-xs font-medium">Highlight Links</span>
                  </button>
                  <button 
                    onClick={toggleUnderlineLinks}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      state.underlineLinks ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 text-gray-700 dark:text-gray-300'
                    }`}
                    aria-pressed={state.underlineLinks}
                  >
                    <Underline className="w-5 h-5" />
                    <span className="text-xs font-medium">Underline Links</span>
                  </button>
                </div>
                <button 
                  onClick={toggleReadableFont}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                    state.readableFont ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 text-gray-700 dark:text-gray-300'
                  }`}
                  aria-pressed={state.readableFont}
                >
                  <span className="flex items-center gap-3 font-medium text-sm">
                    <Type className="w-5 h-5" />
                    Dyslexia Friendly Font
                  </span>
                </button>
              </div>

            </div>

            {/* Footer Reset */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <button 
                onClick={resetAll}
                className="w-full flex justify-center items-center gap-2 py-2.5 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 font-bold transition-colors"
                aria-label="Reset all accessibility settings"
              >
                <RefreshCcw className="w-4 h-4" /> Reset All Settings
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
