import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { adminService } from '@/services/adminService';
import { useAppSelector } from '@/store/hooks';

interface Event {
	_id: string;
	title: string;
	startsAt: string;
	endsAt?: string;
	location?: string;
	description?: string;
}

export default function AdminEventFormScreen({ navigation, route }: any) {
	const user = useAppSelector((s) => s.auth.user);
	const existingEvent: Event | undefined = route.params?.event;
	const isEditing = !!existingEvent;

	const [title, setTitle] = useState(existingEvent?.title || '');
	const [startsAt, setStartsAt] = useState(
		existingEvent?.startsAt ? new Date(existingEvent.startsAt).toISOString().slice(0, 16) : ''
	);
	const [endsAt, setEndsAt] = useState(
		existingEvent?.endsAt ? new Date(existingEvent.endsAt).toISOString().slice(0, 16) : ''
	);
	const [location, setLocation] = useState(existingEvent?.location || '');
	const [description, setDescription] = useState(existingEvent?.description || '');
	const [loading, setLoading] = useState(false);

	const handleSave = async () => {
		if (!title.trim() || !startsAt) {
			Alert.alert('Error', 'Title and start time are required');
			return;
		}

		try {
			setLoading(true);
			const eventData = {
				title: title.trim(),
				startsAt,
				endsAt: endsAt || undefined,
				location: location.trim() || undefined,
				description: description.trim() || undefined,
			};

			if (isEditing) {
				await adminService.updateEvent(existingEvent._id, eventData);
			} else {
				await adminService.createEvent(eventData);
			}

			Alert.alert('Success', `Event ${isEditing ? 'updated' : 'created'} successfully`, [
				{ text: 'OK', onPress: () => navigation.goBack() },
			]);
		} catch (error) {
			Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'create'} event`);
		} finally {
			setLoading(false);
		}
	};

	if (!user || user.role !== 'admin') {
		return (
			<View style={styles.container}>
				<Text>Forbidden</Text>
			</View>
		);
	}

	return (
		<ScrollView style={styles.container}>
			<Text style={styles.title}>{isEditing ? 'Edit Event' : 'Create Event'}</Text>

			<View style={styles.formGroup}>
				<Text style={styles.label}>Title *</Text>
				<TextInput
					style={styles.input}
					value={title}
					onChangeText={setTitle}
					placeholder="Enter event title"
				/>
			</View>

			<View style={styles.formGroup}>
				<Text style={styles.label}>Start Date & Time *</Text>
				<TextInput
					style={styles.input}
					value={startsAt}
					onChangeText={setStartsAt}
					placeholder="YYYY-MM-DDTHH:MM"
				/>
				<Text style={styles.hint}>Format: YYYY-MM-DDTHH:MM (e.g., 2024-01-15T14:30)</Text>
			</View>

			<View style={styles.formGroup}>
				<Text style={styles.label}>End Date & Time</Text>
				<TextInput
					style={styles.input}
					value={endsAt}
					onChangeText={setEndsAt}
					placeholder="YYYY-MM-DDTHH:MM (optional)"
				/>
			</View>

			<View style={styles.formGroup}>
				<Text style={styles.label}>Location</Text>
				<TextInput
					style={styles.input}
					value={location}
					onChangeText={setLocation}
					placeholder="Enter event location"
				/>
			</View>

			<View style={styles.formGroup}>
				<Text style={styles.label}>Description</Text>
				<TextInput
					style={[styles.input, styles.textArea]}
					value={description}
					onChangeText={setDescription}
					placeholder="Enter event description"
					multiline
					numberOfLines={4}
				/>
			</View>

			<View style={styles.actions}>
				<TouchableOpacity
					style={[styles.button, styles.cancelButton]}
					onPress={() => navigation.goBack()}
				>
					<Text style={styles.cancelButtonText}>Cancel</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.button, styles.saveButton]}
					onPress={handleSave}
					disabled={loading}
				>
					<Text style={styles.saveButtonText}>
						{loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
					</Text>
				</TouchableOpacity>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	title: { fontSize: 18, fontWeight: '700', marginBottom: 20 },
	formGroup: { marginBottom: 16 },
	label: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: '#333' },
	input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 4, padding: 12, fontSize: 14 },
	textArea: { height: 80, textAlignVertical: 'top' },
	hint: { fontSize: 12, color: '#666', marginTop: 4 },
	actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
	button: { flex: 1, paddingVertical: 12, borderRadius: 4, alignItems: 'center' },
	cancelButton: { backgroundColor: '#6c757d', marginRight: 8 },
	cancelButtonText: { color: 'white', fontWeight: '600' },
	saveButton: { backgroundColor: '#007bff', marginLeft: 8 },
	saveButtonText: { color: 'white', fontWeight: '600' },
});