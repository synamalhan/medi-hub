-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clear existing data for the user
DELETE FROM study_sessions WHERE user_id = '5beb730e-e1e9-4a5c-a76d-b75362e22e26';
DELETE FROM category_performance WHERE user_id = '5beb730e-e1e9-4a5c-a76d-b75362e22e26';

-- Insert study sessions for the last 30 days
INSERT INTO study_sessions (
    id,
    user_id,
    session_type,
    start_time,
    end_time,
    correct_answers,
    incorrect_answers,
    total_questions,
    created_at,
    updated_at
) VALUES
    -- Week 1
    (uuid_generate_v4(), '5beb730e-e1e9-4a5c-a76d-b75362e22e26', 'flashcards', NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days' + INTERVAL '45 minutes', 15, 5, 20, NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days'),
    (uuid_generate_v4(), '5beb730e-e1e9-4a5c-a76d-b75362e22e26', 'simulator', NOW() - INTERVAL '27 days', NOW() - INTERVAL '27 days' + INTERVAL '60 minutes', 8, 2, 10, NOW() - INTERVAL '27 days', NOW() - INTERVAL '27 days'),
    (uuid_generate_v4(), '5beb730e-e1e9-4a5c-a76d-b75362e22e26', 'mnemonics', NOW() - INTERVAL '26 days', NOW() - INTERVAL '26 days' + INTERVAL '30 minutes', 12, 3, 15, NOW() - INTERVAL '26 days', NOW() - INTERVAL '26 days'),
    
    -- Week 2
    (uuid_generate_v4(), '5beb730e-e1e9-4a5c-a76d-b75362e22e26', 'reading', NOW() - INTERVAL '21 days', NOW() - INTERVAL '21 days' + INTERVAL '90 minutes', 20, 5, 25, NOW() - INTERVAL '21 days', NOW() - INTERVAL '21 days'),
    (uuid_generate_v4(), '5beb730e-e1e9-4a5c-a76d-b75362e22e26', 'flashcards', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days' + INTERVAL '50 minutes', 18, 2, 20, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
    (uuid_generate_v4(), '5beb730e-e1e9-4a5c-a76d-b75362e22e26', 'simulator', NOW() - INTERVAL '19 days', NOW() - INTERVAL '19 days' + INTERVAL '75 minutes', 9, 1, 10, NOW() - INTERVAL '19 days', NOW() - INTERVAL '19 days'),
    
    -- Week 3
    (uuid_generate_v4(), '5beb730e-e1e9-4a5c-a76d-b75362e22e26', 'mnemonics', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days' + INTERVAL '40 minutes', 14, 1, 15, NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'),
    (uuid_generate_v4(), '5beb730e-e1e9-4a5c-a76d-b75362e22e26', 'reading', NOW() - INTERVAL '13 days', NOW() - INTERVAL '13 days' + INTERVAL '85 minutes', 22, 3, 25, NOW() - INTERVAL '13 days', NOW() - INTERVAL '13 days'),
    (uuid_generate_v4(), '5beb730e-e1e9-4a5c-a76d-b75362e22e26', 'flashcards', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days' + INTERVAL '55 minutes', 17, 3, 20, NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),
    
    -- Week 4 (Current Week)
    (uuid_generate_v4(), '5beb730e-e1e9-4a5c-a76d-b75362e22e26', 'simulator', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days' + INTERVAL '65 minutes', 9, 1, 10, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
    (uuid_generate_v4(), '5beb730e-e1e9-4a5c-a76d-b75362e22e26', 'mnemonics', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '35 minutes', 13, 2, 15, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
    (uuid_generate_v4(), '5beb730e-e1e9-4a5c-a76d-b75362e22e26', 'reading', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '95 minutes', 23, 2, 25, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
    (uuid_generate_v4(), '5beb730e-e1e9-4a5c-a76d-b75362e22e26', 'flashcards', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '48 minutes', 19, 1, 20, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

-- Insert category performance data with historical progression
INSERT INTO category_performance (
    id,
    user_id,
    category,
    accuracy,
    total_attempts,
    created_at,
    updated_at
) VALUES
    -- Week 1
    (uuid_generate_v4(), '5beb730e-e1e9-4a5c-a76d-b75362e22e26', 'Cardiology', 75, 20, NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days'),
    (uuid_generate_v4(), '5beb730e-e1e9-4a5c-a76d-b75362e22e26', 'Neurology', 65, 15, NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days'),
    (uuid_generate_v4(), '5beb730e-e1e9-4a5c-a76d-b75362e22e26', 'Respiratory', 80, 10, NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days'),
    
    -- Week 2
    (uuid_generate_v4(), '5beb730e-e1e9-4a5c-a76d-b75362e22e26', 'Cardiology', 78, 35, NOW() - INTERVAL '21 days', NOW() - INTERVAL '21 days'),
    (uuid_generate_v4(), '5beb730e-e1e9-4a5c-a76d-b75362e22e26', 'Neurology', 70, 25, NOW() - INTERVAL '21 days', NOW() - INTERVAL '21 days'),
    (uuid_generate_v4(), '5beb730e-e1e9-4a5c-a76d-b75362e22e26', 'Respiratory', 85, 20, NOW() - INTERVAL '21 days', NOW() - INTERVAL '21 days'),
    
    -- Week 3
    (uuid_generate_v4(), '5beb730e-e1e9-4a5c-a76d-b75362e22e26', 'Cardiology', 82, 45, NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'),
    (uuid_generate_v4(), '5beb730e-e1e9-4a5c-a76d-b75362e22e26', 'Neurology', 72, 35, NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'),
    (uuid_generate_v4(), '5beb730e-e1e9-4a5c-a76d-b75362e22e26', 'Respiratory', 87, 25, NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'),
    
    -- Week 4 (Current)
    (uuid_generate_v4(), '5beb730e-e1e9-4a5c-a76d-b75362e22e26', 'Cardiology', 85, 50, NOW(), NOW()),
    (uuid_generate_v4(), '5beb730e-e1e9-4a5c-a76d-b75362e22e26', 'Neurology', 75, 40, NOW(), NOW()),
    (uuid_generate_v4(), '5beb730e-e1e9-4a5c-a76d-b75362e22e26', 'Respiratory', 90, 30, NOW(), NOW()); 