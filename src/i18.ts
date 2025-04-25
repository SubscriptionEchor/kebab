import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from './locales/en.json';
import translationTR from './locales/tr.json';
import translationDE from './locales/de.json';
import translationHI from './locales/hi.json';

// Validate translation files
const translations = {
  en: translationEN,
  tr: translationTR,
  de: translationDE,
  hi: translationHI,
};

const resources = {
  en: { translation: translations.en },
  tr: { translation: translations.tr },
  de: { translation: translations.de },
  hi: { translation: translations.hi },
};

// Log invalid translation files
Object.keys(resources).forEach((lang) => {
  if (!resources[lang].translation || typeof resources[lang].translation !== 'object') {
    console.error(`Invalid translation file for language: ${lang}`);
  }
});

i18n
  .use(initReactI18next)
  .init(
    {
      resources,
      lng: 'en',
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
      debug: import.meta.env.DEV, // Enable debug in development
    },
    (err) => {
      if (err) {
        console.error('i18next initialization failed:', err);
      }
    }
  );

export default i18n;