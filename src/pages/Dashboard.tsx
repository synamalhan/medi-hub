import React from 'react';
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
  Award
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useDataStore } from '../stores/dataStore';
import { format, isToday, isTomorrow, differenceInDays } from 'date-fns';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { flashcards, deadlines, studySessions } = useDataStore();

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
      value: user?.stats.totalStudyHours || 0,
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
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Flashcards</span>
                  <span className="text-sm text-gray-500">{user?.stats.flashcardsReviewed}/25</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: user.stats.flashcardsReviewed/25 }}></div>
                </div>
              </div>

              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Patient Cases</span>
                  <span className="text-sm text-gray-500">{user?.stats.simulatorAccuracy}/5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: user.stats.simulatorAccuracy/5 }}></div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-sm font-bold text-primary-600">{user?.stats.totalStudyHours}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Pro Features Teaser */}
      {!user?.isPro && (
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
              <button className="btn-primary">
                Upgrade to Pro
              </button>
            </div>
            <div className="hidden md:block">
              <BarChart3 className="w-16 h-16 text-yellow-400" />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;