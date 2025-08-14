import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { store } from '@/store';
import { hydrate, loadPreferencesFromStorage } from '@/store/preferencesSlice';
import RootNavigator from '@/navigation/RootNavigator';
import i18n from './src/i18n';
import { useAppSelector } from '@/store/hooks';
import { initAuthFromStorage } from '@/store/authSlice';
import { registerBackgroundTasks } from '@/services/background';
import { configureNotificationChannel, registerDeviceToken } from '@/notifications/registerDeviceToken';
import { ENV } from '@/config/env'; 


function AppInner() {
	const themeMode = useAppSelector((s) => s.preferences.themeMode);
	const locale = useAppSelector((s) => s.preferences.locale);
	const navTheme = themeMode === 'dark' ? DarkTheme : DefaultTheme;

	useEffect(() => {
		store.dispatch(initAuthFromStorage());
		(async () => {
			// Bootstrap preferences from storage
			const saved = await loadPreferencesFromStorage();
			store.dispatch(hydrate(saved));
			
			if (Device.isDevice) {
				await registerDeviceToken('', ''); // Placeholder parameters
			}
			await registerBackgroundTasks();
		})();
	}, []);

	useEffect(() => {
		i18n.changeLanguage(locale);
	}, [locale]);

	return (
		<I18nextProvider i18n={i18n}>
			<NavigationContainer theme={navTheme}>
				<StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />
				<RootNavigator />
			</NavigationContainer>
		</I18nextProvider>
	);
}

export default function App() {
	Notifications.setNotificationHandler({
		handleNotification: async () => ({
			shouldShowAlert: true,
			shouldPlaySound: true,
			shouldSetBadge: false,
		}),
	});

	return (
		<Provider store={store}>
			<AppInner />
		</Provider>
	);
}