import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { adminService } from '@/services/adminService';
import { useAppSelector } from '@/store/hooks';

interface ReadingGroup {
	_id: string;
	name: string;
	description?: string;
	target?: any;
	schedule?: any;
}

export default function AdminGroupFormScreen({ navigation, route }: any) {
	const user = useAppSelector((s) => s.auth.user);
	const existingGroup: ReadingGroup | undefined = route.params?.group;
	const isEditing = !!existingGroup;

	const [name, setName] = useState(existingGroup?.name || '');
	const [description, setDescription] = useState(existingGroup?.description || '');
	const [targetType, setTargetType] = useState(existingGroup?.target?.type || 'quran');
	const [targetScope, setTargetScope] = useState(existingGroup?.target?.scope || 'full');
	const [loading, setLoading] = useState(false);

	const handleSave = async () => {
		if (!name.trim()) {
			Alert.alert('Error', 'Group name is required');
			return;
		}

		try {
			setLoading(true);
			const groupData = {
				name: name.trim(),
				description: description.trim() || undefined,
				target: {
					type: targetType,
					scope: targetScope,
				},
				schedule: {},
			};

			if (isEditing) {
				await adminService.updateReadingGroup(existingGroup._id, groupData);
			} else {
				await adminService.createReadingGroup(groupData);
			}

			Alert.alert('Success', `Reading group ${isEditing ? 'updated' : 'created'} successfully`, [
				{ text: 'OK', onPress: () => navigation.goBack() },
			]);
		} catch (error) {
			Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'create'} reading group`);
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
			<Text style={styles.title}>{isEditing ? 'Edit Reading Group' : 'Create Reading Group'}</Text>

			<View style={styles.formGroup}>
				<Text style={styles.label}>Group Name *</Text>
				<TextInput
					style={styles.input}
					value={name}
					onChangeText={setName}
					placeholder="Enter group name"
				/>
			</View>

			<View style={styles.formGroup}>
				<Text style={styles.label}>Description</Text>
				<TextInput
					style={[styles.input, styles.textArea]}
					value={description}
					onChangeText={setDescription}
					placeholder="Enter group description"
					multiline
					numberOfLines={3}
				/>
			</View>

			<View style={styles.formGroup}>
				<Text style={styles.label}>Target Type</Text>
				<View style={styles.radioGroup}>
					<TouchableOpacity
						style={styles.radioOption}
						onPress={() => setTargetType('quran')}
					>
						<View style={[styles.radio, targetType === 'quran' && styles.radioSelected]} />
						<Text style={styles.radioText}>Quran</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.radioOption}
						onPress={() => setTargetType('hadith')}
					>
						<View style={[styles.radio, targetType === 'hadith' && styles.radioSelected]} />
						<Text style={styles.radioText}>Hadith</Text>
					</TouchableOpacity>
				</View>
			</View>

			<View style={styles.formGroup}>
				<Text style={styles.label}>Target Scope</Text>
				<View style={styles.radioGroup}>
					<TouchableOpacity
						style={styles.radioOption}
						onPress={() => setTargetScope('full')}
					>
						<View style={[styles.radio, targetScope === 'full' && styles.radioSelected]} />
						<Text style={styles.radioText}>Full</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.radioOption}
						onPress={() => setTargetScope('partial')}
					>
						<View style={[styles.radio, targetScope === 'partial' && styles.radioSelected]} />
						<Text style={styles.radioText}>Partial</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.radioOption}
						onPress={() => setTargetScope('custom')}
					>
						<View style={[styles.radio, targetScope === 'custom' && styles.radioSelected]} />
						<Text style={styles.radioText}>Custom</Text>
					</TouchableOpacity>
				</View>
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
	textArea: { height: 60, textAlignVertical: 'top' },
	radioGroup: { flexDirection: 'column' },
	radioOption: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
	radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#ddd', marginRight: 8 },
	radioSelected: { backgroundColor: '#007bff', borderColor: '#007bff' },
	radioText: { fontSize: 14, color: '#333' },
	actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
	button: { flex: 1, paddingVertical: 12, borderRadius: 4, alignItems: 'center' },
	cancelButton: { backgroundColor: '#6c757d', marginRight: 8 },
	cancelButtonText: { color: 'white', fontWeight: '600' },
	saveButton: { backgroundColor: '#007bff', marginLeft: 8 },
	saveButtonText: { color: 'white', fontWeight: '600' },
});