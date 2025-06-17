import { supabase } from './supabase';

export async function seedAnalyticsData() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('No authenticated user');

    console.log('Seeding analytics data for user:', user.id);

    // Create test study sessions
    const studySessions = [
      {
        user_id: user.id,
        session_type: 'flashcards',
        start_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        end_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(), // 45 minutes later
        correct_answers: 15,
        incorrect_answers: 5,
        total_questions: 20
      },
      {
        user_id: user.id,
        session_type: 'simulator',
        start_time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        end_time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // 60 minutes later
        correct_answers: 8,
        incorrect_answers: 2,
        total_questions: 10
      },
      {
        user_id: user.id,
        session_type: 'mnemonics',
        start_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        end_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(), // 30 minutes later
        correct_answers: 12,
        incorrect_answers: 3,
        total_questions: 15
      },
      {
        user_id: user.id,
        session_type: 'reading',
        start_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        end_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(), // 90 minutes later
        correct_answers: 20,
        incorrect_answers: 5,
        total_questions: 25
      }
    ];

    // Insert study sessions
    const { data: insertedSessions, error: sessionsError } = await supabase
      .from('study_sessions')
      .insert(studySessions)
      .select();

    if (sessionsError) {
      console.error('Error inserting study sessions:', sessionsError);
      throw sessionsError;
    }

    console.log('Inserted study sessions:', insertedSessions);

    // Create test category performance data
    const categoryPerformance = [
      {
        user_id: user.id,
        category: 'Cardiology',
        accuracy: 85,
        total_attempts: 50
      },
      {
        user_id: user.id,
        category: 'Neurology',
        accuracy: 75,
        total_attempts: 40
      },
      {
        user_id: user.id,
        category: 'Respiratory',
        accuracy: 90,
        total_attempts: 30
      }
    ];

    // Insert category performance
    const { data: insertedPerformance, error: performanceError } = await supabase
      .from('category_performance')
      .insert(categoryPerformance)
      .select();

    if (performanceError) {
      console.error('Error inserting category performance:', performanceError);
      throw performanceError;
    }

    console.log('Inserted category performance:', insertedPerformance);

    // Verify the data was inserted correctly
    const { data: verifySessions, error: verifySessionsError } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', user.id);

    if (verifySessionsError) {
      console.error('Error verifying study sessions:', verifySessionsError);
      throw verifySessionsError;
    }

    const { data: verifyPerformance, error: verifyPerformanceError } = await supabase
      .from('category_performance')
      .select('*')
      .eq('user_id', user.id);

    if (verifyPerformanceError) {
      console.error('Error verifying category performance:', verifyPerformanceError);
      throw verifyPerformanceError;
    }

    console.log('Verification - Study Sessions:', verifySessions);
    console.log('Verification - Category Performance:', verifyPerformance);

    return {
      studySessions: verifySessions,
      categoryPerformance: verifyPerformance
    };
  } catch (error) {
    console.error('Error seeding analytics data:', error);
    throw error;
  }
} 