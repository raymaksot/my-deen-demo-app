import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useThemeColors } from '@/theme/theme';

interface Props {
	children: React.ReactNode;
	style?: ViewStyle;
	padding?: number;
}

export default function Card({ children, style, padding = 16 }: Props) {
	const colors = useThemeColors();
	
	return (
		<View 
			style={[
				styles.card,
				{
					backgroundColor: colors.card,
					borderColor: colors.border,
				},
				{ padding },
				style
			]}
		>
			{children}
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		borderRadius: 12,
		borderWidth: 1,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
		elevation: 5,
	},
});