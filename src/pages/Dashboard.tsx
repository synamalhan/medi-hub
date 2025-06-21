import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  Stethoscope, 
  BookOpen, 
  Calendar, 
  Lightbulb, 
  BarChart3,
  Clock,
  Target,
  TrendingUp,
  CheckCircle,
  Play,
  ArrowRight,
  Zap,
  Award,
  FileText
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useDataStore } from '../stores/dataStore';
import { format, isToday, isTomorrow, differenceInDays, startOfDay, endOfDay } from 'date-fns';
import { SubscriptionPaywall } from '../components/SubscriptionPaywall';
import StudySessions from '../components/StudySessions';
import { supabase } from '../lib/supabase';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { flashcards, deadlines, studySessions } = useDataStore();
  const [showPaywall, setShowPaywall] = useState(false);
  const [todayProgress, setTodayProgress] = useState({
    flashcardsReviewed: 0,
    patientCasesCompleted: 0,
    studyHours: 0,
    isLoading: true
  });

  const upcomingDeadlines = deadlines
    .filter(d => !d.isCompleted)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 3);

  const flashcardsForReview = flashcards.filter(card => 
    card.nextReview <= new Date()
  ).length;

  const recentSessions = studySessions.slice(-5);

  const stats = [
    {
      label: 'Study Streak',
      value: user?.stats.streakDays || 0,
      unit: 'days',
      icon: Zap,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: 'Simulator Accuracy',
      value: user?.stats.simulatorAccuracy || 0,
      unit: '%',
      icon: Target,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Cards Reviewed',
      value: user?.stats.flashcardsReviewed || 0,
      unit: '',
      icon: BookOpen,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Study Hours',
      value: Number((user?.stats.totalStudyHours || 0).toFixed(2)),
      unit: 'hrs',
      icon: Clock,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  const quickActions = [
    {
      title: 'Start Patient Case',
      description: 'Practice with AI-powered virtual patients',
      icon: Stethoscope,
      path: '/simulator',
      gradient: 'from-blue-500 to-blue-600',
      color: 'text-blue-600',
    },
    {
      title: 'Review Flashcards',
      description: `${flashcardsForReview} cards ready for review`,
      icon: BookOpen,
      path: '/flashcards',
      gradient: 'from-green-500 to-green-600',
      color: 'text-green-600',
    },
    {
      title: 'Check Deadlines',
      description: `${upcomingDeadlines.length} upcoming deadlines`,
      icon: Calendar,
      path: '/deadlines',
      gradient: 'from-purple-500 to-purple-600',
      color: 'text-purple-600',
    },
    {
      title: 'Generate Mnemonics',
      description: 'Create memory aids with AI',
      icon: Lightbulb,
      path: '/mnemonics',
      gradient: 'from-yellow-500 to-orange-500',
      color: 'text-yellow-600',
    },
    {
      title: 'Research Summaries',
      description: 'Summarize medical papers with AI',
      icon: FileText,
      path: '/research-summarizer',
      gradient: 'from-indigo-500 to-indigo-600',
      color: 'text-indigo-600',
    },
  ];

  const getDeadlineColor = (dueDate: Date) => {
    const daysUntil = differenceInDays(dueDate, new Date());
    if (daysUntil <= 3) return 'text-red-600 bg-red-50';
    if (daysUntil <= 7) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const formatDeadlineDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM dd');
  };

  const fetchTodayProgress = async () => {
    if (!user) return;

    try {
      setTodayProgress(prev => ({ ...prev, isLoading: true }));

      const today = new Date();
      const todayStart = startOfDay(today).toISOString();
      const todayEnd = endOfDay(today).toISOString();

      // Fetch today's flashcard reviews
      const { data: flashcardData, error: flashcardError } = await supabase
        .from('flashcards')
        .select('last_reviewed')
        .eq('user_id', user.id)
        .gte('last_reviewed', todayStart)
        .lte('last_reviewed', todayEnd);

      if (flashcardError) {
        console.error('Error fetching flashcard data:', flashcardError);
      }

      // Fetch today's patient cases
      const { data: patientData, error: patientError } = await supabase
        .from('patient_cases')
        .select('completed_at')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null)
        .gte('completed_at', todayStart)
        .lte('completed_at', todayEnd);

      if (patientError) {
        console.error('Error fetching patient case data:', patientError);
      }

      // Fetch today's study sessions
      const { data: studySessionData, error: studySessionError } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd);

      if (studySessionError) {
        console.error('Error fetching study session data:', studySessionError);
      }

      // Calculate total study hours from today's sessions
      const totalStudyHours = (studySessionData || []).reduce((total, session) => {
        if (session.duration_hours) {
          return total + session.duration_hours;
        }
        if (session.end_time) {
          const startTime = new Date(session.start_time);
          const endTime = new Date(session.end_time);
          const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
          return total + durationHours;
        }
        return total;
      }, 0);

      setTodayProgress({
        flashcardsReviewed: flashcardData?.length || 0,
        patientCasesCompleted: patientData?.length || 0,
        studyHours: totalStudyHours,
        isLoading: false
      });

      console.log('Today\'s progress:', {
        flashcardsReviewed: flashcardData?.length || 0,
        patientCasesCompleted: patientData?.length || 0,
        studyHours: totalStudyHours,
        studySessions: studySessionData?.length || 0
      });

    } catch (error) {
      console.error('Error fetching today\'s progress:', error);
      setTodayProgress(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Debug function to check study sessions
  const debugStudySessions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Debug - Error fetching study sessions:', error);
        return;
      }

      console.log('Debug - All study sessions for user:', data);
      
      const today = new Date();
      const todayStart = startOfDay(today).toISOString();
      const todayEnd = endOfDay(today).toISOString();
      
      const todaySessions = data.filter(session => {
        const sessionDate = new Date(session.created_at);
        return sessionDate >= new Date(todayStart) && sessionDate <= new Date(todayEnd);
      });

      console.log('Debug - Today\'s study sessions:', todaySessions);
      console.log('Debug - Today start:', todayStart);
      console.log('Debug - Today end:', todayEnd);
    } catch (error) {
      console.error('Debug - Error in debug function:', error);
    }
  };

  // Fetch today's progress when component mounts or user changes
  useEffect(() => {
    fetchTodayProgress();
    debugStudySessions();
  }, [user]);

  // Refresh progress when user returns to the tab
  useEffect(() => {
    const handleFocus = () => {
      fetchTodayProgress();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-primary-100 text-lg">
              Ready to advance your medical knowledge today?
            </p>
          </div>
          <div className="hidden md:block">
            <Brain className="w-16 h-16 text-primary-200" />
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}{stat.unit}
                </p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.path}
                className="card hover:shadow-lg group transition-all duration-200 cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                <div className="flex items-center text-primary-600 text-sm font-medium">
                  <span>Get started</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </Link>
            );
          })}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Upcoming Deadlines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Deadlines</h2>
              <Link
                to="/deadlines"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View all
              </Link>
            </div>
            
            <div className="space-y-4">
              {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map((deadline) => (
                  <div
                    key={deadline.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <h3 className="font-medium text-gray-900">{deadline.title}</h3>
                        <p className="text-sm text-gray-600">{deadline.description}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getDeadlineColor(deadline.dueDate)}`}>
                      {formatDeadlineDate(deadline.dueDate)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming deadlines</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Study Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Today's Progress</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={fetchTodayProgress}
                  disabled={todayProgress.isLoading}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                  title="Refresh today's progress"
                >
                  <BarChart3 className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {todayProgress.isLoading ? (
              <div className="space-y-6">
                <div className="animate-pulse">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2"></div>
                </div>
                <div className="animate-pulse">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2"></div>
                </div>
                <div className="animate-pulse">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-4 bg-gray-200 rounded w-28"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Flashcards Reviewed</span>
                    <span className="text-sm text-gray-500">{todayProgress.flashcardsReviewed}/25</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min((todayProgress.flashcardsReviewed / 25) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Patient Cases Completed</span>
                    <span className="text-sm text-gray-500">{todayProgress.patientCasesCompleted}/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min((todayProgress.patientCasesCompleted / 5) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Study Hours Today</span>
                    <span className="text-sm text-gray-500">{todayProgress.studyHours.toFixed(1)}/8 hrs</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min((todayProgress.studyHours / 8) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Study Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <StudySessions />
      </motion.div>

      {/* Pro Features Teaser */}
      {!user?.isPro && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Award className="w-6 h-6 text-yellow-600" />
                  <span className="text-sm font-semibold text-yellow-800 bg-yellow-200 px-2 py-1 rounded-full">
                    Pro Feature
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Unlock Advanced Analytics
                </h3>
                <p className="text-gray-600 mb-4">
                  Get detailed performance insights, study recommendations, and personalized learning paths.
                </p>
                <button 
                  className="btn-primary"
                  onClick={() => setShowPaywall(true)}
                >
                  Upgrade to Pro
                </button>
              </div>
              <div className="hidden md:block">
                <BarChart3 className="w-16 h-16 text-yellow-400" />
              </div>
            </div>
          </motion.div>

          {showPaywall && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              >
                <SubscriptionPaywall 
                  variant="full" 
                  onSuccess={() => {
                    setShowPaywall(false);
                    window.location.reload();
                  }}
                  onClose={() => setShowPaywall(false)}
                />
              </motion.div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;