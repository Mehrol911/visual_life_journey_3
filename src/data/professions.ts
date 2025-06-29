import { ProfessionTheme } from '../types';
import { generateContrastColors, createAccessibleGradient } from '../utils/contrastUtils';

export const PROFESSIONS: ProfessionTheme[] = [
  {
    name: 'Doctor',
    colors: {
      primary: '#0066CC',
      secondary: '#4A90E2',
      accent: '#00A8CC',
      background: '#ffffff',
      text: '#1f2937',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #0066CC 0%, #4A90E2 100%)',
      secondary: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    },
    quote: "Healing is a matter of time, but it is sometimes also a matter of opportunity.",
    description: "Dedicated to healing and caring for others, making every day count in service to humanity."
  },
  {
    name: 'Teacher',
    colors: {
      primary: '#ea580c',
      secondary: '#fb923c',
      accent: '#f97316',
      background: '#ffffff',
      text: '#1f2937',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)',
      secondary: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
    },
    quote: "Education is the most powerful weapon which you can use to change the world.",
    description: "Shaping minds and inspiring futures, creating lasting impact through knowledge and wisdom."
  },
  {
    name: 'Engineer',
    colors: {
      primary: '#0f766e',
      secondary: '#14b8a6',
      accent: '#06b6d4',
      background: '#ffffff',
      text: '#1f2937',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
      secondary: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
    },
    quote: "Engineering is the art of directing the great sources of power in nature for the use of mankind.",
    description: "Building the future through innovation and precision, solving problems that shape tomorrow."
  },
  {
    name: 'Artist',
    colors: {
      primary: '#be185d',
      secondary: '#ec4899',
      accent: '#f472b6',
      background: '#ffffff',
      text: '#1f2937',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #be185d 0%, #ec4899 100%)',
      secondary: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
    },
    quote: "Art enables us to find ourselves and lose ourselves at the same time.",
    description: "Creating beauty and meaning through creativity, inspiring others with every brushstroke of life."
  },
  {
    name: 'Entrepreneur',
    colors: {
      primary: '#059669',
      secondary: '#10b981',
      accent: '#34d399',
      background: '#ffffff',
      text: '#1f2937',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      secondary: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    },
    quote: "The way to get started is to quit talking and begin doing.",
    description: "Building dreams into reality, creating value and opportunities that change the world."
  },
  {
    name: 'Writer',
    colors: {
      primary: '#92400e',
      secondary: '#d97706',
      accent: '#f59e0b',
      background: '#ffffff',
      text: '#1f2937',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #92400e 0%, #d97706 100%)',
      secondary: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    },
    quote: "The pen is mightier than the sword, and considerably easier to write with.",
    description: "Weaving stories and capturing moments, transforming thoughts into lasting words of wisdom."
  },
  {
    name: 'Scientist',
    colors: {
      primary: '#5b21b6',
      secondary: '#7c3aed',
      accent: '#a855f7',
      background: '#ffffff',
      text: '#1f2937',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)',
      secondary: 'linear-gradient(135deg, #faf5ff 0%, #e9d5ff 100%)',
    },
    quote: "Science is not only a disciple of reason but also one of romance and passion.",
    description: "Discovering truths and unlocking mysteries, pushing the boundaries of human knowledge."
  },
  {
    name: 'Chef',
    colors: {
      primary: '#dc2626',
      secondary: '#ef4444',
      accent: '#f87171',
      background: '#ffffff',
      text: '#1f2937',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
      secondary: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
    },
    quote: "Cooking is like love. It should be entered into with abandon or not at all.",
    description: "Creating culinary art that brings people together, nourishing both body and soul."
  },
  {
    name: 'Lawyer',
    colors: {
      primary: '#374151',
      secondary: '#6b7280',
      accent: '#9ca3af',
      background: '#ffffff',
      text: '#1f2937',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #374151 0%, #6b7280 100%)',
      secondary: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
    },
    quote: "Justice is truth in action.",
    description: "Defending rights and seeking justice, ensuring fairness and equality for all."
  },
  {
    name: 'Designer',
    colors: {
      primary: '#0ea5e9',
      secondary: '#38bdf8',
      accent: '#7dd3fc',
      background: '#ffffff',
      text: '#1f2937',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
      secondary: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    },
    quote: "Design is not just what it looks like and feels like. Design is how it works.",
    description: "Crafting experiences and visual stories, making the world more beautiful and functional."
  }
];

export const getThemeByProfession = (professionName: string): ProfessionTheme => {
  return PROFESSIONS.find(p => p.name === professionName) || PROFESSIONS[0];
};