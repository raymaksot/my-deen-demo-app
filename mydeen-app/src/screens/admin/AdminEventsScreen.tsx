import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { adminService } from '@/services/adminService';
import { useAppSelector } from '@/store/hooks';

interface Event {
	_id: string;
	title: string;
	startsAt: string;
	endsAt?: string;
	location?: string;
	description?: string;
	createdBy: string;
	createdAt: string;
}

export default function AdminEventsScreen({ navigation }: any) {
	const user = useAppSelector((s) => s.auth.user);
	const [events, setEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		loadEvents();
	}, []);

	const loadEvents = async () => {
		try {
			setLoading(true);
			const data = await adminService.getEvents();
			setEvents(data);
		} catch (error) {
			Alert.alert('Error', 'Failed to load events');
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = (event: Event) => {
		Alert.alert(
			'Delete Event',
			`Are you sure you want to delete "${event.title}"?`,
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					style: 'destructive',
					onPress: async () => {
						try {
							await adminService.deleteEvent(event._id);
							await loadEvents();
						} catch (error) {
							Alert.alert('Error', 'Failed to delete event');
						}
					},
				},
			]
		);
	};

	const renderEvent = ({ item }: { item: Event }) => (
		<View style={styles.eventCard}>
			<Text style={styles.eventTitle}>{item.title}</Text>
			<Text style={styles.eventDate}>
				{new Date(item.startsAt).toLocaleDateString()} {new Date(item.startsAt).toLocaleTimeString()}
			</Text>
			{item.location && <Text style={styles.eventLocation}>{item.location}</Text>}
			{item.description && <Text style={styles.eventDescription}>{item.description}</Text>}
			<View style={styles.actions}>
				<TouchableOpacity
					style={styles.editButton}
					onPress={() => navigation.navigate('AdminEventForm', { event: item })}
				>
					<Text style={styles.editButtonText}>Edit</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.deleteButton}
					onPress={() => handleDelete(item)}
				>
					<Text style={styles.deleteButtonText}>Delete</Text>
				</TouchableOpacity>
			</View>
		</View>
	);

	if (!user || user.role !== 'admin') {
		return (
			<View style={styles.container}>
				<Text>Forbidden</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Manage Events</Text>
				<TouchableOpacity
					style={styles.addButton}
					onPress={() => navigation.navigate('AdminEventForm')}
				>
					<Text style={styles.addButtonText}>+ Add Event</Text>
				</TouchableOpacity>
			</View>
			<FlatList
				data={events}
				renderItem={renderEvent}
				keyExtractor={(item) => item._id}
				refreshing={loading}
				onRefresh={loadEvents}
				contentContainerStyle={styles.list}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
	title: { fontSize: 18, fontWeight: '700' },
	addButton: { backgroundColor: '#007bff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 4 },
	addButtonText: { color: 'white', fontWeight: '600' },
	list: { paddingBottom: 16 },
	eventCard: { backgroundColor: 'white', padding: 16, marginBottom: 12, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
	eventTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
	eventDate: { fontSize: 14, color: '#666', marginBottom: 4 },
	eventLocation: { fontSize: 14, color: '#666', marginBottom: 4 },
	eventDescription: { fontSize: 14, color: '#333', marginBottom: 8 },
	actions: { flexDirection: 'row', justifyContent: 'flex-end' },
	editButton: { backgroundColor: '#28a745', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4, marginRight: 8 },
	editButtonText: { color: 'white', fontSize: 12 },
	deleteButton: { backgroundColor: '#dc3545', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
	deleteButtonText: { color: 'white', fontSize: 12 },
});