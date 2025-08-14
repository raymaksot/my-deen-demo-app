import * as Notifications from 'expo-notifications';
import dayjs from 'dayjs';
import { PrayerTimesResponse } from './prayerService';
import { PrayerNotifications } from '@/store/preferencesSlice';

function toFutureDate(timeStr: string): Date | null {
	if (!timeStr) return null;
	const [h, m] = timeStr.split(':').map((s) => parseInt(s, 10));
	if (isNaN(h) || isNaN(m)) return null;
	let dt = dayjs().hour(h).minute(m).second(0).millisecond(0);
	if (dt.isBefore(dayjs())) dt = dt.add(1, 'day');
	return dt.toDate();
}

export async function schedulePrayerNotifications(
	times: PrayerTimesResponse,
	notifications?: PrayerNotifications
) {
	// Cancel all existing prayer notifications first
	await Notifications.cancelAllScheduledNotificationsAsync();

	const mapping: [string, string, keyof PrayerNotifications][] = [
		['Fajr', times.fajr, 'fajr'],
		['Dhuhr', times.dhuhr, 'dhuhr'],
		['Asr', times.asr, 'asr'],
		['Maghrib', times.maghrib, 'maghrib'],
		['Isha', times.isha, 'isha'],
	];
	
	for (const [name, t, notificationKey] of mapping) {
		// Skip if notifications are provided and this prayer is disabled
		if (notifications && !notifications[notificationKey]) {
			continue;
		}
		
		const when = toFutureDate(t);
		if (!when) continue;
		
		await Notifications.scheduleNotificationAsync({
			content: { title: `Athan - ${name}`, body: `${name} time has arrived` },
			trigger: when,
		});
	}
}