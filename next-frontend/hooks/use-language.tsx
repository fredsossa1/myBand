"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Language, 
  Translations, 
  getTranslation, 
  loadLanguagePreference, 
  saveLanguagePreference 
} from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load saved language preference or detect browser language
    const savedLanguage = loadLanguagePreference();
    setLanguageState(savedLanguage);
    setIsLoading(false);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    saveLanguagePreference(lang);
  };

  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    t: getTranslation(language),
    isLoading,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Convenience hook for just getting translations
export function useTranslations(): Translations {
  const { t } = useLanguage();
  return t;
}
