import { Platform } from 'react-native';

export const COLORS = {
  // Google Stitch Heritage Color Palette
  background: '#fbf9f4',          // Primary Background: Warm Cream
  secondaryBackground: '#f0eee9', // Secondary Background: Soft Ivory
  primary: '#a04100',             // Primary Accent: Terracotta
  secondary: '#2f5e4e',           // Headings/Secondary Accent: Deep Forest Green
  accent: '#fe7f3b',              // Secondary Accent: Saffron
  gold: '#D4A373',                // Muted Gold for warnings/borders
  text: '#1b1c19',                // Primary Text: Walnut Brown
  textMuted: '#444748',           // Secondary Text: Muted Brown
  border: '#c4c7c7',              // Outline/Border color
  borderLight: '#e4e2dd',         // Muted light border
  white: '#ffffff',               // Cards: White background
  black: '#1c1b1b',               // Muted dark elements (Never pure black)
  success: '#2f5e4e',             // Success: Olive Green
  error: '#ba1a1a',               // Error: Deep Brick Red
  cardBackground: '#ffffff',
  overlay: 'rgba(27, 28, 25, 0.4)', // Muted walnut overlay
};

export const FONTS = {
  // Editorial Museum-Grade Typography
  titleLarge: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    fontWeight: '700',
    color: COLORS.secondary, // Green headings
    letterSpacing: -0.5,
  },
  title: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    fontWeight: '700',
    color: COLORS.text,
  },
  titleMedium: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
    color: COLORS.text,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
    fontWeight: '600',
    color: COLORS.text,
  },
  bodyBold: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
    fontWeight: '700',
    color: COLORS.text,
  },
  caption: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
    fontSize: 12,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  labelCaps: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: COLORS.primary,
  }
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  marginMobile: 20,
  marginDesktop: 64,
  gutterMobile: 16,
  gutterDesktop: 32,
};

export const SHADOWS = {
  soft: {
    shadowColor: '#1b1c19',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#1b1c19',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  deep: {
    shadowColor: '#1b1c19',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 8,
  },
};

export const BORDERS = {
  radiusSm: 6,
  radiusMd: 12,
  radiusLg: 18,
  radiusRound: 9999,
  widthThin: 1,
  widthThick: 2,
};

const theme = {
  COLORS,
  FONTS,
  SPACING,
  SHADOWS,
  BORDERS,
};

export default theme;
