import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useThemeColors } from '@/theme/theme';

interface Props {
	title: string;
	onPress: () => void;
	disabled?: boolean;
	style?: ViewStyle;
	textStyle?: TextStyle;
}

export default function SecondaryButton({ title, onPress, disabled, style, textStyle }: Props) {
	const colors = useThemeColors();
	
	return (
		<TouchableOpacity 
			style={[
				styles.button, 
				{ 
					borderColor: colors.border,
					backgroundColor: colors.background === '#0B1220' ? 'rgba(255,255,255,0.1)' : '#fff'
				},
				disabled && { opacity: 0.6 },
				style
			]} 
			onPress={onPress} 
			disabled={disabled}
		>
			<Text style={[styles.text, { color: colors.text }, textStyle]}>{title}</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	button: {
		paddingVertical: 14,
		paddingHorizontal: 16,
		borderRadius: 8,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	text: {
		fontWeight: '600',
		fontSize: 16,
	},
});