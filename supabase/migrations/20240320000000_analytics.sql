-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create study_sessions table
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    duration INTEGER NOT NULL,
    score INTEGER,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create category_performance table
CREATE TABLE IF NOT EXISTS public.category_performance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    accuracy NUMERIC(5,2) NOT NULL,
    total_attempts INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_performance ENABLE ROW LEVEL SECURITY;

-- Study sessions policies
CREATE POLICY "Users can view their own study sessions"
    ON public.study_sessions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study sessions"
    ON public.study_sessions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study sessions"
    ON public.study_sessions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study sessions"
    ON public.study_sessions
    FOR DELETE
    USING (auth.uid() = user_id);

-- Category performance policies
CREATE POLICY "Users can view their own category performance"
    ON public.category_performance
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own category performance"
    ON public.category_performance
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own category performance"
    ON public.category_performance
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own category performance"
    ON public.category_performance
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS study_sessions_user_id_idx ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS study_sessions_created_at_idx ON public.study_sessions(created_at);
CREATE INDEX IF NOT EXISTS category_performance_user_id_idx ON public.category_performance(user_id);
CREATE INDEX IF NOT EXISTS category_performance_created_at_idx ON public.category_performance(created_at); 