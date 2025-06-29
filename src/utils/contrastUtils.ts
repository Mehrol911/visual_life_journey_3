// Utility functions for ensuring text contrast and readability

export interface ContrastColors {
  text: string;
  textSecondary: string;
  textMuted: string;
  background: string;
  backgroundSecondary: string;
  border: string;
}

// Calculate luminance for a color
export const getLuminance = (color: string): number => {
  // Remove # if present
  const hex = color.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  // Apply gamma correction
  const rs = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gs = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bs = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

// Calculate contrast ratio between two colors
export const getContrastRatio = (color1: string, color2: string): number => {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
};

// Check if color combination meets WCAG AA standards (4.5:1 ratio)
export const meetsContrastStandard = (textColor: string, backgroundColor: string): boolean => {
  return getContrastRatio(textColor, backgroundColor) >= 4.5;
};

// Get optimal text color for a background
export const getOptimalTextColor = (backgroundColor: string): string => {
  const luminance = getLuminance(backgroundColor);
  // Use white text for dark backgrounds, dark text for light backgrounds
  return luminance > 0.5 ? '#1f2937' : '#ffffff';
};

// Generate accessible contrast colors for any profession theme
export const generateContrastColors = (primaryColor: string, accentColor: string): ContrastColors => {
  const primaryLuminance = getLuminance(primaryColor);
  const accentLuminance = getLuminance(accentColor);
  
  // Determine if we need light or dark theme
  const isLightTheme = primaryLuminance > 0.5;
  
  if (isLightTheme) {
    // Light theme - dark text on light backgrounds
    return {
      text: '#1f2937',           // Dark gray for primary text
      textSecondary: '#374151',  // Medium gray for secondary text
      textMuted: '#6b7280',      // Light gray for muted text
      background: '#ffffff',     // White background
      backgroundSecondary: '#f9fafb', // Very light gray
      border: '#e5e7eb'          // Light border
    };
  } else {
    // Dark theme - light text on dark backgrounds
    return {
      text: '#ffffff',           // White for primary text
      textSecondary: '#f3f4f6',  // Light gray for secondary text
      textMuted: '#d1d5db',      // Medium gray for muted text
      background: '#111827',     // Dark background
      backgroundSecondary: '#1f2937', // Slightly lighter dark
      border: '#374151'          // Dark border
    };
  }
};

// Adjust color opacity while maintaining contrast
export const adjustColorOpacity = (color: string, opacity: number): string => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Create accessible gradient that maintains readability
export const createAccessibleGradient = (color1: string, color2: string): string => {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  
  // Ensure gradient doesn't create contrast issues
  if (Math.abs(lum1 - lum2) < 0.1) {
    // Colors are too similar, adjust one
    const adjustedColor2 = lum1 > 0.5 
      ? adjustColorOpacity(color2, 0.8) 
      : adjustColorOpacity(color2, 1.2);
    return `linear-gradient(135deg, ${color1} 0%, ${adjustedColor2} 100%)`;
  }
  
  return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
};