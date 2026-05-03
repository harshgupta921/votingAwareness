'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SkipToContent() {
  const { language } = useLanguage();
  
  return (
    <a 
      href="#main-content" 
      className="absolute top-0 left-0 w-full p-3 bg-indigo-600 text-white text-center font-bold z-[9999] -translate-y-full focus:translate-y-0 transition-transform duration-200"
    >
      {language === 'hi' ? 'मुख्य सामग्री पर जाएं' : 'Skip to Main Content'}
    </a>
  );
}
