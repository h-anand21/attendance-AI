// Brutalism Design System - Inspired by reference images
// Bold, black/white/yellow/orange, thick borders, uppercase typography

export const colors = {
  // Primary palette
  black: '#000000',
  white: '#FFFFFF',
  offWhite: '#F5F5F0',
  yellow: '#FFB800',
  yellowLight: '#FFD54F',
  orange: '#FF6B35',
  orangeDark: '#E55A2B',
  
  // Semantic
  background: '#FFFFFF',
  surface: '#F5F5F0',
  text: '#000000',
  textSecondary: '#555555',
  textMuted: '#888888',
  
  // Status
  success: '#22C55E',
  successBg: '#DCFCE7',
  error: '#EF4444',
  errorBg: '#FEE2E2',
  warning: '#FFB800',
  warningBg: '#FEF9C3',
  info: '#3B82F6',
  
  // Borders
  border: '#000000',
  borderLight: '#E5E5E5',
  borderMedium: '#CCCCCC',
  
  // Shadows
  shadow: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
};

export const typography = {
  // Brutalism uses bold, heavy fonts
  hero: {
    fontSize: 36,
    fontWeight: '900' as const,
    letterSpacing: -1,
    textTransform: 'uppercase' as const,
  },
  h1: {
    fontSize: 28,
    fontWeight: '900' as const,
    letterSpacing: -0.5,
    textTransform: 'uppercase' as const,
  },
  h2: {
    fontSize: 22,
    fontWeight: '800' as const,
    letterSpacing: 0,
    textTransform: 'uppercase' as const,
  },
  h3: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodyBold: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '800' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  small: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
};

export const shadows = {
  brutal: {
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  brutalSmall: {
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  brutalLarge: {
    shadowColor: '#000000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
  },
  soft: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
};

export const borders = {
  thin: {
    borderWidth: 1,
    borderColor: colors.black,
  },
  medium: {
    borderWidth: 2,
    borderColor: colors.black,
  },
  thick: {
    borderWidth: 3,
    borderColor: colors.black,
  },
  extraThick: {
    borderWidth: 4,
    borderColor: colors.black,
  },
};
