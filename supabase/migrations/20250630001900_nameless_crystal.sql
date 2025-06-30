/*
  # Complete User Data Schema

  1. New Tables
    - `daily_reflections` - Store daily reflection entries
    - `books` - Store user's book library
    - `heroes` - Store user's heroes and mentors
    - `workouts` - Store workout tracking data
    - `relatives` - Store family and friends information
    - `travel_visits` - Store travel destinations
    - `user_preferences` - Store user settings and preferences

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Ensure data isolation between users

  3. Indexes
    - Add performance indexes for common queries
    - Date-based indexes for time-series data
*/

-- Daily Reflections Table
CREATE TABLE IF NOT EXISTS daily_reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  reflection text NOT NULL,
  mood integer NOT NULL CHECK (mood >= 1 AND mood <= 10),
  gratitude text[] NOT NULL DEFAULT '{}',
  goals text[] NOT NULL DEFAULT '{}',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Books Library Table
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  author text NOT NULL,
  start_date text NOT NULL, -- MM/YYYY format
  finish_date text NOT NULL, -- MM/YYYY format
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  key_takeaways text[] NOT NULL DEFAULT '{}',
  notes text,
  category text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Heroes and Mentors Table
CREATE TABLE IF NOT EXISTS heroes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  profession text NOT NULL,
  description text NOT NULL,
  key_takeaways text[] NOT NULL DEFAULT '{}',
  inspiration text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Workouts Table
CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  activity text NOT NULL,
  emoji text NOT NULL DEFAULT '💪',
  duration integer NOT NULL, -- in minutes
  intensity text NOT NULL CHECK (intensity IN ('Low', 'Medium', 'High')),
  notes text,
  calories integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Relatives Table
CREATE TABLE IF NOT EXISTS relatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  relationship text NOT NULL,
  birth_date date,
  description text,
  contact_info jsonb DEFAULT '{}',
  image_url text,
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Travel Visits Table
CREATE TABLE IF NOT EXISTS travel_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  city text NOT NULL,
  country text NOT NULL,
  visit_date text NOT NULL, -- MM/YYYY format
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  description text,
  photos text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  preferences jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE daily_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE heroes ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE relatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for Daily Reflections
CREATE POLICY "Users can manage their own daily reflections"
  ON daily_reflections
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS Policies for Books
CREATE POLICY "Users can manage their own books"
  ON books
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS Policies for Heroes
CREATE POLICY "Users can manage their own heroes"
  ON heroes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS Policies for Workouts
CREATE POLICY "Users can manage their own workouts"
  ON workouts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS Policies for Relatives
CREATE POLICY "Users can manage their own relatives"
  ON relatives
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS Policies for Travel Visits
CREATE POLICY "Users can manage their own travel visits"
  ON travel_visits
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS Policies for User Preferences
CREATE POLICY "Users can manage their own preferences"
  ON user_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_daily_reflections_user_date ON daily_reflections(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_books_user_created ON books(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_heroes_user_created ON heroes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_relatives_user_name ON relatives(user_id, name);
CREATE INDEX IF NOT EXISTS idx_travel_visits_user_date ON travel_visits(user_id, visit_date DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_daily_reflections_updated_at BEFORE UPDATE ON daily_reflections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_heroes_updated_at BEFORE UPDATE ON heroes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON workouts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_relatives_updated_at BEFORE UPDATE ON relatives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_travel_visits_updated_at BEFORE UPDATE ON travel_visits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();