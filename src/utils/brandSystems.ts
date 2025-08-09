/**
 * Brand System Utilities
 * Centralized brand configuration for Boujee Events
 */

// Brand Colors
export const colors = {
  // Primary Boujee Brand Colors
  primary: {
    50: '#fef7ff',
    100: '#fdeeff',
    200: '#fbddff',
    300: '#f8bbff',
    400: '#f389ff',
    500: '#eb55ff',
    600: '#d434f0',
    700: '#b521d4',
    800: '#941faa',
    900: '#7a1e88',
    950: '#500a5f',
  },
  
  // Secondary Luxury Colors
  secondary: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  
  // Neutral Colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // Status Colors
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },

  info: {
    50: '#eff6ff',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  }
};

// Typography
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    display: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
  
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
  },
  
  fontWeight: {
    thin: '100',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  }
};

// Spacing
export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
};

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  base: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
};

// Shadows
export const boxShadow = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: '0 0 #0000',
};

// Brand-specific shadows
export const brandShadows = {
  luxury: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.05)',
  boujee: '0 20px 25px -5px rgba(235, 85, 255, 0.1), 0 10px 10px -5px rgba(235, 85, 255, 0.04)',
  glow: '0 0 20px rgba(235, 85, 255, 0.3)',
};

// Gradients
export const gradients = {
  primary: 'linear-gradient(135deg, #eb55ff 0%, #f59e0b 100%)',
  secondary: 'linear-gradient(135deg, #d434f0 0%, #d97706 100%)',
  accent: 'linear-gradient(135deg, #b521d4 0%, #b45309 100%)',
  subtle: 'linear-gradient(135deg, #fef7ff 0%, #fffbeb 100%)',
  dark: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
};

// Animation durations
export const duration = {
  75: '75ms',
  100: '100ms',
  150: '150ms',
  200: '200ms',
  300: '300ms',
  500: '500ms',
  700: '700ms',
  1000: '1000ms',
};

// Z-index values
export const zIndex = {
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  auto: 'auto',
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  modal: '1040',
  popover: '1050',
  tooltip: '1060',
  toast: '1070',
};

// Component variants
export const variants = {
  button: {
    primary: {
      background: gradients.primary,
      color: 'white',
      shadow: brandShadows.boujee,
    },
    secondary: {
      background: colors.gray[100],
      color: colors.gray[900],
      shadow: boxShadow.sm,
    },
    outline: {
      background: 'transparent',
      color: colors.primary[600],
      border: `1px solid ${colors.primary[500]}`,
    },
    ghost: {
      background: 'transparent',
      color: colors.gray[700],
    },
  },
  
  card: {
    default: {
      background: 'white',
      border: `1px solid ${colors.gray[200]}`,
      borderRadius: borderRadius.lg,
      shadow: boxShadow.sm,
    },
    elevated: {
      background: 'white',
      borderRadius: borderRadius.xl,
      shadow: boxShadow.lg,
    },
    luxury: {
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(12px)',
      border: `1px solid rgba(255, 255, 255, 0.2)`,
      borderRadius: borderRadius.xl,
      shadow: brandShadows.luxury,
    },
  },
};

// Utility functions
export const getColor = (colorPath: string): string => {
  const parts = colorPath.split('.');
  let current: any = colors;
  
  for (const part of parts) {
    if (current[part] !== undefined) {
      current = current[part];
    } else {
      return colors.gray[500]; // fallback
    }
  }
  
  return typeof current === 'string' ? current : colors.gray[500];
};

export const getSpacing = (size: keyof typeof spacing): string => {
  return spacing[size] || spacing[4];
};

export const getBorderRadius = (size: keyof typeof borderRadius): string => {
  return borderRadius[size] || borderRadius.md;
};

export const getShadow = (size: keyof typeof boxShadow): string => {
  return boxShadow[size] || boxShadow.sm;
};

export const getGradient = (type: keyof typeof gradients): string => {
  return gradients[type] || gradients.primary;
};

// CSS-in-JS helpers
export const createGlassEffect = (opacity: number = 0.1) => ({
  backgroundColor: `rgba(255, 255, 255, ${opacity})`,
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
});

export const createGradientText = (gradient: string = gradients.primary) => ({
  background: gradient,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
});

export const createHoverScale = (scale: number = 1.05) => ({
  transition: `transform ${duration[200]} ease-in-out`,
  '&:hover': {
    transform: `scale(${scale})`,
  },
});

// Theme configuration
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  boxShadow,
  brandShadows,
  gradients,
  duration,
  zIndex,
  variants,
};

// Default export
export default {
  colors,
  typography,
  spacing,
  borderRadius,
  boxShadow,
  brandShadows,
  gradients,
  duration,
  zIndex,
  variants,
  utils: {
    getColor,
    getSpacing,
    getBorderRadius,
    getShadow,
    getGradient,
    createGlassEffect,
    createGradientText,
    createHoverScale,
  },
};
