import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { duasService, DuaCategory, Dua } from '@/services/duasService';
import { Audio } from 'expo-av';
import { PrimaryButton, Card } from '@/components/common';
import { useThemeColors } from '@/theme/theme';

export default function DuasScreen() {
	const [categories, setCategories] = useState<DuaCategory[]>([]);
	const [selected, setSelected] = useState<string | null>(null);
	const [items, setItems] = useState<Dua[]>([]);
	const [counter, setCounter] = useState(0);
	const [sound, setSound] = useState<Audio.Sound | null>(null);
	const colors = useThemeColors();

	useEffect(() => {
		(async () => {
			const cats = await duasService.getCategories();
			setCategories(cats);
			if (cats[0]?._id) {
				setSelected(cats[0]._id);
				const res = await duasService.getByCategory(cats[0]._id);
				setItems(res);
			}
		})();
		return () => {
			if (sound) sound.unloadAsync();
		};
	}, []);

	async function onSelectCategory(id: string) {
		setSelected(id);
		const res = await duasService.getByCategory(id);
		setItems(res);
	}

	async function playAudio(url?: string) {
		if (!url) return;
		if (sound) await sound.unloadAsync();
		const { sound: newSound } = await Audio.Sound.createAsync({ uri: url });
		setSound(newSound);
		await newSound.playAsync();
	}

	return (
		<View style={styles.container}>
			<FlatList
				data={categories}
				keyExtractor={(i) => i._id}
				renderItem={({ item }) => (
					<TouchableOpacity 
						style={[
							styles.chip, 
							{ 
								backgroundColor: selected === item._id ? colors.primary : colors.card,
								borderColor: colors.border 
							}
						]} 
						onPress={() => onSelectCategory(item._id)}
					>
						<Text style={[
							styles.chipText, 
							{ color: selected === item._id ? '#fff' : colors.text }
						]}>
							{item.name}
						</Text>
					</TouchableOpacity>
				)}
				horizontal
				style={{ maxHeight: 50, marginVertical: 8 }}
			/>

			<FlatList
				data={items}
				keyExtractor={(i) => i._id}
				renderItem={({ item }) => (
					<Card style={styles.duaRow}>
						<Text style={[styles.duaTitle, { color: colors.text }]}>{item.title}</Text>
						<Text style={styles.arabic}>{item.arabic}</Text>
						{item.translation ? <Text style={[styles.translation, { color: colors.muted }]}>{item.translation}</Text> : null}
						<View style={styles.buttonRow}>
							<PrimaryButton 
								title={`Dhikr + (${counter})`}
								onPress={() => setCounter(counter + 1)}
								style={styles.actionBtn}
								textStyle={styles.actionBtnText}
							/>
							<PrimaryButton 
								title="Play"
								onPress={() => playAudio(item.audioUrl)}
								style={styles.actionBtn}
								textStyle={styles.actionBtnText}
							/>
						</View>
					</Card>
				)}
				ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.muted }]}>No duas</Text>}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	chip: { 
		paddingHorizontal: 12, 
		paddingVertical: 6, 
		borderRadius: 16, 
		marginRight: 8,
		borderWidth: 1,
	},
	chipText: { 
		fontSize: 14,
		fontWeight: '500',
	},
	duaRow: { 
		marginBottom: 12,
	},
	duaTitle: {
		fontWeight: '600',
		marginBottom: 8,
	},
	arabic: {
		textAlign: 'right',
		fontSize: 18,
		marginBottom: 8,
	},
	translation: {
		marginBottom: 8,
	},
	buttonRow: {
		flexDirection: 'row',
		gap: 12,
		marginTop: 8,
	},
	actionBtn: {
		flex: 1,
		paddingVertical: 8,
	},
	actionBtnText: {
		fontSize: 14,
	},
	emptyText: {
		padding: 16,
		textAlign: 'center',
	},
});