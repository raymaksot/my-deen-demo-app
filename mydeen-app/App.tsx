import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Provider } from 'react-redux';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { store, bootstrapPreferences } from '@/store';
import RootNavigator from '@/navigation/RootNavigator';
import i18n from './src/i18n';
import { useAppSelector } from '@/store/hooks';
import { initAuthFromStorage } from '@/store/authSlice';
import { registerBackgroundTasks } from '@/services/background';
import { configureNotificationChannel, registerDeviceToken } from '@/notifications/registerDeviceToken';
import { ThemeProvider } from '@/theme/ThemeContext';
import { ENV } from '@/config/env'; 

async function registerDeviceTokenWithBackend() {
	try {
		await registerDeviceToken();
		await configureNotificationChannel();
	} catch (error) {
		console.warn('Failed to register device token:', error);
	}
}

function AppInner() {
	const themeMode = useAppSelector((s) => s.preferences.themeMode);
	const locale = useAppSelector((s) => s.preferences.locale);
	const navTheme = themeMode === 'dark' ? DarkTheme : DefaultTheme;

	useEffect(() => {
		// Initialize store with persisted preferences
		bootstrapPreferences();
		store.dispatch(initAuthFromStorage());
		(async () => {
			if (Device.isDevice) {
				await registerDeviceTokenWithBackend();
			}
			await registerBackgroundTasks();
		})();
	}, []);

	useEffect(() => {
		i18n.changeLanguage(locale);
	}, [locale]);

	return (
		<ThemeProvider>
			<NavigationContainer theme={navTheme}>
				<StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />
				<RootNavigator />
			</NavigationContainer>
		</ThemeProvider>
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