/*
  # Profile Update Tracking System

  1. New Table
    - `profile_updates` - Track user profile update history
    
  2. Security
    - Enable RLS on profile_updates table
    - Add policies for authenticated users to view their own update history
    
  3. Constraints
    - Limit users to maximum 3 profile updates
    - Track update timestamps and details
*/

-- Profile Updates Tracking Table
CREATE TABLE IF NOT EXISTS profile_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  update_type text NOT NULL, -- 'name', 'birth_date', 'profession', 'full_profile'
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profile_updates ENABLE ROW LEVEL SECURITY;

-- Create RLS Policy for Profile Updates
CREATE POLICY "Users can view their own profile updates"
  ON profile_updates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profile_updates_user_created ON profile_updates(user_id, created_at DESC);

-- Function to count user profile updates
CREATE OR REPLACE FUNCTION get_user_profile_update_count(user_uuid uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT DATE(created_at))
    FROM profile_updates 
    WHERE user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log profile updates
CREATE OR REPLACE FUNCTION log_profile_update(
  user_uuid uuid,
  update_type_param text,
  old_value_param jsonb DEFAULT NULL,
  new_value_param jsonb DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO profile_updates (user_id, update_type, old_value, new_value)
  VALUES (user_uuid, update_type_param, old_value_param, new_value_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;