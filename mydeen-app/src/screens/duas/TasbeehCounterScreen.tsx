import React, { useState } from 'react';
import { View, Text, StyleSheet, Vibration, TouchableOpacity } from 'react-native';
import { PrimaryButton, Card } from '@/components/common';
import { useThemeColors } from '@/theme/theme';
import { useNavigation } from '@react-navigation/native';

export default function TasbeehCounterScreen() {
	const [counter, setCounter] = useState(0);
	const colors = useThemeColors();
	const navigation = useNavigation<any>();

	const incrementCounter = () => {
		Vibration.vibrate(50);
		setCounter(counter + 1);
	};

	const resetCounter = () => {
		Vibration.vibrate(50);
		setCounter(0);
	};

	return (
		<View style={styles.container}>
			<View style={styles.headerRow}>
				<TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
					<Text style={{ fontSize: 20 }}>←</Text>
				</TouchableOpacity>
				<Text style={[styles.headerTitle, { color: colors.text }]}>Tasbeeh Counter</Text>
				<View style={{ padding: 4, width: 28 }} />
			</View>

			<View style={styles.content}>
				<Card style={styles.counterCard}>
					<Text style={[styles.counterLabel, { color: colors.muted }]}>Count</Text>
					<Text style={[styles.counterValue, { color: colors.text }]}>{counter}</Text>
				</Card>

				<View style={styles.buttonContainer}>
					<PrimaryButton
						title="+1"
						onPress={incrementCounter}
						style={styles.incrementButton}
						textStyle={styles.buttonText}
					/>
					<PrimaryButton
						title="Reset"
						onPress={resetCounter}
						style={[styles.resetButton, { backgroundColor: colors.muted }]}
						textStyle={styles.buttonText}
					/>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	headerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 12,
		paddingTop: 50, // Account for status bar
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: '600',
	},
	content: {
		flex: 1,
		padding: 16,
		justifyContent: 'center',
		alignItems: 'center',
	},
	counterCard: {
		padding: 40,
		alignItems: 'center',
		marginBottom: 40,
		minWidth: 200,
	},
	counterLabel: {
		fontSize: 18,
		marginBottom: 16,
	},
	counterValue: {
		fontSize: 72,
		fontWeight: 'bold',
	},
	buttonContainer: {
		width: '100%',
		gap: 16,
	},
	incrementButton: {
		paddingVertical: 20,
	},
	resetButton: {
		paddingVertical: 16,
	},
	buttonText: {
		fontSize: 18,
		fontWeight: '600',
	},
});