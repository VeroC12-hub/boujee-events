// Brand System and Design Tokens

export interface BrandColors {
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  secondary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  accent: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  neutral: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export interface Typography {
  fontFamily: {
    display: string;
    heading: string;
    body: string;
    mono: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
  };
  lineHeight: {
    tight: number;
    snug: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
}

export interface Spacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;
}

export interface BorderRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

export interface Shadows {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  none: string;
}

export interface BrandTheme {
  colors: BrandColors;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  shadows: Shadows;
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
}

// Boujee Events Brand Theme
export const boujeeTheme: BrandTheme = {
  colors: {
    primary: {
      50: '#fdf2f8',
      100: '#fce7f3',
      200: '#fbcfe8',
      300: '#f9a8d4',
      400: '#f472b6',
      500: '#ec4899',
      600: '#db2777',
      700: '#be185d',
      800: '#9d174d',
      900: '#831843',
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    accent: {
      50: '#fefce8',
      100: '#fef9c3',
      200: '#fef08a',
      300: '#fde047',
      400: '#facc15',
      500: '#eab308',
      600: '#ca8a04',
      700: '#a16207',
      800: '#854d0e',
      900: '#713f12',
    },
    neutral: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
    },
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
  },
  typography: {
    fontFamily: {
      display: '"Playfair Display", serif',
      heading: '"Inter", sans-serif',
      body: '"Inter", sans-serif',
      mono: '"JetBrains Mono", monospace',
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
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '2.5rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '5rem',
    '5xl': '6rem',
    '6xl': '8rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: 'none',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

// Helper Functions
export const getColorClass = (color: keyof BrandColors, shade: number = 500): string => {
  return `text-${color}-${shade}`;
};

export const getBgColorClass = (color: keyof BrandColors, shade: number = 500): string => {
  return `bg-${color}-${shade}`;
};

export const getBorderColorClass = (color: keyof BrandColors, shade: number = 500): string => {
  return `border-${color}-${shade}`;
};

export const getTextSizeClass = (size: keyof Typography['fontSize']): string => {
  return `text-${size}`;
};

export const getFontWeightClass = (weight: keyof Typography['fontWeight']): string => {
  return `font-${weight}`;
};

export const getSpacingClass = (type: 'p' | 'm' | 'px' | 'py' | 'pt' | 'pb' | 'pl' | 'pr' | 'mx' | 'my' | 'mt' | 'mb' | 'ml' | 'mr', size: keyof Spacing): string => {
  const sizeMap = {
    xs: '2',
    sm: '4',
    md: '6',
    lg: '8',
    xl: '10',
    '2xl': '12',
    '3xl': '16',
    '4xl': '20',
    '5xl': '24',
    '6xl': '32',
  };
  return `${type}-${sizeMap[size]}`;
};

export const getRoundedClass = (size: keyof BorderRadius): string => {
  if (size === 'none') return 'rounded-none';
  if (size === 'full') return 'rounded-full';
  return `rounded-${size}`;
};

export const getShadowClass = (size: keyof Shadows): string => {
  if (size === 'none') return 'shadow-none';
  return `shadow-${size}`;
};

// Component Style Builders
export const buildButtonClasses = (
  variant: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' = 'primary',
  size: 'sm' | 'md' | 'lg' = 'md',
  disabled: boolean = false
): string => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm rounded-md',
    md: 'h-10 px-4 py-2 rounded-md',
    lg: 'h-12 px-6 py-3 text-lg rounded-lg',
  };
  
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500',
    accent: 'bg-accent-500 text-white hover:bg-accent-600 focus:ring-accent-500',
    ghost: 'text-secondary-700 hover:bg-secondary-100 focus:ring-secondary-500',
    outline: 'border border-secondary-300 text-secondary-700 hover:bg-secondary-50 focus:ring-secondary-500',
  };
  
  return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`;
};

export const buildCardClasses = (
  elevated: boolean = true,
  interactive: boolean = false,
  padding: keyof Spacing = 'lg'
): string => {
  const baseClasses = 'bg-white rounded-lg border border-secondary-200';
  const shadowClass = elevated ? getShadowClass('md') : '';
  const interactiveClasses = interactive ? 'hover:shadow-lg transition-shadow cursor-pointer' : '';
  const paddingClass = getSpacingClass('p', padding);
  
  return `${baseClasses} ${shadowClass} ${interactiveClasses} ${paddingClass}`.trim();
};

export const buildInputClasses = (
  error: boolean = false,
  disabled: boolean = false
): string => {
  const baseClasses = 'w-full px-3 py-2 border rounded-md bg-white text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';
  const stateClasses = error 
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
    : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed bg-secondary-50' : '';
  
  return `${baseClasses} ${stateClasses} ${disabledClasses}`.trim();
};

// Responsive Utilities
export const buildResponsiveClasses = (classes: {
  base?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  '2xl'?: string;
}): string => {
  const responsiveClasses: string[] = [];
  
  if (classes.base) responsiveClasses.push(classes.base);
  if (classes.sm) responsiveClasses.push(`sm:${classes.sm}`);
  if (classes.md) responsiveClasses.push(`md:${classes.md}`);
  if (classes.lg) responsiveClasses.push(`lg:${classes.lg}`);
  if (classes.xl) responsiveClasses.push(`xl:${classes.xl}`);
  if (classes['2xl']) responsiveClasses.push(`2xl:${classes['2xl']}`);
  
  return responsiveClasses.join(' ');
};

// Animation Utilities
export const animations = {
  fadeIn: 'animate-in fade-in duration-200',
  fadeOut: 'animate-out fade-out duration-200',
  slideInFromRight: 'animate-in slide-in-from-right duration-300',
  slideInFromLeft: 'animate-in slide-in-from-left duration-300',
  slideInFromTop: 'animate-in slide-in-from-top duration-300',
  slideInFromBottom: 'animate-in slide-in-from-bottom duration-300',
  scaleIn: 'animate-in zoom-in-95 duration-200',
  scaleOut: 'animate-out zoom-out-95 duration-200',
};

// State-based styling
export const getStatusColorClasses = (status: 'success' | 'warning' | 'error' | 'info' | 'neutral') => {
  const colorMap = {
    success: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      icon: 'text-green-500',
    },
    warning: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      icon: 'text-yellow-500',
    },
    error: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: 'text-red-500',
    },
    info: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: 'text-blue-500',
    },
    neutral: {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200',
      icon: 'text-gray-500',
    },
  };
  
  return colorMap[status];
};

export default boujeeTheme;
