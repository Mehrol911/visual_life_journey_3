export interface User {
  id: string;
  email: string;
  full_name: string;
  birth_date: string;
  profession: Profession;
  created_at: string;
  updated_at: string;
}

export interface Profession {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  theme: ProfessionTheme;
}

export interface ProfessionTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    success: string;
    warning: string;
    error: string;
  };
  gradients: {
    primary: string;
    secondary: string;
  };
  quote: string;
  description: string;
}

export interface DailyEntry {
  id: string;
  user_id: string;
  date: string;
  reflection: string;
  mood: number;
  goals_completed: number;
  total_goals: number;
  gratitude: string[];
  created_at: string;
  updated_at: string;
}

export interface LifeStats {
  days_lived: number;
  days_remaining: number;
  current_age: number;
  life_percentage: number;
  years_remaining: number;
}

export interface Visit {
  id: string;
  city: string;
  country: string;
  date: string;
  lat?: number;
  lng?: number;
}