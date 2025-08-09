/**
 * Logo Color Extractor Utility
 * Extracts dominant colors from logos and images for theming purposes
 */

export interface ColorInfo {
  hex: string;
  rgb: {
    r: number;
    g: number;
    b: number;
  };
  hsl: {
    h: number;
    s: number;
    l: number;
  };
  frequency: number;
}

export interface ColorPalette {
  dominant: ColorInfo;
  secondary: ColorInfo;
  accent: ColorInfo;
  background: ColorInfo;
  text: ColorInfo;
}

export interface ExtractorOptions {
  maxColors?: number;
  quality?: number;
  excludeColors?: string[];
  minSaturation?: number;
  minLightness?: number;
  maxLightness?: number;
}

class LogoColorExtractor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * Extract color palette from an image file
   */
  async extractFromFile(file: File, options: ExtractorOptions = {}): Promise<ColorPalette> {
    const imageUrl = URL.createObjectURL(file);
    try {
      const palette = await this.extractFromUrl(imageUrl, options);
      return palette;
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  }

  /**
   * Extract color palette from an image URL
   */
  async extractFromUrl(imageUrl: string, options: ExtractorOptions = {}): Promise<ColorPalette> {
    const img = await this.loadImage(imageUrl);
    return this.extractFromImage(img, options);
  }

  /**
   * Extract color palette from an HTML image element
   */
  extractFromImage(img: HTMLImageElement, options: ExtractorOptions = {}): ColorPalette {
    const {
      maxColors = 10,
      quality = 4,
      excludeColors = ['#ffffff', '#000000'],
      minSaturation = 0.2,
      minLightness = 0.1,
      maxLightness = 0.9
    } = options;

    // Set canvas size to image size
    this.canvas.width = img.width;
    this.canvas.height = img.height;

    // Draw image on canvas
    this.ctx.drawImage(img, 0, 0);

    // Get image data
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const pixels = imageData.data;

    // Extract colors with frequency
    const colorMap = new Map<string, number>();
    
    for (let i = 0; i < pixels.length; i += 4 * quality) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];

      // Skip transparent pixels
      if (a < 128) continue;

      const hex = this.rgbToHex(r, g, b);
      
      // Skip excluded colors
      if (excludeColors.includes(hex)) continue;

      // Apply saturation and lightness filters
      const hsl = this.rgbToHsl(r, g, b);
      if (hsl.s < minSaturation || hsl.l < minLightness || hsl.l > maxLightness) {
        continue;
      }

      colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
    }

    // Sort colors by frequency
    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxColors)
      .map(([hex, frequency]) => {
        const rgb = this.hexToRgb(hex);
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        return {
          hex,
          rgb,
          hsl,
          frequency
        };
      });

    // Generate palette
    return this.generatePalette(sortedColors);
  }

  /**
   * Generate a cohesive color palette from extracted colors
   */
  private generatePalette(colors: ColorInfo[]): ColorPalette {
    if (colors.length === 0) {
      return this.getDefaultPalette();
    }

    const dominant = colors[0];
    const secondary = colors[1] || this.generateSecondaryColor(dominant);
    const accent = this.generateAccentColor(dominant);
    const background = this.generateBackgroundColor(dominant);
    const text = this.generateTextColor(background);

    return {
      dominant,
      secondary,
      accent,
      background,
      text
    };
  }

  /**
   * Generate secondary color from dominant color
   */
  private generateSecondaryColor(dominant: ColorInfo): ColorInfo {
    const hsl = { ...dominant.hsl };
    hsl.h = (hsl.h + 30) % 360; // Shift hue by 30 degrees
    hsl.s = Math.max(0.3, hsl.s * 0.8); // Reduce saturation slightly
    
    const rgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
    const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
    
    return {
      hex,
      rgb,
      hsl,
      frequency: 0
    };
  }

  /**
   * Generate accent color from dominant color
   */
  private generateAccentColor(dominant: ColorInfo): ColorInfo {
    const hsl = { ...dominant.hsl };
    hsl.h = (hsl.h + 180) % 360; // Complementary color
    hsl.s = Math.min(1, hsl.s * 1.2); // Increase saturation
    hsl.l = Math.min(0.8, Math.max(0.2, hsl.l)); // Ensure good contrast
    
    const rgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
    const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
    
    return {
      hex,
      rgb,
      hsl,
      frequency: 0
    };
  }

  /**
   * Generate background color from dominant color
   */
  private generateBackgroundColor(dominant: ColorInfo): ColorInfo {
    const hsl = { ...dominant.hsl };
    hsl.s = Math.max(0.05, hsl.s * 0.2); // Very low saturation
    hsl.l = 0.95; // Very light
    
    const rgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
    const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
    
    return {
      hex,
      rgb,
      hsl,
      frequency: 0
    };
  }

  /**
   * Generate text color based on background
   */
  private generateTextColor(background: ColorInfo): ColorInfo {
    // Use dark text for light backgrounds, light text for dark backgrounds
    const lightness = background.hsl.l > 0.5 ? 0.1 : 0.9;
    const hsl = { h: 0, s: 0, l: lightness };
    
    const rgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
    const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
    
    return {
      hex,
      rgb,
      hsl,
      frequency: 0
    };
  }

  /**
   * Get default palette if no colors can be extracted
   */
  private getDefaultPalette(): ColorPalette {
    return {
      dominant: {
        hex: '#eb55ff',
        rgb: { r: 235, g: 85, b: 255 },
        hsl: { h: 295, s: 1, l: 0.67 },
        frequency: 0
      },
      secondary: {
        hex: '#f59e0b',
        rgb: { r: 245, g: 158, b: 11 },
        hsl: { h: 38, s: 0.92, l: 0.50 },
        frequency: 0
      },
      accent: {
        hex: '#06b6d4',
        rgb: { r: 6, g: 182, b: 212 },
        hsl: { h: 189, s: 0.94, l: 0.43 },
        frequency: 0
      },
      background: {
        hex: '#ffffff',
        rgb: { r: 255, g: 255, b: 255 },
        hsl: { h: 0, s: 0, l: 1 },
        frequency: 0
      },
      text: {
        hex: '#111827',
        rgb: { r: 17, g: 24, b: 39 },
        hsl: { h: 221, s: 0.39, l: 0.11 },
        frequency: 0
      }
    };
  }

  /**
   * Load image from URL
   */
  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  /**
   * Convert RGB to HEX
   */
  private rgbToHex(r: number, g: number, b: number): string {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  /**
   * Convert HEX to RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  /**
   * Convert RGB to HSL
   */
  private rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }

      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100) / 100,
      l: Math.round(l * 100) / 100
    };
  }

  /**
   * Convert HSL to RGB
   */
  private hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    h /= 360;

    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r: number, g: number, b: number;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  /**
   * Calculate color contrast ratio
   */
  calculateContrast(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    const luminance = (r: number, g: number, b: number): number => {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const l1 = luminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = luminance(rgb2.r, rgb2.g, rgb2.b);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Check if color meets WCAG contrast requirements
   */
  isAccessible(foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean {
    const contrast = this.calculateContrast(foreground, background);
    const threshold = level === 'AA' ? 4.5 : 7;
    return contrast >= threshold;
  }
}

// Export utility functions
export const extractColorsFromFile = async (
  file: File, 
  options?: ExtractorOptions
): Promise<ColorPalette> => {
  const extractor = new LogoColorExtractor();
  return extractor.extractFromFile(file, options);
};

export const extractColorsFromUrl = async (
  url: string, 
  options?: ExtractorOptions
): Promise<ColorPalette> => {
  const extractor = new LogoColorExtractor();
  return extractor.extractFromUrl(url, options);
};

export const calculateColorContrast = (color1: string, color2: string): number => {
  const extractor = new LogoColorExtractor();
  return extractor.calculateContrast(color1, color2);
};

export const isColorAccessible = (
  foreground: string, 
  background: string, 
  level: 'AA' | 'AAA' = 'AA'
): boolean => {
  const extractor = new LogoColorExtractor();
  return extractor.isAccessible(foreground, background, level);
};

// Export the main class
export { LogoColorExtractor };
export default LogoColorExtractor;
