import bg from '../locales/bg.json';
import en from '../locales/en.json';

type TranslationObject = Record<string, Record<string, string>>;

const translations: Record<string, TranslationObject> = { bg, en };

export function getTranslation(locale: string) {
    return (section: string, key: string) => {
        const localeData = translations[locale] || translations.bg;
        return localeData[section]?.[key] || translations.bg[section]?.[key] || key;
    };
}

// Helper function to get a specific section
export function getSection(locale: string, section: string) {
    const localeData = translations[locale] || translations.bg;
    return localeData[section] || translations.bg[section] || {};
}
