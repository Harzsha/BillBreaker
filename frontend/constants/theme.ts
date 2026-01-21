/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// BillBreak AI Color Scheme
const primary = '#007AFF';
const success = '#34C759';
const danger = '#FF3B30';
const warning = '#FF9500';
const background = '#F5F5F5';
const card = '#FFFFFF';
const text = '#000000';
const textSecondary = '#666666';
const border = '#E5E5E5';
const tint = primary;

export const Colors = {
  light: {
    text,
    textSecondary,
    background,
    card,
    border,
    tint: primary,
    primary,
    success,
    danger,
    warning,
    icon: '#666666',
    tabIconDefault: '#8E8E93',
    tabIconSelected: primary,
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
    background: '#1A1A1A',
    card: '#2C2C2C',
    border: '#3E3E3E',
    tint: '#64B5F6',
    primary: '#64B5F6',
    success: '#4ADE80',
    danger: '#FF6B6B',
    warning: '#FFA500',
    icon: '#A0A0A0',
    tabIconDefault: '#8E8E93',
    tabIconSelected: '#64B5F6',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
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
  small: 8,
  medium: 12,
  large: 16,
  extraLarge: 20,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
};
