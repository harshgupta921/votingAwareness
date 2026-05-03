'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilityState {
  fontSize: number; // percentage, e.g., 100
  highContrast: boolean;
  highlightLinks: boolean;
  underlineLinks: boolean;
  readableFont: boolean;
}

interface AccessibilityContextType {
  state: AccessibilityState;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
  toggleHighContrast: () => void;
  toggleHighlightLinks: () => void;
  toggleUnderlineLinks: () => void;
  toggleReadableFont: () => void;
  resetAll: () => void;
  readAloud: (text: string) => void;
  stopReadAloud: () => void;
  isSpeaking: boolean;
}

const defaultState: AccessibilityState = {
  fontSize: 100,
  highContrast: false,
  highlightLinks: false,
  underlineLinks: false,
  readableFont: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AccessibilityState>(defaultState);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('voteIndia_accessibility');
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse accessibility state');
      }
    }
    setIsInitialized(true);
  }, []);

  // Save to local storage and apply to DOM whenever state changes
  useEffect(() => {
    if (!isInitialized) return;
    
    localStorage.setItem('voteIndia_accessibility', JSON.stringify(state));

    // Apply Font Size
    document.documentElement.style.fontSize = `${state.fontSize}%`;

    // Apply High Contrast
    if (state.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }

    // Apply Highlight Links
    if (state.highlightLinks) {
      document.body.classList.add('highlight-links');
    } else {
      document.body.classList.remove('highlight-links');
    }

    // Apply Underline Links
    if (state.underlineLinks) {
      document.body.classList.add('underline-links');
    } else {
      document.body.classList.remove('underline-links');
    }

    // Apply Readable Font
    if (state.readableFont) {
      document.body.classList.add('readable-font');
    } else {
      document.body.classList.remove('readable-font');
    }
  }, [state, isInitialized]);

  const increaseFontSize = () => setState(s => ({ ...s, fontSize: Math.min(s.fontSize + 10, 150) }));
  const decreaseFontSize = () => setState(s => ({ ...s, fontSize: Math.max(s.fontSize - 10, 80) }));
  const resetFontSize = () => setState(s => ({ ...s, fontSize: 100 }));
  const toggleHighContrast = () => setState(s => ({ ...s, highContrast: !s.highContrast }));
  const toggleHighlightLinks = () => setState(s => ({ ...s, highlightLinks: !s.highlightLinks }));
  const toggleUnderlineLinks = () => setState(s => ({ ...s, underlineLinks: !s.underlineLinks }));
  const toggleReadableFont = () => setState(s => ({ ...s, readableFont: !s.readableFont }));
  
  const resetAll = () => {
    setState(defaultState);
    stopReadAloud();
  };

  const readAloud = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      stopReadAloud(); // Stop current
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN'; // Default to Indian English
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopReadAloud = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <AccessibilityContext.Provider
      value={{
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
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
