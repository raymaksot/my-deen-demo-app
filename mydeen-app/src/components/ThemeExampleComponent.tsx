import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme, useThemeColors, useFontScale } from '@/theme/theme';
import { useThemeContext } from '@/theme/ThemeContext';

/**
 * Example component demonstrating different ways to access theme values
 */
export default function ThemeExampleComponent() {
  // Method 1: Use individual hooks
  const colors = useThemeColors();
  const fontScale = useFontScale();
  
  // Method 2: Use combined theme hook
  const theme = useTheme();
  
  // Method 3: Use theme context (when wrapped in ThemeProvider)
  // const themeContext = useThemeContext();

  const dynamicStyles = StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      margin: 16,
    },
    title: {
      fontSize: 18 * fontScale,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    text: {
      fontSize: 14 * fontScale,
      color: colors.text,
      marginBottom: 4,
    },
    mutedText: {
      fontSize: 12 * fontScale,
      color: colors.muted,
      marginBottom: 8,
    },
    card: {
      backgroundColor: colors.card,
      padding: 12,
      borderRadius: 6,
      marginVertical: 8,
    },
    button: {
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 6,
      alignItems: 'center',
      marginTop: 8,
    },
    buttonText: {
      color: colors.background,
      fontSize: 16 * fontScale,
      fontWeight: '600',
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.title}>Theme Example Component</Text>
      
      <Text style={dynamicStyles.text}>
        Current theme mode: {theme.highContrast ? 'High Contrast ' : ''}{theme.colors === colors ? 'Same colors' : 'Different colors'}
      </Text>
      
      <Text style={dynamicStyles.mutedText}>
        Font scale: {fontScale.toFixed(1)}x
      </Text>
      
      <Text style={dynamicStyles.mutedText}>
        High contrast: {theme.highContrast ? 'Enabled' : 'Disabled'}
      </Text>

      <View style={dynamicStyles.card}>
        <Text style={dynamicStyles.text}>This is a card component</Text>
        <Text style={dynamicStyles.mutedText}>
          It automatically adapts to the current theme and font size
        </Text>
      </View>

      <TouchableOpacity style={dynamicStyles.button}>
        <Text style={dynamicStyles.buttonText}>Themed Button</Text>
      </TouchableOpacity>
    </View>
  );
}