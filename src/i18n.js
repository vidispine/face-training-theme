import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-xhr-backend';
import detector from 'i18next-browser-languagedetector';

const { PUBLIC_URL: basename = '/' } = process.env;

i18n
  .use(detector)
  .use(Backend)
  .use(initReactI18next)
  .init({
    debug: false,
    fallbackLng: 'en',
    whitelist: ['en', 'sv', 'de'],
    supportedLngs: ['en', 'sv', 'de'],

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },

    backend: {
      loadPath: `${basename}/locales/{{lng}}/{{ns}}.json`,
    },
  });

export default i18n;
