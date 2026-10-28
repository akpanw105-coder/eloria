/**
 * Eloria Wellness Design System Tokens
 * Directly extracted from Stitch Design Spec (Serene Wellness)
 */

export const Colors = {
  // Brand aquatic tones
  primary: '#00696e',
  primaryContainer: '#0fa6ad',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#003437',
  inversePrimary: '#5dd8df',

  // Secondary soft aqua & accents
  secondary: '#4d6261',
  secondaryContainer: '#cfe7e5',
  onSecondaryContainer: '#536867',
  aquaTint: '#ddf5f3',
  aquaMist: '#f0faf9',

  // Tertiary
  tertiary: '#526164',
  tertiaryContainer: '#8a999c',
  onTertiary: '#ffffff',

  // Surfaces & Backgrounds
  background: '#effcfe',
  surface: '#effcfe',
  surfaceBright: '#effcfe',
  surfaceDim: '#d0dcdf',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#eaf6f8',
  surfaceContainer: '#e4f0f2',
  surfaceContainerHigh: '#deeaed',
  surfaceContainerHighest: '#d9e5e7',

  // Text / Typography
  onSurface: '#121d1f',
  onSurfaceVariant: '#3d494a',
  charcoal: '#202b2d',
  mutedSlate: '#758487',

  // Outlines & borders
  outline: '#6d797a',
  outlineVariant: '#bcc9ca',
  hairlineBorder: '#e7eeee',

  // Semantic Status
  success: '#23856d',
  successContainer: '#d4f2e8',
  warning: '#d99a36',
  warningContainer: '#fef3d6',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',
  onSuccess: '#073c30',
  onWarning: '#4d3408',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  gutterMobile: 16,
  gutterWeb: 24,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const Shadows = {
  level1: {
    shadowColor: '#0fa6ad',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  level2: {
    shadowColor: '#0fa6ad',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 4,
  },
  softAmbient: {
    shadowColor: '#202b2d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
};
