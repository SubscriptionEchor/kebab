import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from './locales/en.json';
import translationtr from './locales/tr.json';
import translationde from './locales/de.json';
import translationhi from './locales/hi.json';


const resources = {
  en: { translation: translationEN },
  tr: { translation: translationtr },
  de: { translation: translationde },
  hi: { translation: translationhi },
  //ta: { translation: translationTA }
};
i18n
  .use(initReactI18next)
  .init({ 
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });
export default i18n;






