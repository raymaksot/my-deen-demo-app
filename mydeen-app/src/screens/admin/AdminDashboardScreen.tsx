import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useAppSelector } from '@/store/hooks';
import { adminService, PendingComment } from '@/services/adminService';

export default function AdminDashboardScreen() {
	const user = useAppSelector((s) => s.auth.user);
	const [stats, setStats] = useState<{ pendingComments: number; groups: number; events: number } | null>(null);
	const [pendingComments, setPendingComments] = useState<PendingComment[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		loadDashboard();
		loadPendingComments();
	}, []);

	async function loadDashboard() {
		try {
			const data = await adminService.dashboard();
			setStats(data);
		} catch (error) {
			console.error('Failed to load dashboard:', error);
		}
	}

	async function loadPendingComments() {
		setLoading(true);
		try {
			const data = await adminService.getPendingComments();
			setPendingComments(data.data);
		} catch (error) {
			console.error('Failed to load pending comments:', error);
		} finally {
			setLoading(false);
		}
	}

	async function handleApprove(commentId: string) {
		try {
			await adminService.approveComment(commentId);
			// Remove from pending list
			setPendingComments(prev => prev.filter(c => c._id !== commentId));
			// Update stats
			setStats(prev => prev ? { ...prev, pendingComments: prev.pendingComments - 1 } : null);
		} catch (error) {
			Alert.alert('Error', 'Failed to approve comment');
		}
	}

	async function handleReject(commentId: string) {
		Alert.alert(
			'Reject Comment',
			'Are you sure you want to reject this comment? This action cannot be undone.',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Reject',
					style: 'destructive',
					onPress: async () => {
						try {
							await adminService.deleteComment(commentId);
							// Remove from pending list
							setPendingComments(prev => prev.filter(c => c._id !== commentId));
							// Update stats
							setStats(prev => prev ? { ...prev, pendingComments: prev.pendingComments - 1 } : null);
						} catch (error) {
							Alert.alert('Error', 'Failed to reject comment');
						}
					}
				}
			]
		);
	}

	const renderComment = ({ item }: { item: PendingComment }) => (
		<View style={styles.commentCard}>
			<Text style={styles.commentText}>{item.text}</Text>
			<Text style={styles.commentMeta}>
				By: {item.userId?.name || 'Unknown'} • {new Date(item.createdAt).toLocaleDateString()}
			</Text>
			<Text style={styles.commentMeta}>
				Type: {item.parentType} • ID: {item.parentId}
			</Text>
			<View style={styles.buttonRow}>
				<TouchableOpacity 
					style={[styles.button, styles.approveButton]} 
					onPress={() => handleApprove(item._id)}
				>
					<Text style={styles.buttonText}>Approve</Text>
				</TouchableOpacity>
				<TouchableOpacity 
					style={[styles.button, styles.rejectButton]} 
					onPress={() => handleReject(item._id)}
				>
					<Text style={styles.buttonText}>Reject</Text>
				</TouchableOpacity>
			</View>
		</View>
	);

	if (!user || user.role !== 'admin') {
		return (
			<View style={styles.container}><Text>Forbidden</Text></View>
		);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Admin Dashboard</Text>
			<View style={styles.statsContainer}>
				<Text style={styles.stat}>Pending comments: {stats?.pendingComments ?? 0}</Text>
				<Text style={styles.stat}>Total groups: {stats?.groups ?? 0}</Text>
				<Text style={styles.stat}>Total events: {stats?.events ?? 0}</Text>
			</View>
			
			<Text style={styles.sectionTitle}>Pending Comments</Text>
			<FlatList
				data={pendingComments}
				keyExtractor={(item) => item._id}
				renderItem={renderComment}
				ListEmptyComponent={
					<Text style={styles.emptyText}>
						{loading ? 'Loading...' : 'No pending comments'}
					</Text>
				}
				refreshing={loading}
				onRefresh={loadPendingComments}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
	statsContainer: { marginBottom: 20, padding: 12, backgroundColor: '#f3f4f6', borderRadius: 8 },
	stat: { fontSize: 14, marginVertical: 2 },
	sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
	commentCard: { 
		backgroundColor: '#fff', 
		padding: 12, 
		marginBottom: 8, 
		borderRadius: 8, 
		borderWidth: 1, 
		borderColor: '#e5e7eb' 
	},
	commentText: { fontSize: 14, marginBottom: 8, lineHeight: 20 },
	commentMeta: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
	buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, gap: 8 },
	button: { 
		paddingHorizontal: 16, 
		paddingVertical: 8, 
		borderRadius: 6, 
		minWidth: 80,
		alignItems: 'center'
	},
	approveButton: { backgroundColor: '#10b981' },
	rejectButton: { backgroundColor: '#ef4444' },
	buttonText: { color: '#fff', fontSize: 12, fontWeight: '600' },
	emptyText: { textAlign: 'center', color: '#6b7280', padding: 20 },
});