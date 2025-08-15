import * as Notifications from 'expo-notifications';
import dayjs from 'dayjs';
import { PrayerTimesResponse } from './prayerService';
import { PrayerPreferences } from '../store/preferencesSlice';
import { quranService } from './quranService';
import { hadithService } from './hadithService';

function toFutureDate(timeStr: string): Date | null {
	if (!timeStr) return null;
	const [h, m] = timeStr.split(':').map((s) => parseInt(s, 10));
	if (isNaN(h) || isNaN(m)) return null;
	let dt = dayjs().hour(h).minute(m).second(0).millisecond(0);
	if (dt.isBefore(dayjs())) dt = dt.add(1, 'day');
	return dt.toDate();
}

export async function schedulePrayerNotifications(times: PrayerTimesResponse, prefs?: PrayerPreferences) {
	// Cancel existing prayer notifications first
	const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
	const prayerNotifications = scheduledNotifications.filter(
		notification => notification.content.title?.includes('Athan')
	);
	
	for (const notification of prayerNotifications) {
		await Notifications.cancelScheduledNotificationAsync(notification.identifier);
	}

	const mapping: [string, string, keyof PrayerPreferences['notifications']][] = [
		['Fajr', times.fajr, 'fajr'],
		['Dhuhr', times.dhuhr, 'dhuhr'],
		['Asr', times.asr, 'asr'],
		['Maghrib', times.maghrib, 'maghrib'],
		['Isha', times.isha, 'isha'],
	];
	
	for (const [name, t, prefKey] of mapping) {
		// Skip if notifications are disabled for this prayer
		if (prefs?.notifications && !prefs.notifications[prefKey]) continue;
		
		const when = toFutureDate(t);
		if (!when) continue;
		await Notifications.scheduleNotificationAsync({
			content: { title: `Athan - ${name}`, body: `${name} time has arrived` },
			trigger: when,
		});
	}
}

export async function scheduleDailyContentNotification() {
	try {
		// Cancel any existing daily content notifications
		const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
		const dailyContentNotifications = scheduledNotifications.filter(
			notification => notification.content.data?.type === 'daily-content'
		);
		
		for (const notification of dailyContentNotifications) {
			await Notifications.cancelScheduledNotificationAsync(notification.identifier);
		}

		// Schedule notification for tomorrow at 8:00 AM
		const tomorrow = dayjs().add(1, 'day').hour(8).minute(0).second(0).millisecond(0);
		
		// Fetch daily content for the notification
		const [dailyAyah, dailyHadith] = await Promise.all([
			quranService.getDailyAyah().catch(() => null),
			hadithService.getDailyHadith().catch(() => null),
		]);

		let notificationBody = 'Your daily inspiration is ready';
		if (dailyAyah && dailyHadith) {
			notificationBody = `Daily Ayah from ${dailyAyah.surah.englishName} and Hadith from ${dailyHadith.collection}`;
		} else if (dailyAyah) {
			notificationBody = `Daily Ayah from ${dailyAyah.surah.englishName}`;
		} else if (dailyHadith) {
			notificationBody = `Daily Hadith from ${dailyHadith.collection}`;
		}

		await Notifications.scheduleNotificationAsync({
			content: {
				title: 'Daily Islamic Content',
				body: notificationBody,
				data: { type: 'daily-content' },
			},
			trigger: tomorrow.toDate(),
		});
		
		console.log('Daily content notification scheduled for:', tomorrow.format('YYYY-MM-DD HH:mm'));
	} catch (error) {
		console.error('Failed to schedule daily content notification:', error);
	}
}