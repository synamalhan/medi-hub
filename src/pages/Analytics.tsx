import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Clock, 
  Brain, 
  Award,
  Calendar,
  Users,
  Zap,
  BookOpen
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useAuthStore } from '../stores/authStore';
import { SubscriptionPaywall } from '../components/SubscriptionPaywall';

const Analytics: React.FC = () => {
  const { user } = useAuthStore();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

  // Mock data for charts
  const studyProgressData = [
    { date: '2024-01-01', flashcards: 45, simulator: 3, hours: 2.5 },
    { date: '2024-01-02', flashcards: 52, simulator: 4, hours: 3.2 },
    { date: '2024-01-03', flashcards: 38, simulator: 2, hours: 2.1 },
    { date: '2024-01-04', flashcards: 65, simulator: 5, hours: 4.1 },
    { date: '2024-01-05', flashcards: 71, simulator: 6, hours: 3.8 },
    { date: '2024-01-06', flashcards: 43, simulator: 3, hours: 2.9 },
    { date: '2024-01-07', flashcards: 59, simulator: 4, hours: 3.5 },
  ];

  const performanceData = [
    { category: 'Cardiology', accuracy: 85, total: 120 },
    { category: 'Neurology', accuracy: 78, total: 89 },
    { category: 'Respiratory', accuracy: 92, total: 95 },
    { category: 'Endocrine', accuracy: 73, total: 67 },
    { category: 'Gastro', accuracy: 88, total: 103 },
  ];

  const timeDistributionData = [
    { name: 'Flashcards', value: 45, color: '#3B82F6' },
    { name: 'Patient Simulator', value: 30, color: '#10B981' },
    { name: 'Mnemonics', value: 15, color: '#F59E0B' },
    { name: 'Reading', value: 10, color: '#8B5CF6' },
  ];

  const weeklyGoalsData = [
    { week: 'Week 1', target: 25, achieved: 23 },
    { week: 'Week 2', target: 30, achieved: 28 },
    { week: 'Week 3', target: 28, achieved: 32 },
    { week: 'Week 4', target: 35, achieved: 29 },
  ];

  if (!user?.isPro) {
    return (
      <div className="space-y-8">
        <SubscriptionPaywall 
          variant="full" 
          onSuccess={() => {
            // Refresh user data after successful purchase
            window.location.reload();
          }} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Deep insights into your learning performance</p>
        </div>
        
        <div className="flex space-x-2">
          {['week', 'month', 'quarter'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                timeRange === range
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 text-green-600" />
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">+12%</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">92%</div>
          <div className="text-sm text-gray-600">Overall Accuracy</div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-blue-600" />
            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">+5h</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">24.5h</div>
          <div className="text-sm text-gray-600">Study Time</div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <Zap className="w-8 h-8 text-orange-600" />
            <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">12 days</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">12</div>
          <div className="text-sm text-gray-600">Study Streak</div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <BookOpen className="w-8 h-8 text-purple-600" />
            <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">+15</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">1,247</div>
          <div className="text-sm text-gray-600">Cards Reviewed</div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Study Progress Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Study Progress</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={studyProgressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="flashcards" stroke="#3B82F6" strokeWidth={2} name="Flashcards" />
              <Line type="monotone" dataKey="simulator" stroke="#10B981" strokeWidth={2} name="Simulator Cases" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Performance by Category */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="card"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="accuracy" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Time Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Time Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={timeDistributionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
              >
                {timeDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {timeDistributionData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Weekly Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="card lg:col-span-2"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Weekly Goals vs Achievement</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyGoalsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="target" fill="#E5E7EB" name="Target" />
              <Bar dataKey="achieved" fill="#10B981" name="Achieved" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="card"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">AI-Powered Recommendations</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Brain className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-blue-900 mb-2">Focus Area</h3>
            <p className="text-blue-800 text-sm">
              Based on your performance, spend more time on Endocrinology concepts. Your accuracy in this area is below average.
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <Clock className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-green-900 mb-2">Study Schedule</h3>
            <p className="text-green-800 text-sm">
              Your peak performance time is 2-4 PM. Consider scheduling your most challenging topics during this window.
            </p>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <Target className="w-8 h-8 text-yellow-600 mb-3" />
            <h3 className="font-semibold text-yellow-900 mb-2">Goal Setting</h3>
            <p className="text-yellow-800 text-sm">
              You're consistently meeting your flashcard goals. Consider increasing your daily target by 10-15 cards.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;