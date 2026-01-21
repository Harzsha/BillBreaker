/**
 * Modern, Accessible Color Scheme
 * Soft, neutral tones with proper WCAG contrast ratios
 */

import { Platform } from 'react-native';

// Modern Palette - Soft and Accessible
// Primary: Calm blue-green (accessible and modern)
const primary = '#2563EB'; // Soft blue
const primaryLight = '#DBEAFE'; // Very light blue
const primaryDark = '#1E40AF'; // Dark blue for contrast

// Secondary: Warm accent
const secondary = '#F59E0B'; // Warm amber
const secondaryLight = '#FEF3C7';

// Status colors - accessible
const success = '#10B981'; // Accessible green
const successLight = '#D1FAE5';
const danger = '#EF4444'; // Accessible red
const dangerLight = '#FEE2E2';
const warning = '#F59E0B'; // Accessible orange
const warningLight = '#FEF3C7';

// Neutrals - soft and clean
const background = '#F8FAFC'; // Very soft light blue-gray
const card = '#FFFFFF'; // Clean white
const text = '#1E293B'; // Dark slate (not pure black for comfort)
const textSecondary = '#64748B'; // Medium slate
const textTertiary = '#94A3B8'; // Light slate
const border = '#E2E8F0'; // Soft border
const divider = '#CBD5E1'; // Subtle divider

// Dark mode - accessible
const darkBackground = '#0F172A'; // Very dark slate
const darkCard = '#1E293B'; // Dark slate
const darkText = '#F1F5F9'; // Off-white
const darkTextSecondary = '#CBD5E1'; // Light slate
const darkBorder = '#334155'; // Medium-dark slate

const tint = primary;

export const Colors = {
  light: {
    // Primary colors
    text,
    textSecondary,
    textTertiary,
    background,
    card,
    border,
    divider,
    tint: primary,
    primary,
    primaryLight,
    primaryDark,
    
    // Secondary colors
    secondary,
    secondaryLight,
    
    // Status colors
    success,
    successLight,
    danger,
    dangerLight,
    warning,
    warningLight,
    
    // UI elements
    icon: textSecondary,
    tabIconDefault: textTertiary,
    tabIconSelected: primary,
  },
  dark: {
    // Primary colors
    text: darkText,
    textSecondary: darkTextSecondary,
    textTertiary: '#94A3B8',
    background: darkBackground,
    card: darkCard,
    border: darkBorder,
    divider: '#475569',
    tint: '#60A5FA',
    primary: '#60A5FA',
    primaryLight: '#1E3A8A',
    primaryDark: '#93C5FD',
    
    // Secondary colors
    secondary: '#FBBF24',
    secondaryLight: '#78350F',
    
    // Status colors
    success: '#34D399',
    successLight: '#064E3B',
    danger: '#F87171',
    dangerLight: '#7F1D1D',
    warning: '#FBBF24',
    warningLight: '#78350F',
    
    // UI elements
    icon: darkTextSecondary,
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#60A5FA',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const BORDER_RADIUS = {
  small: 6,
  medium: 10,
  large: 14,
  extraLarge: 18,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
};

// Typography presets for consistency
export const TYPOGRAPHY = {
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  
  // Body
  bodyLarge: {
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 26,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  
  // Labels
  label: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  labelSmall: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
  },
};
