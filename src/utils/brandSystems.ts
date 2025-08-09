// Brand System Configuration
export const brandColors = {
  primary: '#F59E0B', // Amber-500
  primaryDark: '#D97706', // Amber-600
  primaryLight: '#FCD34D', // Amber-300
  secondary: '#8B5CF6', // Violet-500
  secondaryDark: '#7C3AED', // Violet-600
  secondaryLight: '#A78BFA', // Violet-400
  accent: '#EC4899', // Pink-500
  dark: '#0F172A', // Slate-900
  darkLight: '#1E293B', // Slate-800
  light: '#F8FAFC', // Slate-50
  lightDark: '#E2E8F0', // Slate-200
  success: '#10B981', // Emerald-500
  warning: '#F59E0B', // Amber-500
  error: '#EF4444', // Red-500
  info: '#3B82F6', // Blue-500
};

export const brandConfig = {
  name: 'Boujee Events',
  tagline: 'Premium Event Management Platform',
  description: 'Experience luxury events with seamless management and unforgettable moments',
  logo: '/logo.png',
  favicon: '/favicon.ico',
  domain: 'boujee-events.vercel.app',
  email: 'hello@boujee-events.com',
  support: 'support@boujee-events.com',
  social: {
    twitter: '@boujeeevents',
    instagram: '@boujeeevents',
    linkedin: 'company/boujee-events',
    facebook: 'boujeeevents'
  }
};

export const brandFonts = {
  display: 'Inter', // For headings
  body: 'Inter', // For body text
  mono: 'JetBrains Mono', // For code
  sizes: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem', // 60px
  }
};

export const brandSpacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '3rem', // 48px
  '3xl': '4rem', // 64px
  '4xl': '6rem', // 96px
};

export const brandBorders = {
  radius: {
    none: '0',
    sm: '0.125rem', // 2px
    md: '0.375rem', // 6px
    lg: '0.5rem', // 8px
    xl: '0.75rem', // 12px
    '2xl': '1rem', // 16px
    '3xl': '1.5rem', // 24px
    full: '9999px'
  },
  width: {
    0: '0',
    1: '1px',
    2: '2px',
    4: '4px',
    8: '8px'
  }
};

export const brandShadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  glow: '0 0 20px rgb(245 158 11 / 0.5)', // Amber glow
  glowPurple: '0 0 20px rgb(139 92 246 / 0.5)', // Purple glow
};

export const brandAnimations = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '1000ms'
  },
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
};

export const brandBreakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// Utility functions for brand system
export const getBrandColor = (color: keyof typeof brandColors) => {
  return brandColors[color];
};

export const getBrandConfig = (key: keyof typeof brandConfig) => {
  return brandConfig[key];
};

export const createGradient = (from: string, to: string, direction = 'to right') => {
  return `linear-gradient(${direction}, ${from}, ${to})`;
};

export const brandGradients = {
  primary: createGradient(brandColors.primary, brandColors.primaryDark),
  secondary: createGradient(brandColors.secondary, brandColors.secondaryDark),
  sunset: createGradient(brandColors.primary, brandColors.accent),
  ocean: createGradient(brandColors.secondary, brandColors.info),
  dark: createGradient(brandColors.dark, brandColors.darkLight),
  light: createGradient(brandColors.light, brandColors.lightDark)
};

// Component styling presets
export const brandComponents = {
  button: {
    primary: {
      backgroundColor: brandColors.primary,
      color: brandColors.dark,
      border: `1px solid ${brandColors.primaryDark}`,
      borderRadius: brandBorders.radius.lg,
      padding: `${brandSpacing.md} ${brandSpacing.xl}`,
      fontSize: brandFonts.sizes.base,
      fontWeight: '600',
      transition: `all ${brandAnimations.duration.normal} ${brandAnimations.easing.easeInOut}`,
      boxShadow: brandShadows.md
    },
    secondary: {
      backgroundColor: 'transparent',
      color: brandColors.primary,
      border: `2px solid ${brandColors.primary}`,
      borderRadius: brandBorders.radius.lg,
      padding: `${brandSpacing.md} ${brandSpacing.xl}`,
      fontSize: brandFonts.sizes.base,
      fontWeight: '600',
      transition: `all ${brandAnimations.duration.normal} ${brandAnimations.easing.easeInOut}`
    }
  },
  card: {
    default: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: brandBorders.radius['2xl'],
      padding: brandSpacing.xl,
      boxShadow: brandShadows.lg
    },
    elevated: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: brandBorders.radius['2xl'],
      padding: brandSpacing['2xl'],
      boxShadow: brandShadows.xl
    }
  }
};

export default {
  colors: brandColors,
  config: brandConfig,
  fonts: brandFonts,
  spacing: brandSpacing,
  borders: brandBorders,
  shadows: brandShadows,
  animations: brandAnimations,
  breakpoints: brandBreakpoints,
  gradients: brandGradients,
  components: brandComponents,
  getBrandColor,
  getBrandConfig,
  createGradient
};
