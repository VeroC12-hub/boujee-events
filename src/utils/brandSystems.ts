/**
 * Brand Systems Utilities
 * Defines the visual identity and design system for Boujee Events
 */

// Brand Colors
export const brandColors = {
  // Primary Boujee Brand Colors
  boujee: {
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
  
  // Luxury Gold/Yellow Accents
  luxury: {
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
  neutral: {
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
  }
};

// Typography System
export const typography = {
  fontFamilies: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    display: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
  
  fontSizes: {
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
  
  fontWeights: {
    thin: '100',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  lineHeights: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  }
};

// Spacing System
export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
  '4xl': '6rem',
  '5xl': '8rem',
};

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
};

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  luxury: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.05)',
  boujee: '0 20px 25px -5px rgba(235, 85, 255, 0.1), 0 10px 10px -5px rgba(235, 85, 255, 0.04)',
};

// Gradients
export const gradients = {
  primary: 'linear-gradient(135deg, #eb55ff 0%, #f59e0b 100%)',
  secondary: 'linear-gradient(135deg, #d434f0 0%, #d97706 100%)',
  accent: 'linear-gradient(135deg, #b521d4 0%, #b45309 100%)',
  subtle: 'linear-gradient(135deg, #fef7ff 0%, #fffbeb 100%)',
};

// Animation Durations
export const animations = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  slower: '750ms',
};

// Component Variants
export const componentVariants = {
  button: {
    primary: {
      backgroundColor: brandColors.boujee[500],
      color: '#ffffff',
      border: 'none',
      gradient: gradients.primary,
    },
    secondary: {
      backgroundColor: brandColors.luxury[500],
      color: '#ffffff',
      border: 'none',
      gradient: gradients.secondary,
    },
    outline: {
      backgroundColor: 'transparent',
      color: brandColors.boujee[600],
      border: `2px solid ${brandColors.boujee[500]}`,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: brandColors.boujee[600],
      border: 'none',
    },
  },
  
  card: {
    default: {
      backgroundColor: '#ffffff',
      border: `1px solid ${brandColors.neutral[200]}`,
      borderRadius: borderRadius.lg,
      boxShadow: shadows.md,
    },
    luxury: {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(12px)',
      border: `1px solid rgba(255, 255, 255, 0.2)`,
      borderRadius: borderRadius.xl,
      boxShadow: shadows.luxury,
    },
    boujee: {
      background: gradients.subtle,
      border: `1px solid ${brandColors.boujee[200]}`,
      borderRadius: borderRadius.xl,
      boxShadow: shadows.boujee,
    },
  },
};

// Utility Functions
export const getBrandColor = (color: string, shade: number = 500): string => {
  const colorMap: Record<string, any> = {
    boujee: brandColors.boujee,
    luxury: brandColors.luxury,
    neutral: brandColors.neutral,
  };
  
  return colorMap[color]?.[shade] || brandColors.neutral[500];
};

export const getGradient = (type: keyof typeof gradients): string => {
  return gradients[type] || gradients.primary;
};

export const getShadow = (size: keyof typeof shadows): string => {
  return shadows[size] || shadows.md;
};

export const getSpacing = (size: keyof typeof spacing): string => {
  return spacing[size] || spacing.md;
};

// CSS-in-JS Utilities
export const createGlassEffect = (opacity: number = 0.1) => ({
  backgroundColor: `rgba(255, 255, 255, ${opacity})`,
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
});

export const createGradientText = (gradientType: keyof typeof gradients = 'primary') => ({
  background: getGradient(gradientType),
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
});

export const createHoverEffect = (scale: number = 1.02) => ({
  transition: `transform ${animations.normal} ease-in-out`,
  '&:hover': {
    transform: `scale(${scale})`,
  },
});

// Theme Configuration
export const lightTheme = {
  colors: {
    background: '#ffffff',
    foreground: brandColors.neutral[900],
    primary: brandColors.boujee[500],
    secondary: brandColors.luxury[500],
    muted: brandColors.neutral[100],
    border: brandColors.neutral[200],
  },
  ...typography,
  spacing,
  borderRadius,
  shadows,
  gradients,
};

export const darkTheme = {
  colors: {
    background: brandColors.neutral[900],
    foreground: brandColors.neutral[50],
    primary: brandColors.boujee[400],
    secondary: brandColors.luxury[400],
    muted: brandColors.neutral[800],
    border: brandColors.neutral[700],
  },
  ...typography,
  spacing,
  borderRadius,
  shadows,
  gradients,
};

// Export everything as a comprehensive brand system
export const brandSystem = {
  colors: brandColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  gradients,
  animations,
  variants: componentVariants,
  utils: {
    getBrandColor,
    getGradient,
    getShadow,
    getSpacing,
    createGlassEffect,
    createGradientText,
    createHoverEffect,
  },
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
};

export default brandSystem;
