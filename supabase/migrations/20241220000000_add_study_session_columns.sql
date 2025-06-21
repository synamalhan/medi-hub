-- Add missing columns to study_sessions table
ALTER TABLE study_sessions 
ADD COLUMN IF NOT EXISTS activity_type TEXT,
ADD COLUMN IF NOT EXISTS duration_hours NUMERIC;

-- Update existing rows to have default values
UPDATE study_sessions 
SET activity_type = 'general' 
WHERE activity_type IS NULL;

UPDATE study_sessions 
SET duration_hours = 0 
WHERE duration_hours IS NULL; 