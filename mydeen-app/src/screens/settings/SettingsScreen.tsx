import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setThemeMode } from '@/store/preferencesSlice';
import { appStorage } from '@/utils/cache';
import { useNavigation } from '@react-navigation/native';

export default function SettingsScreen() {
	const dispatch = useAppDispatch();
	const navigation = useNavigation<any>();
	const { t } = useTranslation();
	const prefs = useAppSelector((s) => s.preferences);
	const [fontScale, setFontScale] = useState<number>(1);
	const [highContrast, setHighContrast] = useState<boolean>(false);
	const [notif, setNotif] = useState({ prayerTimes: true, events: true, articles: true, groupMilestones: true });

	useEffect(() => {
		(async () => {
			const n = await appStorage.getObject<typeof notif>('prefs:notifications');
			if (n) setNotif(n);
			const fs = await appStorage.getString('prefs:fontScale');
			if (fs) setFontScale(Number(fs));
			const hc = await appStorage.getString('prefs:highContrast');
			if (hc) setHighContrast(hc === '1');
		})();
	}, []);

	function toggleTheme() {
		dispatch(setThemeMode(prefs.themeMode === 'dark' ? 'light' : 'dark'));
	}

	async function toggleNotif(key: keyof typeof notif) {
		const next = { ...notif, [key]: !notif[key] };
		setNotif(next);
		await appStorage.setObject('prefs:notifications', next);
	}

	async function changeFontScale(value: boolean) {
		const next = value ? 1.2 : 1.0;
		setFontScale(next);
		await appStorage.setString('prefs:fontScale', String(next));
	}

	async function toggleHighContrast() {
		const next = !highContrast;
		setHighContrast(next);
		await appStorage.setString('prefs:highContrast', next ? '1' : '0');
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>{t('settings')}</Text>
			<View style={styles.row}><Text>{t('darkMode')}</Text><Switch value={prefs.themeMode === 'dark'} onValueChange={toggleTheme} /></View>
			<View style={styles.row}><Text>{t('largeText')}</Text><Switch value={fontScale > 1} onValueChange={changeFontScale} /></View>
			<View style={styles.row}><Text>{t('highContrast')}</Text><Switch value={highContrast} onValueChange={toggleHighContrast} /></View>
			<Text style={styles.section}>{t('notifications')}</Text>
			<View style={styles.row}><Text>{t('prayerTimesNotif')}</Text><Switch value={notif.prayerTimes} onValueChange={() => toggleNotif('prayerTimes')} /></View>
			<View style={styles.row}><Text>{t('eventsNotif')}</Text><Switch value={notif.events} onValueChange={() => toggleNotif('events')} /></View>
			<View style={styles.row}><Text>{t('articlesNotif')}</Text><Switch value={notif.articles} onValueChange={() => toggleNotif('articles')} /></View>
			<View style={styles.row}><Text>{t('groupMilestones')}</Text><Switch value={notif.groupMilestones} onValueChange={() => toggleNotif('groupMilestones')} /></View>
			<View style={{ marginTop: 16 }}>
				<TouchableOpacity onPress={() => navigation.navigate('Terms')}><Text style={styles.link}>{t('termsOfService')}</Text></TouchableOpacity>
				<TouchableOpacity onPress={() => navigation.navigate('Privacy')}><Text style={styles.link}>{t('privacyPolicy')}</Text></TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
	row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
	section: { marginTop: 12, fontWeight: '700' },
	link: { color: '#0E7490', marginTop: 8 },
});