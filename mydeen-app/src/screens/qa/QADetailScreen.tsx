import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { qaService, QAItem } from '@/services/qaService';
import { useAppSelector } from '@/store/hooks';
import { CommentsThread } from '@/components/CommentsThread';
import { useOfflineSync } from '@/offline/useOfflineSync';
import { PrimaryButton, TextInputField } from '@/components/common';

export default function QADetailScreen() {
	const route = useRoute<any>();
	const id = route.params?.id as string;
	const [item, setItem] = useState<QAItem | null>(null);
	const [answer, setAnswer] = useState('');
	const [loading, setLoading] = useState(false);
	const user = useAppSelector((s) => s.auth.user);
	const [answerLikes, setAnswerLikes] = useState(0);
	const [liked, setLiked] = useState(false);
	const { pending } = useOfflineSync();

	useEffect(() => {
		(async () => {
			const res = await qaService.get(id);
			setItem(res);
			
			// Reset like state - will be populated when user interacts or if we fetch it separately
			setAnswerLikes(0);
			setLiked(false);
		})();
	}, [id]);

	async function submit() {
		if (!answer.trim()) return;
		setLoading(true);
		try {
			const updated = await qaService.answer(id, answer.trim());
			setItem(updated);
			setAnswer('');
		} finally {
			setLoading(false);
		}
	}

	async function toggleLike() {
		if (!item?._id) return;
		try {
			const result = await qaService.toggleLikeAnswer(item._id);
			setAnswerLikes(result.likesCount);
			setLiked(result.liked);
		} catch (error) {
			console.error('Failed to toggle like:', error);
		}
	}

	const canAnswer = user?.role === 'scholar' || user?.role === 'admin';

	return (
		<View style={styles.container}>
			<Text style={styles.title}>{item?.title}</Text>
			<Text style={styles.q}>{item?.question}</Text>
			<Text style={styles.section}>Answer</Text>
			<Text>{item?.answer || 'Not answered yet'}</Text>
			{item?.answer && (
				<View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
					<TouchableOpacity 
						onPress={toggleLike}
						style={styles.likeBtn}
					>
						<Text style={{ color: liked ? '#ef4444' : '#6b7280' }}>❤️ {answerLikes}</Text>
					</TouchableOpacity>
				</View>
			)}
			{canAnswer && (
				<View style={{ marginTop: 12 }}>
					<TextInputField 
						value={answer} 
						onChangeText={setAnswer} 
						placeholder="Write your answer" 
						multiline 
					/>
					<PrimaryButton 
						title={loading ? 'Submitting…' : 'Submit'}
						onPress={submit} 
						loading={loading}
						style={{ marginTop: 8 }}
					/>
				</View>
			)}
			<Text style={styles.section}>Comments {pending ? `(queue: ${pending})` : ''}</Text>
			{item?._id ? (
				<CommentsThread parentType="qaAnswer" parentId={item._id} canEdit={(c) => c.userId === user?._id || user?.role === 'admin'} />
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
	q: { marginBottom: 12 },
	section: { fontSize: 16, fontWeight: '700', marginTop: 12, marginBottom: 8 },
	likeBtn: { paddingVertical: 6, paddingHorizontal: 10 },
});