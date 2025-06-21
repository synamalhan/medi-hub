import React, { useEffect, useState } from 'react';
import { useAnalyticsStore } from '../stores/analyticsStore';
import { useAuthStore } from '../stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { seedAnalyticsData } from '../lib/seedAnalytics';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { Activity, Brain, Clock, Target, Calendar, Star } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { motion } from 'framer-motion';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Analytics: React.FC = () => {
  const { user, isPro } = useAuthStore();
  const { 
    studySessions, 
    categoryPerformance, 
    timeDistribution, 
    weeklyGoals,
    fetchAnalytics 
  } = useAnalyticsStore();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    if (isPro) {
      fetchAnalytics(timeRange);
    }
  }, [isPro, fetchAnalytics, timeRange]);

  const handleSeedData = async () => {
    try {
      await seedAnalyticsData();
      await fetchAnalytics(timeRange);
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  };

  const handleTimeRangeChange = (value: 'week' | 'month' | 'year') => {
    setTimeRange(value);
  };

  // --- Stats Section Data ---
  const totalSessions = studySessions.length;
  const totalMinutes = studySessions.reduce((acc, s) => {
    const start = new Date(s.start_time).getTime();
    const end = new Date(s.end_time || s.start_time).getTime();
    return acc + Math.max(0, (end - start) / (1000 * 60));
  }, 0);
  const avgAccuracy = categoryPerformance.length > 0
    ? Math.round(categoryPerformance.reduce((acc, c) => acc + c.accuracy, 0) / categoryPerformance.length)
    : 0;
  const streak = 7; // Placeholder, replace with real streak logic if available

  if (!isPro) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Upgrade to Pro</h2>
              <p className="text-gray-600 mb-6">
                Get access to detailed analytics and insights to track your progress.
              </p>
              <Button>Upgrade Now</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Process study sessions for the line chart
  const studyProgressData = studySessions.map(session => ({
    date: new Date(session.created_at).toLocaleDateString(),
    duration: (new Date(session.end_time || session.start_time).getTime() - new Date(session.start_time).getTime()) / (1000 * 60), // Convert to minutes
    type: session.session_type
  }));

  // Process category performance for the bar chart
  const categoryData = categoryPerformance.map(cat => ({
    category: cat.category,
    accuracy: cat.accuracy,
    attempts: cat.total_attempts
  }));

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">Track your study progress and performance</p>
        </div>
        <div className="flex space-x-4">
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSeedData}>Seed Test Data</Button>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6"
      >
        <div className="card text-center">
          <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{totalSessions}</div>
          <div className="text-sm text-gray-600">Total Sessions</div>
          </div>
        <div className="card text-center">
          <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{Math.round(totalMinutes)}</div>
          <div className="text-sm text-gray-600">Total Minutes</div>
        </div>
        <div className="card text-center">
          <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{avgAccuracy}%</div>
          <div className="text-sm text-gray-600">Avg. Accuracy</div>
        </div>
        <div className="card text-center">
          <Star className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{streak}</div>
          <div className="text-sm text-gray-600">Study Streak</div>
        </div>
      </motion.div>

      {/* Main Content: Charts and Analytics */}
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="grid gap-6 md:grid-cols-2">
          {/* Study Progress Over Time */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Study Progress Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
            <LineChart data={studyProgressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
                    <YAxis label={{ value: 'Duration (minutes)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
                    <Line type="monotone" dataKey="duration" stroke="#8884d8" name="Study Duration" />
            </LineChart>
          </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

        {/* Performance by Category */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Performance by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Attempts', angle: 90, position: 'insideRight' }} />
              <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="accuracy" fill="#8884d8" name="Accuracy" />
                    <Bar yAxisId="right" dataKey="attempts" fill="#82ca9d" name="Attempts" />
            </BarChart>
          </ResponsiveContainer>
      </div>
            </CardContent>
          </Card>

        {/* Time Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Time Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                      data={timeDistribution}
                      dataKey="percentage"
                      nameKey="category"
                cx="50%"
                cy="50%"
                      outerRadius={150}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                      {timeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
                    <Legend />
            </PieChart>
          </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

        {/* Weekly Goals */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Category Goals Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {weeklyGoals.map((goal, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{goal.category}</span>
                      <span className="text-primary-600 font-bold">
                        {goal.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-primary-600 h-2.5 rounded-full" 
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
      </div>
            </CardContent>
          </Card>

          {/* AI-Powered Recommendations */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>AI-Powered Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Based on your performance, we recommend focusing on:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categoryPerformance
                  .sort((a, b) => a.accuracy - b.accuracy)
                  .slice(0, 3)
                  .map((category, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                        <span className="font-medium">{category.category}</span>
          </div>
                      <p className="text-sm text-gray-600">
                        Current accuracy: {category.accuracy}%
                      </p>
                      <p className="text-sm text-gray-600">
                        Total attempts: {category.total_attempts}
            </p>
          </div>
                  ))}
          </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;