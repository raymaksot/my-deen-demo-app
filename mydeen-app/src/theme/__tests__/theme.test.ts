import { 
  fontSizeMultipliers, 
  lightTheme, 
  darkTheme, 
  lightHighContrastTheme, 
  darkHighContrastTheme 
} from '../constants';

describe('theme', () => {
  it('should have correct font size multipliers', () => {
    expect(fontSizeMultipliers.small).toBe(0.85);
    expect(fontSizeMultipliers.medium).toBe(1.0);
    expect(fontSizeMultipliers.large).toBe(1.2);
  });

  it('should have all required theme properties', () => {
    expect(typeof fontSizeMultipliers).toBe('object');
    expect(Object.keys(fontSizeMultipliers)).toEqual(['small', 'medium', 'large']);
  });

  it('should have high contrast themes', () => {
    expect(lightHighContrastTheme.colors.text).toBe('#000000');
    expect(lightHighContrastTheme.colors.background).toBe('#FFFFFF');
    expect(darkHighContrastTheme.colors.text).toBe('#FFFFFF');
    expect(darkHighContrastTheme.colors.background).toBe('#000000');
  });

  it('should have distinct colors between normal and high contrast themes', () => {
    expect(lightTheme.colors.text).not.toBe(lightHighContrastTheme.colors.text);
    expect(darkTheme.colors.text).not.toBe(darkHighContrastTheme.colors.text);
  });
});