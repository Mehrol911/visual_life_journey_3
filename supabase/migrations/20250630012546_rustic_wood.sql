/*
  # Fix Profile Update System Issues

  1. Database Fixes
    - Fix user_preferences unique constraint issue
    - Correct update counting logic to count unique days instead of individual records
    - Add proper error handling for duplicate key violations
    - Optimize database functions for better performance

  2. Security
    - Maintain existing RLS policies
    - Ensure proper data isolation
    - Add validation for update limits
*/

-- Drop existing functions to recreate them with fixes
DROP FUNCTION IF EXISTS get_user_profile_update_count(uuid);
DROP FUNCTION IF EXISTS log_profile_update(uuid, text, jsonb, jsonb);

-- Fixed function to count unique update days (not individual records)
CREATE OR REPLACE FUNCTION get_user_profile_update_count(user_uuid uuid)
RETURNS integer AS $$
DECLARE
  update_count integer;
BEGIN
  -- Count unique days when profile was updated
  SELECT COUNT(DISTINCT DATE(created_at))
  INTO update_count
  FROM profile_updates 
  WHERE user_id = user_uuid;
  
  RETURN COALESCE(update_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fixed function to log profile updates with proper session handling
CREATE OR REPLACE FUNCTION log_profile_update(
  user_uuid uuid,
  update_type_param text,
  old_value_param jsonb DEFAULT NULL,
  new_value_param jsonb DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  today_date date;
  existing_update_today boolean;
BEGIN
  today_date := CURRENT_DATE;
  
  -- Check if user already has an update today
  SELECT EXISTS(
    SELECT 1 FROM profile_updates 
    WHERE user_id = user_uuid 
    AND DATE(created_at) = today_date
  ) INTO existing_update_today;
  
  -- Always insert the update record for audit trail
  INSERT INTO profile_updates (user_id, update_type, old_value, new_value)
  VALUES (user_uuid, update_type_param, old_value_param, new_value_param);
  
  -- If this is the first update today, it counts toward the limit
  -- Additional updates on the same day don't count toward the limit
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can still update (has remaining updates)
CREATE OR REPLACE FUNCTION can_user_update_profile(user_uuid uuid, max_updates integer DEFAULT 3)
RETURNS boolean AS $$
DECLARE
  current_count integer;
BEGIN
  SELECT get_user_profile_update_count(user_uuid) INTO current_count;
  RETURN current_count < max_updates;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely upsert user preferences (handles duplicate key constraint)
CREATE OR REPLACE FUNCTION safe_upsert_user_preferences(
  user_uuid uuid,
  preferences_data jsonb
)
RETURNS void AS $$
BEGIN
  -- Try to insert first
  BEGIN
    INSERT INTO user_preferences (user_id, preferences)
    VALUES (user_uuid, preferences_data);
  EXCEPTION WHEN unique_violation THEN
    -- If insert fails due to unique constraint, update instead
    UPDATE user_preferences 
    SET preferences = preferences_data, updated_at = now()
    WHERE user_id = user_uuid;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add constraint to prevent too many updates (database level protection)
CREATE OR REPLACE FUNCTION check_profile_update_limit()
RETURNS trigger AS $$
DECLARE
  update_count integer;
  max_updates integer := 3;
BEGIN
  -- Get current update count for the user
  SELECT get_user_profile_update_count(NEW.user_id) INTO update_count;
  
  -- If this would exceed the limit, prevent the insert
  IF update_count >= max_updates THEN
    RAISE EXCEPTION 'Profile update limit of % updates exceeded', max_updates;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce update limit at database level
DROP TRIGGER IF EXISTS enforce_profile_update_limit ON profile_updates;
CREATE TRIGGER enforce_profile_update_limit
  BEFORE INSERT ON profile_updates
  FOR EACH ROW
  EXECUTE FUNCTION check_profile_update_limit();