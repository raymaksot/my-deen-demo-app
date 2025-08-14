import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { adminService } from '@/services/adminService';
import { useAppSelector } from '@/store/hooks';

interface ReadingGroup {
	_id: string;
	name: string;
	description?: string;
	createdBy: string;
	target?: any;
	schedule?: any;
	createdAt: string;
}

export default function AdminGroupsScreen({ navigation }: any) {
	const user = useAppSelector((s) => s.auth.user);
	const [groups, setGroups] = useState<ReadingGroup[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		loadGroups();
	}, []);

	const loadGroups = async () => {
		try {
			setLoading(true);
			const data = await adminService.getReadingGroups();
			setGroups(data);
		} catch (error) {
			Alert.alert('Error', 'Failed to load reading groups');
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = (group: ReadingGroup) => {
		Alert.alert(
			'Delete Reading Group',
			`Are you sure you want to delete "${group.name}"? This will also delete all related messages and progress.`,
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					style: 'destructive',
					onPress: async () => {
						try {
							await adminService.deleteReadingGroup(group._id);
							await loadGroups();
						} catch (error) {
							Alert.alert('Error', 'Failed to delete reading group');
						}
					},
				},
			]
		);
	};

	const renderGroup = ({ item }: { item: ReadingGroup }) => (
		<View style={styles.groupCard}>
			<Text style={styles.groupName}>{item.name}</Text>
			{item.description && <Text style={styles.groupDescription}>{item.description}</Text>}
			<Text style={styles.groupTarget}>
				Target: {item.target?.type || 'quran'} - {item.target?.scope || 'full'}
			</Text>
			<Text style={styles.groupDate}>
				Created: {new Date(item.createdAt).toLocaleDateString()}
			</Text>
			<View style={styles.actions}>
				<TouchableOpacity
					style={styles.editButton}
					onPress={() => navigation.navigate('AdminGroupForm', { group: item })}
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
				<Text style={styles.title}>Manage Reading Groups</Text>
				<TouchableOpacity
					style={styles.addButton}
					onPress={() => navigation.navigate('AdminGroupForm')}
				>
					<Text style={styles.addButtonText}>+ Add Group</Text>
				</TouchableOpacity>
			</View>
			<FlatList
				data={groups}
				renderItem={renderGroup}
				keyExtractor={(item) => item._id}
				refreshing={loading}
				onRefresh={loadGroups}
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
	groupCard: { backgroundColor: 'white', padding: 16, marginBottom: 12, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
	groupName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
	groupDescription: { fontSize: 14, color: '#333', marginBottom: 4 },
	groupTarget: { fontSize: 14, color: '#666', marginBottom: 4 },
	groupDate: { fontSize: 12, color: '#999', marginBottom: 8 },
	actions: { flexDirection: 'row', justifyContent: 'flex-end' },
	editButton: { backgroundColor: '#28a745', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4, marginRight: 8 },
	editButtonText: { color: 'white', fontSize: 12 },
	deleteButton: { backgroundColor: '#dc3545', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
	deleteButtonText: { color: 'white', fontSize: 12 },
});