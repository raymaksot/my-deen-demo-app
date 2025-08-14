import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useThemeColors } from '@/theme/theme';

interface Props {
	title: string;
	onPress: () => void;
	loading?: boolean;
	disabled?: boolean;
	style?: ViewStyle;
	textStyle?: TextStyle;
}

export default function PrimaryButton({ title, onPress, loading, disabled, style, textStyle }: Props) {
	const colors = useThemeColors();
	
	const isDisabled = disabled || loading;
	
	return (
		<TouchableOpacity 
			style={[
				styles.button, 
				{ backgroundColor: colors.primary },
				isDisabled && { backgroundColor: colors.primary + '60' },
				style
			]} 
			onPress={onPress} 
			disabled={isDisabled}
		>
			{loading ? (
				<ActivityIndicator color="#fff" />
			) : (
				<Text style={[styles.text, textStyle]}>{title}</Text>
			)}
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	button: {
		paddingVertical: 14,
		paddingHorizontal: 16,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	text: {
		color: '#fff',
		fontWeight: '600',
		fontSize: 16,
	},
});