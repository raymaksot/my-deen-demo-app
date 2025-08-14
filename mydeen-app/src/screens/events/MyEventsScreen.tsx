import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { eventsService, EventItem } from '@/services/eventsService';
import { useNavigation } from '@react-navigation/native';

export default function MyEventsScreen() {
	const nav = useNavigation<any>();
	const [items, setItems] = useState<EventItem[]>([]);
	const [loading, setLoading] = useState(false);

	async function load() {
		setLoading(true);
		try {
			const res = await eventsService.myEvents();
			setItems(res);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		load();
	}, []);

	return (
		<View style={styles.container}>
			<Text style={styles.title}>My Events</Text>
			<FlatList
				data={items}
				keyExtractor={(i) => i._id}
				renderItem={({ item }) => (
					<TouchableOpacity style={styles.card} onPress={() => nav.navigate('EventDetail', { id: item._id })}>
						<Text style={{ fontWeight: '700' }}>{item.title}</Text>
						<Text style={{ color: '#6b7280' }}>{new Date(item.startsAt).toLocaleString()}</Text>
						{item.location && <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>{item.location}</Text>}
					</TouchableOpacity>
				)}
				ListEmptyComponent={<Text style={{ padding: 16 }}>{loading ? 'Loading…' : 'No registered events'}</Text>}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	title: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
	card: { padding: 12, borderBottomColor: '#e5e7eb', borderBottomWidth: 1 },
});