import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

const resources = {
	en: {
		translation: {
			// App basics
			hello: 'Hello',
			appName: 'MyDeen',
			welcome: 'Welcome',
			
			// Navigation
			home: 'Home',
			quran: 'Quran',
			hadith: 'Hadith',
			duas: 'Duas',
			places: 'Places',
			qibla: 'Qibla',
			prayerTimes: 'Prayer Times',
			calendar: 'Calendar',
			zakat: 'Zakat',
			settings: 'Settings',
			profile: 'Profile',
			groups: 'Groups',
			events: 'Events',
			qa: 'Q&A',
			
			// Common actions
			save: 'Save',
			cancel: 'Cancel',
			back: 'Back',
			next: 'Next',
			search: 'Search',
			loading: 'Loading...',
			saving: 'Saving...',
			
			// Comments and social
			comments: 'Comments',
			addComment: 'Add Comment',
			writeComment: 'Write a comment...',
			
			// Language screen
			language: 'Language',
			languageChoice: 'Language Choice',
			selectLanguage: 'Select Language',
			searchLanguage: 'Search language',
			
			// Settings
			themeMode: 'Theme',
			notifications: 'Notifications',
			
			// Authentication
			login: 'Login',
			register: 'Register',
			logout: 'Logout',
			
			// Home screen
			featuredCult: 'Featured Cult',
			latestArticle: 'Latest Article',
			nearestMosque: 'Nearest Mosque',
			seeAll: 'See All',
			nextPrayerIs: 'Next prayer is',
		},
	},
	ar: {
		translation: {
			// App basics
			hello: 'مرحبا',
			appName: 'ماي دين',
			welcome: 'مرحباً',
			
			// Navigation
			home: 'الرئيسية',
			quran: 'القرآن',
			hadith: 'الحديث',
			duas: 'الأدعية',
			places: 'الأماكن',
			qibla: 'القبلة',
			prayerTimes: 'أوقات الصلاة',
			calendar: 'التقويم',
			zakat: 'الزكاة',
			settings: 'الإعدادات',
			profile: 'الملف الشخصي',
			groups: 'المجموعات',
			events: 'الفعاليات',
			qa: 'الأسئلة والأجوبة',
			
			// Common actions
			save: 'حفظ',
			cancel: 'إلغاء',
			back: 'رجوع',
			next: 'التالي',
			search: 'بحث',
			loading: 'جاري التحميل...',
			saving: 'جاري الحفظ...',
			
			// Comments and social
			comments: 'التعليقات',
			addComment: 'إضافة تعليق',
			writeComment: 'اكتب تعليقاً...',
			
			// Language screen
			language: 'اللغة',
			languageChoice: 'اختيار اللغة',
			selectLanguage: 'اختر اللغة',
			searchLanguage: 'البحث عن لغة',
			
			// Settings
			themeMode: 'المظهر',
			notifications: 'الإشعارات',
			
			// Authentication
			login: 'تسجيل الدخول',
			register: 'إنشاء حساب',
			logout: 'تسجيل الخروج',
			
			// Home screen
			featuredCult: 'المحتوى المميز',
			latestArticle: 'أحدث المقالات',
			nearestMosque: 'أقرب مسجد',
			seeAll: 'عرض الكل',
			nextPrayerIs: 'الصلاة القادمة هي',
		},
	},
};

const deviceLng = Localization.getLocales?.()[0]?.languageCode || 'en';

i18n.use(initReactI18next).init({
	resources,
	lng: deviceLng,
	fallbackLng: 'en',
	interpolation: { escapeValue: false },
});

export default i18n;