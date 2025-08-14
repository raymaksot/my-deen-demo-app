import React from 'react';
import { TextInput, StyleSheet, ViewStyle, TextStyle, Text, View } from 'react-native';
import { useThemeColors } from '@/theme/theme';

interface Props {
	value: string;
	onChangeText: (text: string) => void;
	placeholder?: string;
	label?: string;
	multiline?: boolean;
	secureTextEntry?: boolean;
	style?: ViewStyle;
	inputStyle?: TextStyle;
	autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
	keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
}

export default function TextInputField({ 
	value, 
	onChangeText, 
	placeholder, 
	label,
	multiline, 
	secureTextEntry,
	style, 
	inputStyle,
	autoCapitalize = 'sentences',
	keyboardType = 'default'
}: Props) {
	const colors = useThemeColors();
	
	const hasValue = value.length > 0;
	
	return (
		<View style={style}>
			{label && (
				<Text style={[styles.label, { color: colors.text }]}>{label}</Text>
			)}
			<TextInput
				value={value}
				onChangeText={onChangeText}
				placeholder={placeholder}
				placeholderTextColor={colors.muted}
				multiline={multiline}
				secureTextEntry={secureTextEntry}
				autoCapitalize={autoCapitalize}
				keyboardType={keyboardType}
				style={[
					styles.input,
					{
						borderColor: hasValue ? colors.primary : colors.border,
						backgroundColor: colors.background === '#0B1220' 
							? (hasValue ? '#0E3b47' : '#1F2937')
							: (hasValue ? '#ecfdf5' : '#f9fafb'),
						color: colors.text,
					},
					multiline && styles.multiline,
					inputStyle
				]}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	label: {
		marginBottom: 4,
		marginTop: 12,
		fontWeight: '600',
		fontSize: 14,
	},
	input: {
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 12,
		fontSize: 16,
	},
	multiline: {
		minHeight: 80,
		textAlignVertical: 'top',
	},
});