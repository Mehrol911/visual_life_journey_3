/*
  # Enhanced Relatives Table

  1. Updates
    - Add gift_ideas text array for storing gift suggestions
    - Add personal_notes text field for special memories and preferences
    - Ensure all contact information is properly stored
    - Add indexes for better performance

  2. Security
    - Maintain existing RLS policies
    - Ensure data isolation between users
*/

-- Add new columns to relatives table
DO $$
BEGIN
  -- Add gift_ideas column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'relatives' AND column_name = 'gift_ideas'
  ) THEN
    ALTER TABLE relatives ADD COLUMN gift_ideas text[] DEFAULT '{}';
  END IF;

  -- Add personal_notes column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'relatives' AND column_name = 'personal_notes'
  ) THEN
    ALTER TABLE relatives ADD COLUMN personal_notes text;
  END IF;
END $$;

-- Create index for birthday queries (for upcoming birthdays feature)
CREATE INDEX IF NOT EXISTS idx_relatives_birth_date ON relatives(birth_date) WHERE birth_date IS NOT NULL;

-- Create index for favorites
CREATE INDEX IF NOT EXISTS idx_relatives_favorites ON relatives(user_id, is_favorite) WHERE is_favorite = true;