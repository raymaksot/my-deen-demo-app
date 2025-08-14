import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setThemeMode, setFontScale, setHighContrast, savePreferencesToStorage } from '@/store/preferencesSlice';
import { appStorage } from '@/utils/cache';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/theme/theme';

export default function SettingsScreen() {
	const dispatch = useAppDispatch();
	const navigation = useNavigation<any>();
	const prefs = useAppSelector((s) => s.preferences);
	const { colors, fontScale } = useTheme();
	const [notif, setNotif] = useState({ prayerTimes: true, events: true, articles: true, groupMilestones: true });

	useEffect(() => {
		(async () => {
			const n = await appStorage.getObject<typeof notif>('prefs:notifications');
			if (n) setNotif(n);
		})();
	}, []);

	// Auto-save preferences when they change
	useEffect(() => {
		savePreferencesToStorage(prefs);
	}, [prefs]);

	function toggleTheme() {
		dispatch(setThemeMode(prefs.themeMode === 'dark' ? 'light' : 'dark'));
	}

	async function toggleNotif(key: keyof typeof notif) {
		const next = { ...notif, [key]: !notif[key] };
		setNotif(next);
		await appStorage.setObject('prefs:notifications', next);
	}

	function changeFontScale(value: boolean) {
		const next = value ? 1.2 : 1.0;
		dispatch(setFontScale(next));
	}

	function toggleHighContrast() {
		dispatch(setHighContrast(!prefs.highContrast));
	}

	const dynamicStyles = StyleSheet.create({
		container: { 
			flex: 1, 
			padding: 16, 
			backgroundColor: colors.background 
		},
		title: { 
			fontSize: 18 * fontScale, 
			fontWeight: '700', 
			marginBottom: 8, 
			color: colors.text 
		},
		text: { 
			fontSize: 16 * fontScale, 
			color: colors.text 
		},
		section: { 
			marginTop: 12, 
			fontWeight: '700', 
			fontSize: 16 * fontScale, 
			color: colors.text 
		},
		link: { 
			color: colors.primary, 
			marginTop: 8, 
			fontSize: 16 * fontScale 
		},
	});

	return (
		<View style={dynamicStyles.container}>
			<Text style={dynamicStyles.title}>Settings</Text>
			<View style={styles.row}>
				<Text style={dynamicStyles.text}>Dark Mode</Text>
				<Switch value={prefs.themeMode === 'dark'} onValueChange={toggleTheme} />
			</View>
			<View style={styles.row}>
				<Text style={dynamicStyles.text}>Large Text</Text>
				<Switch value={prefs.fontScale > 1} onValueChange={changeFontScale} />
			</View>
			<View style={styles.row}>
				<Text style={dynamicStyles.text}>High Contrast</Text>
				<Switch value={prefs.highContrast} onValueChange={toggleHighContrast} />
			</View>
			<Text style={dynamicStyles.section}>Notifications</Text>
			<View style={styles.row}>
				<Text style={dynamicStyles.text}>Prayer Times</Text>
				<Switch value={notif.prayerTimes} onValueChange={() => toggleNotif('prayerTimes')} />
			</View>
			<View style={styles.row}>
				<Text style={dynamicStyles.text}>Events</Text>
				<Switch value={notif.events} onValueChange={() => toggleNotif('events')} />
			</View>
			<View style={styles.row}>
				<Text style={dynamicStyles.text}>Articles</Text>
				<Switch value={notif.articles} onValueChange={() => toggleNotif('articles')} />
			</View>
			<View style={styles.row}>
				<Text style={dynamicStyles.text}>Group Milestones</Text>
				<Switch value={notif.groupMilestones} onValueChange={() => toggleNotif('groupMilestones')} />
			</View>
			<View style={{ marginTop: 16 }}>
				<TouchableOpacity onPress={() => navigation.navigate('Terms')}>
					<Text style={dynamicStyles.link}>Terms of Service</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => navigation.navigate('Privacy')}>
					<Text style={dynamicStyles.link}>Privacy Policy</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	row: { 
		flexDirection: 'row', 
		justifyContent: 'space-between', 
		alignItems: 'center', 
		paddingVertical: 10 
	},
});