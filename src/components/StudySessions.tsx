import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, Target, Calendar, Activity } from 'lucide-react';
import { useStudySessionStore } from '../stores/studySessionStore';
import { useAuthStore } from '../stores/authStore';

const StudySessions: React.FC = () => {
  const { 
    sessions, 
    isLoading, 
    fetchSessions, 
    getTotalStudyHours, 
    getAverageSessionLength, 
    getStudyStreak 
  } = useStudySessionStore();
  
  const { user } = useAuthStore();
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');

  useEffect(() => {
    if (user) {
      fetchSessions(timeRange);
    }
  }, [user, timeRange, fetchSessions]);

  const totalHours = getTotalStudyHours(timeRange);
  const averageSession = getAverageSessionLength();
  const studyStreak = getStudyStreak();

  const formatHours = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} minutes`;
    }
    return `${hours.toFixed(1)} hours`;
  };

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case 'day': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      default: return 'This Week';
    }
  };

  const stats = [
    {
      title: 'Total Study Time',
      value: formatHours(totalHours),
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Average Session',
      value: formatHours(averageSession),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Study Streak',
      value: `${studyStreak} days`,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const recentSessions = sessions
    .filter(session => {
      // Include sessions that have duration_hours > 0 OR have end_time (completed sessions)
      if (session.duration_hours && session.duration_hours > 0) return true;
      if (session.end_time) return true;
      return false;
    })
    .slice(0, 5);

  // Debug logging
  useEffect(() => {
    console.log('StudySessions - All sessions:', sessions);
    console.log('StudySessions - Recent sessions:', recentSessions);
    console.log('StudySessions - Total hours:', totalHours);
    console.log('StudySessions - Average session:', averageSession);
    console.log('StudySessions - Study streak:', studyStreak);
  }, [sessions, recentSessions, totalHours, averageSession, studyStreak]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Study Sessions</h2>
          <p className="text-gray-600">Track your learning progress and study habits</p>
        </div>
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-primary-600" />
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex space-x-2">
        {(['day', 'week', 'month', 'year'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === range
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {getTimeRangeLabel(range)}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Sessions</h3>
        </div>
        
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : recentSessions.length > 0 ? (
          <div className="p-6">
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {session.activity_type || session.session_type}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(session.start_time).toLocaleDateString()} at{' '}
                        {new Date(session.start_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {(() => {
                        if (session.duration_hours) {
                          return formatHours(session.duration_hours);
                        }
                        if (session.end_time) {
                          const startTime = new Date(session.start_time);
                          const endTime = new Date(session.end_time);
                          const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
                          return formatHours(durationHours);
                        }
                        return formatHours(0);
                      })()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {session.session_type === 'login_session' ? 'Login Session' : 'Study Session'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No study sessions found for {getTimeRangeLabel(timeRange)}</p>
            <p className="text-sm text-gray-500 mt-1">Start studying to see your sessions here</p>
          </div>
        )}
      </div>

      {/* Session Type Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Session Breakdown</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {(() => {
              const loginSessions = sessions.filter(s => s.session_type === 'login_session' && (s.duration_hours || s.end_time));
              const studySessions = sessions.filter(s => s.session_type === 'study_session' && (s.duration_hours || s.end_time));
              
              const loginHours = loginSessions.reduce((sum, s) => {
                if (s.duration_hours) return sum + s.duration_hours;
                if (s.end_time) {
                  const startTime = new Date(s.start_time);
                  const endTime = new Date(s.end_time);
                  const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
                  return sum + durationHours;
                }
                return sum;
              }, 0);
              
              const studyHours = studySessions.reduce((sum, s) => {
                if (s.duration_hours) return sum + s.duration_hours;
                if (s.end_time) {
                  const startTime = new Date(s.start_time);
                  const endTime = new Date(s.end_time);
                  const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
                  return sum + durationHours;
                }
                return sum;
              }, 0);
              
              const totalHours = loginHours + studyHours;
              
              return (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="font-medium">Login Sessions</span>
                    </div>
                    <span className="font-semibold">{formatHours(loginHours)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="font-medium">Study Sessions</span>
                    </div>
                    <span className="font-semibold">{formatHours(studyHours)}</span>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="font-bold text-lg text-primary-600">{formatHours(totalHours)}</span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudySessions;