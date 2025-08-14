import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { apiGet, apiPost } from '@/services/api';
import { useRoute } from '@react-navigation/native';
import { useAppSelector } from '@/store/hooks';
import { groupsService } from '@/services/groupsService';

interface Member { userId: string; role: 'owner' | 'member' }
interface Group { _id: string; name: string; description?: string }
interface Progress { _id: string; userId: string; surah: number; fromAyah: number; toAyah: number; completed: boolean }
interface Message { _id: string; userId: string; text: string; createdAt: string }

export default function GroupDetailScreen() {
	const route = useRoute<any>();
	const id = route.params?.id as string;
	const user = useAppSelector((s) => s.auth.user);
	const [group, setGroup] = useState<Group | null>(null);
	const [members, setMembers] = useState<Member[]>([]);
	const [progress, setProgress] = useState<Progress[]>([]);
	const [messages, setMessages] = useState<Message[]>([]);
	const [msg, setMsg] = useState('');
	const [joinLeaveLoading, setJoinLeaveLoading] = useState(false);

	// Check if current user is a member
	const isUserMember = user && members.some(member => member.userId === user._id);

	useEffect(() => {
		(async () => {
			const res = await apiGet<{ group: Group; members: Member[] }>(`/api/reading-groups/${id}`);
			setGroup(res.group);
			setMembers(res.members);
			const p = await apiGet<Progress[]>(`/api/reading-groups/${id}/progress`);
			setProgress(p);
			const m = await apiGet<Message[]>(`/api/reading-groups/${id}/messages`);
			setMessages(m);
		})();
	}, [id]);

	async function sendMessage() {
		const text = msg.trim();
		if (!text) return;
		const m = await apiPost<Message>(`/api/reading-groups/${id}/messages`, { text });
		setMessages([m, ...messages]);
		setMsg('');
	}

	async function handleJoinGroup() {
		if (!user || joinLeaveLoading) return;
		
		try {
			setJoinLeaveLoading(true);
			await groupsService.join(id);
			// Add current user to members list
			setMembers(prev => [...prev, { userId: user._id, role: 'member' }]);
		} catch (error) {
			console.error('Failed to join group:', error);
		} finally {
			setJoinLeaveLoading(false);
		}
	}

	async function handleLeaveGroup() {
		if (!user || joinLeaveLoading) return;
		
		try {
			setJoinLeaveLoading(true);
			await groupsService.leave(id);
			// Remove current user from members list
			setMembers(prev => prev.filter(member => member.userId !== user._id));
		} catch (error) {
			console.error('Failed to leave group:', error);
		} finally {
			setJoinLeaveLoading(false);
		}
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>{group?.name}</Text>
			<Text style={{ color: '#6b7280' }}>{group?.description}</Text>

			{/* Join/Leave Button */}
			{user && (
				<View style={{ marginTop: 12 }}>
					{isUserMember ? (
						<TouchableOpacity 
							onPress={handleLeaveGroup} 
							style={[styles.primary, { backgroundColor: '#dc2626' }]}
							disabled={joinLeaveLoading}
						>
							<Text style={styles.primaryText}>
								{joinLeaveLoading ? 'Leaving...' : 'Leave'}
							</Text>
						</TouchableOpacity>
					) : (
						<TouchableOpacity 
							onPress={handleJoinGroup} 
							style={styles.primary}
							disabled={joinLeaveLoading}
						>
							<Text style={styles.primaryText}>
								{joinLeaveLoading ? 'Joining...' : 'Join'}
							</Text>
						</TouchableOpacity>
					)}
				</View>
			)}

			<Text style={styles.section}>Members</Text>
			<FlatList data={members} keyExtractor={(i) => i.userId} renderItem={({ item }) => <Text>- {item.userId} {item.role === 'owner' ? '(Owner)' : ''}</Text>} />

			<Text style={styles.section}>Progress</Text>
			<FlatList data={progress} keyExtractor={(i) => i._id} renderItem={({ item }) => <Text>Surah {item.surah}: {item.fromAyah}-{item.toAyah} {item.completed ? '✅' : '⬜'}</Text>} />

			<Text style={styles.section}>Chat</Text>
			<FlatList data={messages} keyExtractor={(i) => i._id} renderItem={({ item }) => <Text>{item.userId}: {item.text}</Text>} />
			<View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
				<TextInput value={msg} onChangeText={setMsg} placeholder="Message" style={styles.input} />
				<TouchableOpacity onPress={sendMessage} style={styles.primary}><Text style={styles.primaryText}>Send</Text></TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	title: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
	section: { marginTop: 12, fontWeight: '700' },
	input: { flex: 1, borderColor: '#e5e7eb', borderWidth: 1, borderRadius: 8, padding: 10 },
	primary: { backgroundColor: '#0E7490', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
	primaryText: { color: '#fff', fontWeight: '600' },
});