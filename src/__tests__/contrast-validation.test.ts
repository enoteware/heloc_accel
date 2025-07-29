/**
 * Tests for contrast validation system
 * 
 * Ensures the contrast validation utilities work correctly
 * and prevent unreadable color combinations.
 */

import {
  hexToRgb,
  rgbStringToRgb,
  getLuminance,
  getContrastRatio,
  validateContrast,
  isSafeCombination,
  getSafeTextColors,
  validateTailwindCombination,
  assertSafeContrast,
  SAFE_COMBINATIONS
} from '@/lib/contrast-validation';

describe('Color Conversion Functions', () => {
  describe('hexToRgb', () => {
    it('converts 6-digit hex to RGB', () => {
      expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('converts 3-digit hex to RGB', () => {
      expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('#000')).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb('#f00')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('handles hex without hash', () => {
      expect(hexToRgb('ffffff')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('fff')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('returns null for invalid hex', () => {
      expect(hexToRgb('#gggggg')).toBeNull();
      expect(hexToRgb('#12345')).toBeNull();
      expect(hexToRgb('')).toBeNull();
    });
  });

  describe('rgbStringToRgb', () => {
    it('converts rgb string to RGB object', () => {
      expect(rgbStringToRgb('rgb(255, 255, 255)')).toEqual({ r: 255, g: 255, b: 255 });
      expect(rgbStringToRgb('rgb(0, 0, 0)')).toEqual({ r: 0, g: 0, b: 0 });
      expect(rgbStringToRgb('rgb(255, 0, 0)')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('handles spaces in rgb string', () => {
      expect(rgbStringToRgb('rgb(255,255,255)')).toEqual({ r: 255, g: 255, b: 255 });
      expect(rgbStringToRgb('rgb( 255 , 255 , 255 )')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('returns null for invalid format', () => {
      expect(rgbStringToRgb('not-rgb')).toBeNull();
      expect(rgbStringToRgb('rgb(255, 255)')).toBeNull();
      expect(rgbStringToRgb('')).toBeNull();
    });
  });
});

describe('Luminance and Contrast Calculations', () => {
  describe('getLuminance', () => {
    it('calculates correct luminance for pure colors', () => {
      const whiteLum = getLuminance({ r: 255, g: 255, b: 255 });
      const blackLum = getLuminance({ r: 0, g: 0, b: 0 });
      
      expect(whiteLum).toBeCloseTo(1, 5);
      expect(blackLum).toBeCloseTo(0, 5);
      expect(whiteLum).toBeGreaterThan(blackLum);
    });

    it('calculates luminance for different colors', () => {
      const redLum = getLuminance({ r: 255, g: 0, b: 0 });
      const greenLum = getLuminance({ r: 0, g: 255, b: 0 });
      const blueLum = getLuminance({ r: 0, g: 0, b: 255 });
      
      // Green should have highest luminance due to eye sensitivity
      expect(greenLum).toBeGreaterThan(redLum);
      expect(greenLum).toBeGreaterThan(blueLum);
    });
  });

  describe('getContrastRatio', () => {
    it('calculates maximum contrast for black and white', () => {
      const white = { r: 255, g: 255, b: 255 };
      const black = { r: 0, g: 0, b: 0 };
      
      const ratio = getContrastRatio(white, black);
      expect(ratio).toBeCloseTo(21, 0); // Maximum possible contrast ratio
    });

    it('calculates minimum contrast for identical colors', () => {
      const color = { r: 128, g: 128, b: 128 };
      
      const ratio = getContrastRatio(color, color);
      expect(ratio).toBeCloseTo(1, 5); // Minimum possible contrast ratio
    });

    it('calculates contrast ratio symmetrically', () => {
      const color1 = { r: 255, g: 255, b: 255 };
      const color2 = { r: 128, g: 128, b: 128 };
      
      const ratio1 = getContrastRatio(color1, color2);
      const ratio2 = getContrastRatio(color2, color1);
      
      expect(ratio1).toBeCloseTo(ratio2, 5);
    });
  });
});

describe('Contrast Validation', () => {
  describe('validateContrast', () => {
    it('passes WCAG AA for high contrast combinations', () => {
      const result = validateContrast('#000000', '#ffffff');
      
      expect(result.isAccessible).toBe(true);
      expect(result.level).toBe('AAA');
      expect(result.ratio).toBeGreaterThan(7);
    });

    it('fails for poor contrast combinations', () => {
      const result = validateContrast('#ffffff', '#ffffff'); // White on white
      
      expect(result.isAccessible).toBe(false);
      expect(result.level).toBeNull();
      expect(result.ratio).toBe(1);
      expect(result.recommendation).toContain('below AA standard');
    });

    it('validates large text with lower threshold', () => {
      // A combo that passes for large text but not normal (AA standards)
      // Using a medium gray that has about 3.5:1 contrast with white
      const result1 = validateContrast('#949494', '#ffffff', 'large', 'AA'); // Should pass (threshold 3:1)
      const result2 = validateContrast('#949494', '#ffffff', 'normal', 'AA'); // Should fail (threshold 4.5:1)
      
      // This specific combo should pass for large text but fail for normal
      expect(result1.isAccessible).toBe(true);
      expect(result2.isAccessible).toBe(false);
    });

    it('handles invalid color formats', () => {
      const result = validateContrast('invalid-color', '#ffffff');
      
      expect(result.isAccessible).toBe(false);
      expect(result.level).toBeNull();
      expect(result.recommendation).toContain('Invalid color format');
    });
  });
});

describe('Safe Combination Checks', () => {
  describe('isSafeCombination', () => {
    it('validates pre-approved safe combinations', () => {
      expect(isSafeCombination('primary-500', 'white')).toBe(true);
      expect(isSafeCombination('white', 'neutral-900')).toBe(true);
      expect(isSafeCombination('neutral-800', 'white')).toBe(true);
    });

    it('rejects unsafe combinations', () => {
      expect(isSafeCombination('white', 'white')).toBe(false);
      expect(isSafeCombination('neutral-100', 'neutral-100')).toBe(false);
    });

    it('handles unknown combinations gracefully', () => {
      expect(isSafeCombination('unknown-color' as any, 'white')).toBe(false);
    });
  });

  describe('getSafeTextColors', () => {
    it('returns safe text colors for light backgrounds', () => {
      const safeColors = getSafeTextColors('white');
      
      expect(safeColors).toContain('neutral-900');
      expect(safeColors).toContain('primary-800');
      expect(safeColors).not.toContain('white');
    });

    it('returns safe text colors for dark backgrounds', () => {
      const safeColors = getSafeTextColors('neutral-800');
      
      expect(safeColors).toContain('white');
      expect(safeColors).toContain('neutral-50');
      expect(safeColors).not.toContain('neutral-900');
    });

    it('returns empty array for unknown backgrounds', () => {
      const safeColors = getSafeTextColors('unknown-color' as any);
      expect(safeColors).toEqual([]);
    });
  });
});

describe('Tailwind Class Validation', () => {
  describe('validateTailwindCombination', () => {
    it('identifies dangerous combinations', () => {
      const result = validateTailwindCombination('bg-white text-white');
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0]).toContain('Dangerous combination');
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('approves safe combinations', () => {
      const result = validateTailwindCombination('bg-white text-neutral-900');
      
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('detects identical colors', () => {
      const result = validateTailwindCombination('bg-neutral-100 text-neutral-100');
      
      expect(result.isValid).toBe(false);
      expect(result.issues[0]).toContain('may be unreadable');
    });

    it('handles multiple background/text classes', () => {
      const result = validateTailwindCombination('p-4 bg-white hover:bg-gray-50 text-white font-bold');
      
      expect(result.isValid).toBe(false);
    });

    it('ignores classes without color conflicts', () => {
      const result = validateTailwindCombination('p-4 font-bold rounded-lg');
      
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });
  });
});

describe('Runtime Assertions', () => {
  describe('assertSafeContrast', () => {
    it('throws in development for unsafe combinations', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      expect(() => {
        assertSafeContrast('#ffffff', '#ffffff', 'test-component');
      }).toThrow();
      
      process.env.NODE_ENV = originalEnv;
    });

    it('logs warning in production for unsafe combinations', () => {
      const originalEnv = process.env.NODE_ENV;
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      process.env.NODE_ENV = 'production';
      
      assertSafeContrast('#ffffff', '#ffffff', 'test-component');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Contrast issue in test-component')
      );
      
      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    it('passes for safe combinations', () => {
      expect(() => {
        assertSafeContrast('#000000', '#ffffff');
      }).not.toThrow();
    });
  });
});

describe('Design System Integration', () => {
  it('has safe combinations defined for all primary colors', () => {
    const primaryColors = ['primary-500', 'primary-600', 'primary-700', 'primary-800', 'primary-900'];
    
    primaryColors.forEach(color => {
      expect(SAFE_COMBINATIONS[color as keyof typeof SAFE_COMBINATIONS]).toBeDefined();
      expect(SAFE_COMBINATIONS[color as keyof typeof SAFE_COMBINATIONS]).toContain('white');
    });
  });

  it('has safe combinations for light backgrounds', () => {
    const lightBackgrounds = ['white', 'neutral-50', 'neutral-100'];
    
    lightBackgrounds.forEach(bg => {
      const safeTexts = SAFE_COMBINATIONS[bg as keyof typeof SAFE_COMBINATIONS];
      expect(safeTexts).toBeDefined();
      expect(safeTexts).toContain('neutral-900');
      expect(safeTexts).not.toContain('white');
    });
  });

  it('has safe combinations for dark backgrounds', () => {
    const darkBackgrounds = ['neutral-800', 'neutral-900'];
    
    darkBackgrounds.forEach(bg => {
      const safeTexts = SAFE_COMBINATIONS[bg as keyof typeof SAFE_COMBINATIONS];
      expect(safeTexts).toBeDefined();
      expect(safeTexts).toContain('white');
      expect(safeTexts).not.toContain('neutral-900');
    });
  });
});

describe('Edge Cases and Error Handling', () => {
  it('handles empty strings gracefully', () => {
    const result = validateContrast('', '');
    expect(result.isAccessible).toBe(false);
    expect(result.recommendation).toContain('Invalid color format');
  });

  it('handles malformed rgb values', () => {
    const result = validateContrast('rgb(300, 300, 300)', '#ffffff');
    expect(result.isAccessible).toBe(false);
  });

  it('handles case insensitive hex values', () => {
    const result1 = validateContrast('#FFFFFF', '#000000');
    const result2 = validateContrast('#ffffff', '#000000');
    
    expect(result1.ratio).toBeCloseTo(result2.ratio, 5);
  });
});