import { useEffect, useState } from 'react';

interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
}

interface ExtractedColors {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  luminance: number;
  frequency: number;
}

class LogoColorExtractor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = context;
  }

  /**
   * Extract colors from logo image
   */
  async extractColors(imageSrc: string): Promise<ColorPalette> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const colors = this.processImage(img);
          const palette = this.generatePalette(colors);
          resolve(palette);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = imageSrc;
    });
  }

  /**
   * Process the image and extract color data
   */
  private processImage(img: HTMLImageElement): ExtractedColors[] {
    // Set canvas size to image size
    this.canvas.width = img.width;
    this.canvas.height = img.height;

    // Draw image to canvas
    this.ctx.drawImage(img, 0, 0);

    // Get image data
    const imageData = this.ctx.getImageData(0, 0, img.width, img.height);
    const data = imageData.data;

    // Extract colors
    const colorMap = new Map<string, { count: number; rgb: { r: number; g: number; b: number } }>();

    // Sample every 4th pixel to improve performance
    for (let i = 0; i < data.length; i += 16) { // 16 = 4 pixels * 4 channels
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      // Skip transparent pixels
      if (a < 128) continue;

      // Group similar colors to reduce noise
      const groupedColor = this.groupColor({ r, g, b });
      const key = `${groupedColor.r}-${groupedColor.g}-${groupedColor.b}`;

      if (colorMap.has(key)) {
        colorMap.get(key)!.count++;
      } else {
        colorMap.set(key, { count: 1, rgb: groupedColor });
      }
    }

    // Convert to ExtractedColors array and sort by frequency
    const extractedColors: ExtractedColors[] = [];
    const totalPixels = data.length / 4;

    colorMap.forEach((value, key) => {
      const { r, g, b } = value.rgb;
      
      // Skip very light or very dark colors (likely background/noise)
      const luminance = this.calculateLuminance(r, g, b);
      if (luminance > 0.95 || luminance < 0.05) return;

      extractedColors.push({
        hex: this.rgbToHex(r, g, b),
        rgb: { r, g, b },
        hsl: this.rgbToHsl(r, g, b),
        luminance,
        frequency: value.count / totalPixels
      });
    });

    return extractedColors
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 20); // Keep top 20 colors
  }

  /**
   * Group similar colors together to reduce noise
   */
  private groupColor(rgb: { r: number; g: number; b: number }): { r: number; g: number; b: number } {
    const groupSize = 20; // Group colors within 20 values
    return {
      r: Math.round(rgb.r / groupSize) * groupSize,
      g: Math.round(rgb.g / groupSize) * groupSize,
      b: Math.round(rgb.b / groupSize) * groupSize
    };
  }

  /**
   * Generate a cohesive color palette from extracted colors
   */
  private generatePalette(colors: ExtractedColors[]): ColorPalette {
    if (colors.length === 0) {
      // Fallback to default Boujee Events colors
      return {
        primary: '#D4AF37',   // Gold
        secondary: '#F5F5DC', // Beige
        accent: '#B8860B',    // Dark Goldenrod
        background: '#FFFEF7', // Ivory
        text: '#2D3748',      // Dark Gray
        muted: '#718096'      // Medium Gray
      };
    }

    // Find dominant warm color (likely gold/yellow from logo)
    const warmColors = colors.filter(color => {
      const { h } = color.hsl;
      return (h >= 35 && h <= 65) || (h >= 15 && h <= 45); // Gold/yellow/orange range
    });

    // Primary: Most frequent warm color or most frequent overall
    const primary = warmColors.length > 0 ? warmColors[0] : colors[0];

    // Secondary: Lighter version of primary or a complementary neutral
    const secondary = this.generateSecondaryColor(primary);

    // Accent: Darker/more saturated version of primary
    const accent = this.generateAccentColor(primary);

    // Background: Very light neutral
    const background = this.generateBackgroundColor(primary);

    // Text: Dark color with good contrast
    const text = this.generateTextColor();

    // Muted: Medium gray for secondary text
    const muted = this.generateMutedColor();

    return {
      primary: primary.hex,
      secondary: secondary,
      accent: accent,
      background: background,
      text: text,
      muted: muted
    };
  }

  /**
   * Generate secondary color (lighter version of primary)
   */
  private generateSecondaryColor(primary: ExtractedColors): string {
    const {
