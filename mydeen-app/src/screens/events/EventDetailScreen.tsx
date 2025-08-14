import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { apiDelete, apiGet, apiPost } from '@/services/api';
import * as Notifications from 'expo-notifications';
import { useRoute } from '@react-navigation/native';
import { appStorage } from '@/utils/cache';

interface EventDetail { _id: string; title: string; startsAt: string; endsAt?: string; location?: string; description?: string; registrationsCount?: number }

type ReminderInterval = '30m' | '1h' | '24h';

interface ReminderOption {
	value: ReminderInterval;
	label: string;
	minutes: number;
}

const REMINDER_OPTIONS: ReminderOption[] = [
	{ value: '30m', label: '30 minutes', minutes: 30 },
	{ value: '1h', label: '1 hour', minutes: 60 },
	{ value: '24h', label: '24 hours', minutes: 24 * 60 },
];

export default function EventDetailScreen() {
	const route = useRoute<any>();
	const id = route.params?.id as string;
	const [item, setItem] = useState<EventDetail | null>(null);
	const [registered, setRegistered] = useState(false);
	const [count, setCount] = useState<number>(0);
	const [selectedInterval, setSelectedInterval] = useState<ReminderInterval>('30m');

	useEffect(() => {
		(async () => {
			const res = await apiGet<EventDetail>(`/api/events/${id}`);
			setItem(res);
			setCount(res.registrationsCount ?? 0);
			
			// Check if there's an existing notification for this event
			const notificationId = await appStorage.get(`event-notification-${id}`);
			if (notificationId) {
				setRegistered(true);
			}
		})();
	}, [id]);

	async function register() {
		const r = await apiPost<{ registered: boolean; registrationsCount: number }>(`/api/events/${id}/register`);
		setRegistered(true);
		setCount(r.registrationsCount ?? count);
		
		// Schedule notification with selected interval
		if (item?.startsAt) {
			const selectedOption = REMINDER_OPTIONS.find(opt => opt.value === selectedInterval);
			const reminderMinutes = selectedOption?.minutes ?? 30;
			const when = new Date(new Date(item.startsAt).getTime() - reminderMinutes * 60 * 1000);
			
			if (when.getTime() > Date.now()) {
				const notificationId = await Notifications.scheduleNotificationAsync({
					content: { 
						title: 'Event Reminder', 
						body: `${item.title} starts in ${selectedOption?.label ?? '30 minutes'}` 
					},
					trigger: { date: when },
				});
				
				// Store notification ID for later cancellation
				await appStorage.set(`event-notification-${id}`, notificationId);
			}
		}
	}

	async function cancel() {
		const r = await apiDelete<{ registered: boolean; registrationsCount: number }>(`/api/events/${id}/register`);
		setRegistered(false);
		setCount(r.registrationsCount ?? Math.max(0, count - 1));
		
		// Cancel stored notification
		const notificationId = await appStorage.get(`event-notification-${id}`);
		if (notificationId) {
			await Notifications.cancelScheduledNotificationAsync(notificationId);
			await appStorage.remove(`event-notification-${id}`);
		}
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>{item?.title}</Text>
			{item?.startsAt ? <Text>{new Date(item.startsAt).toLocaleString()}</Text> : null}
			{item?.location ? <Text>{item.location}</Text> : null}
			{item?.description ? <Text style={{ marginTop: 8 }}>{item.description}</Text> : null}
			<Text style={{ marginTop: 8, color: '#6b7280' }}>Registrations: {count}</Text>
			
			{!registered && (
				<View style={{ marginTop: 16 }}>
					<Text style={styles.sectionLabel}>Reminder Time:</Text>
					<View style={styles.reminderOptions}>
						{REMINDER_OPTIONS.map((option) => (
							<TouchableOpacity
								key={option.value}
								onPress={() => setSelectedInterval(option.value)}
								style={[
									styles.reminderOption,
									selectedInterval === option.value && styles.reminderOptionSelected
								]}
							>
								<Text style={[
									styles.reminderOptionText,
									selectedInterval === option.value && styles.reminderOptionTextSelected
								]}>
									{option.label}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>
			)}
			
			<View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
				{registered ? (
					<TouchableOpacity onPress={cancel} style={styles.secondary}><Text>Cancel RSVP</Text></TouchableOpacity>
				) : (
					<TouchableOpacity onPress={register} style={styles.primary}><Text style={styles.primaryText}>RSVP</Text></TouchableOpacity>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	title: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
	primary: { backgroundColor: '#0E7490', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
	primaryText: { color: '#fff', fontWeight: '600' },
	secondary: { backgroundColor: '#f3f4f6', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
	sectionLabel: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
	reminderOptions: { flexDirection: 'row', gap: 8 },
	reminderOption: { 
		backgroundColor: '#f3f4f6', 
		borderRadius: 8, 
		paddingVertical: 8, 
		paddingHorizontal: 12,
		borderWidth: 1,
		borderColor: '#e5e7eb'
	},
	reminderOptionSelected: { 
		backgroundColor: '#0E7490', 
		borderColor: '#0E7490' 
	},
	reminderOptionText: { 
		color: '#374151', 
		fontWeight: '500' 
	},
	reminderOptionTextSelected: { 
		color: '#fff' 
	},
});