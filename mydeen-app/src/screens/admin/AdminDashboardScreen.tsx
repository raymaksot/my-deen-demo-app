import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { apiGet, apiPost, apiDelete } from '@/services/api';
import { useAppSelector } from '@/store/hooks';

export default function AdminDashboardScreen({ navigation }: any) {
	const user = useAppSelector((s) => s.auth.user);
	const [stats, setStats] = useState<{ pendingComments: number; groups: number; events: number } | null>(null);
	const [pendingComments, setPendingComments] = useState<any[]>([]);

	useEffect(() => {
		(async () => {
			try {
				const data = await apiGet('/api/admin/dashboard');
				setStats(data);
			} catch {}
		})();
	}, []);

	async function loadPending() {
		// This endpoint is not defined; for demo, we will skip fetching list
	}

	if (!user || user.role !== 'admin') {
		return (
			<View style={styles.container}><Text>Forbidden</Text></View>
		);
	}
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Admin Dashboard</Text>
			
			<View style={styles.statsContainer}>
				<Text style={styles.statsText}>Pending comments: {stats?.pendingComments ?? 0}</Text>
				<Text style={styles.statsText}>Total groups: {stats?.groups ?? 0}</Text>
				<Text style={styles.statsText}>Total events: {stats?.events ?? 0}</Text>
			</View>

			<View style={styles.actionsContainer}>
				<TouchableOpacity
					style={styles.actionButton}
					onPress={() => navigation.navigate('AdminEvents')}
				>
					<Text style={styles.actionButtonText}>Manage Events</Text>
				</TouchableOpacity>
				
				<TouchableOpacity
					style={styles.actionButton}
					onPress={() => navigation.navigate('AdminGroups')}
				>
					<Text style={styles.actionButtonText}>Manage Reading Groups</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	title: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
	statsContainer: { marginBottom: 24 },
	statsText: { fontSize: 14, marginBottom: 4 },
	actionsContainer: { gap: 12 },
	actionButton: { 
		backgroundColor: '#007bff', 
		paddingVertical: 12, 
		paddingHorizontal: 16, 
		borderRadius: 8, 
		alignItems: 'center' 
	},
	actionButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});