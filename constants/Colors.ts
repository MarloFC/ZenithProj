// Zenith Timer - Premium Color Palette
// System-adaptive theming (Option C)

const accentPrimary = '#6366F1'; // Indigo - primary brand color
const accentSecondary = '#22D3EE'; // Cyan - energy/active state
const successGreen = '#10B981'; // Emerald - completed sets
const warningOrange = '#F59E0B'; // Amber - timer warning
const errorRed = '#EF4444'; // Red - errors

export const Colors = {
  light: {
    // Core
    text: '#1F2937',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    background: '#F9FAFB',
    backgroundSecondary: '#FFFFFF',
    card: '#FFFFFF',
    border: '#E5E7EB',
    
    // Accent
    tint: accentPrimary,
    primary: accentPrimary,
    secondary: accentSecondary,
    
    // Semantic
    success: successGreen,
    warning: warningOrange,
    error: errorRed,
    
    // Timer specific
    timerActive: accentPrimary,
    timerWarning: warningOrange,
    timerComplete: successGreen,
    timerBackground: '#E0E7FF',
    timerTrack: '#E5E7EB',
    
    // Tab bar
    tabIconDefault: '#9CA3AF',
    tabIconSelected: accentPrimary,
    tabBackground: '#FFFFFF',
  },
  dark: {
    // Core
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    background: '#0F172A',
    backgroundSecondary: '#1E293B',
    card: '#1E293B',
    border: '#374151',
    
    // Accent
    tint: accentSecondary,
    primary: accentPrimary,
    secondary: accentSecondary,
    
    // Semantic
    success: successGreen,
    warning: warningOrange,
    error: errorRed,
    
    // Timer specific
    timerActive: accentSecondary,
    timerWarning: warningOrange,
    timerComplete: successGreen,
    timerBackground: '#1E1B4B',
    timerTrack: '#374151',
    
    // Tab bar
    tabIconDefault: '#6B7280',
    tabIconSelected: accentSecondary,
    tabBackground: '#1E293B',
  },
};

export type ColorScheme = keyof typeof Colors;
export type ThemeColors = typeof Colors.light;

export default Colors;
