import bg from '../locales/bg.json';
import en from '../locales/en.json';

const translations: Record<string, Record<string, string>> = { bg, en };

export function getTranslation(locale: string) {
    return (key: string) => translations[locale]?.[key] || translations.bg[key] || key;
}
