import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { adminService } from '@/services/adminService';
import { useAppSelector } from '@/store/hooks';

interface PendingComment {
	_id: string;
	text: string;
	userId: string;
	parentType: string;
	parentId: string;
	createdAt: string;
	user?: {
		name?: string;
		email?: string;
	};
}

export default function AdminPendingCommentsScreen({ navigation }: any) {
	const user = useAppSelector((s) => s.auth.user);
	const [comments, setComments] = useState<PendingComment[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		loadPendingComments();
	}, []);

	const loadPendingComments = async () => {
		try {
			setLoading(true);
			const data = await adminService.getPendingComments();
			setComments(data);
		} catch (error) {
			Alert.alert('Error', 'Failed to load pending comments');
		} finally {
			setLoading(false);
		}
	};

	const handleApprove = async (commentId: string) => {
		try {
			await adminService.approveComment(commentId);
			// Remove from local list
			setComments(prev => prev.filter(c => c._id !== commentId));
			Alert.alert('Success', 'Comment approved');
		} catch (error) {
			Alert.alert('Error', 'Failed to approve comment');
		}
	};

	const handleReject = async (commentId: string) => {
		Alert.alert(
			'Reject Comment',
			'Are you sure you want to reject this comment?',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Reject',
					style: 'destructive',
					onPress: async () => {
						try {
							await adminService.deleteComment(commentId);
							// Remove from local list
							setComments(prev => prev.filter(c => c._id !== commentId));
							Alert.alert('Success', 'Comment rejected');
						} catch (error) {
							Alert.alert('Error', 'Failed to reject comment');
						}
					},
				},
			]
		);
	};

	const renderComment = ({ item }: { item: PendingComment }) => (
		<View style={styles.commentCard}>
			<Text style={styles.commentText}>{item.text}</Text>
			<Text style={styles.commentMeta}>
				Author: {item.user?.name || item.user?.email || item.userId}
			</Text>
			<Text style={styles.commentMeta}>
				Date: {new Date(item.createdAt).toLocaleDateString()}
			</Text>
			<Text style={styles.commentMeta}>
				Type: {item.parentType} - {item.parentId}
			</Text>
			
			<View style={styles.actions}>
				<TouchableOpacity
					style={styles.approveButton}
					onPress={() => handleApprove(item._id)}
				>
					<Text style={styles.approveButtonText}>Approve</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.rejectButton}
					onPress={() => handleReject(item._id)}
				>
					<Text style={styles.rejectButtonText}>Reject</Text>
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
			<Text style={styles.title}>Pending Comments</Text>
			<FlatList
				data={comments}
				renderItem={renderComment}
				keyExtractor={(item) => item._id}
				refreshing={loading}
				onRefresh={loadPendingComments}
				contentContainerStyle={styles.list}
				ListEmptyComponent={
					<Text style={styles.emptyText}>
						{loading ? 'Loading...' : 'No pending comments'}
					</Text>
				}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	title: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
	list: { paddingBottom: 16 },
	commentCard: { 
		backgroundColor: 'white', 
		padding: 16, 
		marginBottom: 12, 
		borderRadius: 8, 
		shadowColor: '#000', 
		shadowOffset: { width: 0, height: 2 }, 
		shadowOpacity: 0.1, 
		shadowRadius: 4, 
		elevation: 2 
	},
	commentText: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
	commentMeta: { fontSize: 12, color: '#666', marginBottom: 4 },
	actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
	approveButton: { 
		backgroundColor: '#28a745', 
		paddingHorizontal: 16, 
		paddingVertical: 8, 
		borderRadius: 4, 
		marginRight: 8 
	},
	approveButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
	rejectButton: { 
		backgroundColor: '#dc3545', 
		paddingHorizontal: 16, 
		paddingVertical: 8, 
		borderRadius: 4 
	},
	rejectButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
	emptyText: { textAlign: 'center', color: '#666', marginTop: 32 },
});