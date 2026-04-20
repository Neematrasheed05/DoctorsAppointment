
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, detectLanguage } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // Try to detect language from browser settings or local storage
    const stored = localStorage.getItem('clinic-language') as Language;
    if (stored && ['en', 'sw'].includes(stored)) {
      setLanguage(stored);
    } else {
      // Detect from browser language
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.includes('sw') || browserLang.includes('swahili')) {
        setLanguage('sw');
      }
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('clinic-language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
