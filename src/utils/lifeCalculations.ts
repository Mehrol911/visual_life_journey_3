import { differenceInDays, differenceInYears, parse, isValid } from 'date-fns';
import { LifeStats } from '../types';

const AVERAGE_LIFESPAN_DAYS = 32850; // 90 years × 365 days
const AVERAGE_LIFESPAN_YEARS = 90;

export const calculateLifeStats = (birthDate: string): LifeStats => {
  // Parse the date string (format: YYYY-MM-DD)
  const birth = new Date(birthDate);
  const today = new Date();
  
  // Validate the date
  if (!isValid(birth) || birth > today) {
    throw new Error('Invalid birth date');
  }
  
  // Validate date range (1900-2025)
  const birthYear = birth.getFullYear();
  if (birthYear < 1900 || birthYear > 2025) {
    throw new Error('Birth year must be between 1900 and 2025');
  }
  
  const days_lived = differenceInDays(today, birth);
  const current_age = differenceInYears(today, birth);
  const days_remaining = Math.max(0, AVERAGE_LIFESPAN_DAYS - days_lived);
  const years_remaining = Math.max(0, AVERAGE_LIFESPAN_YEARS - current_age);
  const life_percentage = Math.min(100, (days_lived / AVERAGE_LIFESPAN_DAYS) * 100);
  
  return {
    days_lived,
    days_remaining,
    current_age,
    life_percentage,
    years_remaining
  };
};

export const getLifePhase = (age: number): string => {
  if (age < 18) return 'Youth';
  if (age < 30) return 'Young Adult';
  if (age < 50) return 'Adult';
  if (age < 65) return 'Middle Age';
  return 'Elder';
};

export const getLifePhaseMessage = (age: number): string => {
  const phase = getLifePhase(age);
  
  const messages = {
    'Youth': 'The time of dreams and endless possibilities. Plant the seeds of your future.',
    'Young Adult': 'The time of growth and discovery. Shape yourself through experiences.',
    'Adult': 'The time of building and creating. Make your mark on the world.',
    'Middle Age': 'The time of wisdom and reflection. Share your knowledge with others.',
    'Elder': 'The time of legacy and peace. Your wisdom is a gift to the world.'
  };
  
  return messages[phase as keyof typeof messages] || messages['Adult'];
};

// Utility function to validate date input
export const isValidDateRange = (dateString: string): boolean => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const today = new Date();
  
  return isValid(date) && 
         year >= 1900 && 
         year <= 2025 && 
         date <= today;
};

// Get current date in YYYY-MM-DD format for max attribute
export const getCurrentDate = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Get minimum date (1900-01-01)
export const getMinDate = (): string => {
  return '1900-01-01';
};