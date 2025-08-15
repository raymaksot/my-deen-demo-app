import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setThemeMode, setFontSize, setHighContrast, FontSize } from '@/store/preferencesSlice';
import { appStorage } from '@/utils/cache';
import { useNavigation } from '@react-navigation/native';
import { useThemeConfig } from '@/theme/theme';

export default function SettingsScreen() {
	const dispatch = useAppDispatch();
	const navigation = useNavigation<any>();
	const prefs = useAppSelector((s) => s.preferences);
	const { colors, fontMultiplier } = useThemeConfig();
	const [notif, setNotif] = useState({ prayerTimes: true, events: true, articles: true, groupMilestones: true });

	useEffect(() => {
		(async () => {
			const n = await appStorage.getObject<typeof notif>('prefs:notifications');
			if (n) setNotif(n);
		})();
	}, []);

	function toggleTheme() {
		dispatch(setThemeMode(prefs.themeMode === 'dark' ? 'light' : 'dark'));
	}

	function handleFontSizeChange(fontSize: FontSize) {
		dispatch(setFontSize(fontSize));
	}

	function toggleHighContrast() {
		dispatch(setHighContrast(!prefs.highContrast));
	}

	async function toggleNotif(key: keyof typeof notif) {
		const next = { ...notif, [key]: !notif[key] };
		setNotif(next);
		await appStorage.setObject('prefs:notifications', next);
	}

	return (
		<View style={[styles.container, { backgroundColor: colors.background }]}>
			<Text style={[styles.title, { color: colors.text, fontSize: 18 * fontMultiplier }]}>Settings</Text>
			
			{/* Theme Settings */}
			<View style={styles.row}>
				<Text style={[styles.label, { color: colors.text, fontSize: 16 * fontMultiplier }]}>Dark Mode</Text>
				<Switch value={prefs.themeMode === 'dark'} onValueChange={toggleTheme} />
			</View>
			
			<View style={styles.row}>
				<Text style={[styles.label, { color: colors.text, fontSize: 16 * fontMultiplier }]}>High Contrast</Text>
				<Switch value={prefs.highContrast} onValueChange={toggleHighContrast} />
			</View>

			{/* Font Size Settings */}
			<Text style={[styles.section, { color: colors.text, fontSize: 16 * fontMultiplier }]}>Font Size</Text>
			<View style={styles.fontSizeContainer}>
				{(['small', 'medium', 'large'] as FontSize[]).map((size) => (
					<TouchableOpacity
						key={size}
						style={[
							styles.fontSizeOption,
							{
								backgroundColor: prefs.fontSize === size ? colors.primary : colors.card,
								borderColor: colors.border,
							}
						]}
						onPress={() => handleFontSizeChange(size)}
					>
						<Text style={[
							styles.fontSizeText,
							{
								color: prefs.fontSize === size ? colors.background : colors.text,
								textTransform: 'capitalize',
								fontSize: 14 * fontMultiplier,
							}
						]}>
							{size}
						</Text>
					</TouchableOpacity>
				))}
			</View>

			{/* Notifications */}
			<Text style={[styles.section, { color: colors.text, fontSize: 16 * fontMultiplier }]}>Notifications</Text>
			<View style={styles.row}>
				<Text style={[styles.label, { color: colors.text, fontSize: 16 * fontMultiplier }]}>Prayer Times</Text>
				<Switch value={notif.prayerTimes} onValueChange={() => toggleNotif('prayerTimes')} />
			</View>
			<View style={styles.row}>
				<Text style={[styles.label, { color: colors.text, fontSize: 16 * fontMultiplier }]}>Events</Text>
				<Switch value={notif.events} onValueChange={() => toggleNotif('events')} />
			</View>
			<View style={styles.row}>
				<Text style={[styles.label, { color: colors.text, fontSize: 16 * fontMultiplier }]}>Articles</Text>
				<Switch value={notif.articles} onValueChange={() => toggleNotif('articles')} />
			</View>
			<View style={styles.row}>
				<Text style={[styles.label, { color: colors.text, fontSize: 16 * fontMultiplier }]}>Group Milestones</Text>
				<Switch value={notif.groupMilestones} onValueChange={() => toggleNotif('groupMilestones')} />
			</View>

			{/* Legal Links */}
			<View style={{ marginTop: 16 }}>
				<TouchableOpacity onPress={() => navigation.navigate('Terms')}>
					<Text style={[styles.link, { color: colors.primary, fontSize: 14 * fontMultiplier }]}>Terms of Service</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => navigation.navigate('Privacy')}>
					<Text style={[styles.link, { color: colors.primary, fontSize: 14 * fontMultiplier }]}>Privacy Policy</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	title: { fontWeight: '700', marginBottom: 16 },
	row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
	label: {},
	section: { marginTop: 24, marginBottom: 12, fontWeight: '700' },
	fontSizeContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 16,
		marginHorizontal: 8,
	},
	fontSizeOption: {
		flex: 1,
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 8,
		borderWidth: 1,
		marginHorizontal: 4,
		alignItems: 'center',
	},
	fontSizeText: {
		fontWeight: '600',
	},
	link: { marginTop: 8 },
});