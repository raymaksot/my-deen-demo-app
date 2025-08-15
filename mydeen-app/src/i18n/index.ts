import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { translations } from './translations';

const deviceLng = Localization.getLocales?.()[0]?.languageCode || 'en';

let initialized = false;

export function initializeI18n(locale?: string) {
	if (initialized) {
		if (locale) {
			i18n.changeLanguage(locale);
		}
		return i18n;
	}
	
	i18n.use(initReactI18next).init({
		resources: translations,
		lng: locale || deviceLng,
		fallbackLng: 'en',
		interpolation: { escapeValue: false },
		react: {
			useSuspense: false,
		},
	});
	
	initialized = true;
	return i18n;
}

export function changeLanguage(locale: string) {
	return i18n.changeLanguage(locale);
}

// Initialize with default language
initializeI18n();

export default i18n;