import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Calendar, 
  Crown, 
  Settings, 
  Bell, 
  Shield, 
  Download,
  Upload,
  Edit,
  Save,
  X,
  Award,
  Target,
  Zap,
  Clock
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import { SubscriptionPaywall } from '../components/SubscriptionPaywall';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleSave = () => {
    if (!editForm.name.trim() || !editForm.email.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    updateUser({
      name: editForm.name,
      email: editForm.email,
    });

    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleCancel = () => {
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  const achievements = [
    {
      title: '100 Day Streak',
      description: 'Studied for 100 consecutive days',
      icon: Zap,
      earned: user?.stats.streakDays >= 100,
      progress: user?.stats.streakDays || 0,  
      total: 100,
      color: 'orange',
    },
    {
      title: 'Case Master',
      description: 'Completed 50 patient simulator cases',
      icon: Target,
      earned: user?.stats.simulatorCasesCompleted >= 50,
      progress: user?.stats.simulatorCasesCompleted || 0,
      total: 50,
      color: 'green',
    },
    {
      title: 'Flashcard Expert',
      description: 'Reviewed 1000 flashcards',
      icon: Award,
      earned: user.stats.flashcardsReviewed >= 1000,
      progress: user?.stats.flashcardsReviewed || 0,
      total: 1000,
      color: 'blue',
    },
    {
      title: 'Speed Learner',
      description: 'Maintain 90%+ accuracy for 30 days',
      icon: Clock,
      earned: user?.stats.simulatorAccuracy >= 90,
      progress: user?.stats.simulatorAccuracy || 0,
      total: 30,
      color: 'purple',
    },
  ];

  const getColorClasses = (color: string, earned: boolean) => {
    const baseClasses = {
      orange: earned ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-gray-100 text-gray-500 border-gray-200',
      green: earned ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200',
      blue: earned ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-gray-100 text-gray-500 border-gray-200',
      purple: earned ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-gray-100 text-gray-500 border-gray-200',
    };
    return baseClasses[color as keyof typeof baseClasses];
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Manage your account and view your achievements</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSave}
                    className="p-2 text-green-600 hover:text-green-700 transition-colors"
                  >
                    <Save className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-6 mb-8">
              <div className="relative">
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff&size=128`}
                  alt={user.name}
                  className="w-24 h-24 rounded-full"
                />
                <button className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors">
                  <Upload className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1">
                {!isEditing ? (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
                    <p className="text-gray-600">{user.email}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {user.createdAt.toLocaleDateString()}</span>
                      </div>
                      {user.isPro && (
                        <div className="flex items-center space-x-1 text-sm text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                          <Crown className="w-4 h-4" />
                          <span>Pro Member</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Stats</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Study Streak</p>
                  <p className="text-2xl font-bold text-gray-900">{user?.stats?.streakDays || 0} days</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Study Hours</p>
                  <p className="text-2xl font-bold text-gray-900">{user?.stats?.totalStudyHours || 0} hrs</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Flashcards Reviewed</p>
                  <p className="text-2xl font-bold text-gray-900">{user?.stats?.flashcardsReviewed || 0}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Simulator Accuracy</p>
                  <p className="text-2xl font-bold text-gray-900">{user?.stats?.simulatorAccuracy || 0}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Achievements</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getColorClasses(achievement.color, achievement.earned)} ${
                      achievement.earned ? '' : 'opacity-60'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <Icon className="w-6 h-6" />
                      <div>
                        <h3 className="font-semibold">{achievement.title}</h3>
                        <p className="text-sm opacity-80">{achievement.description}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{achievement.progress}/{achievement.total}</span>
                      </div>
                      <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            achievement.earned ? 'bg-current' : 'bg-gray-400'
                          }`}
                          style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Settings Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Account Settings */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h2>
            
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Notifications</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <Shield className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Privacy & Security</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <Download className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700">Export Data</span>
              </button>
            </div>
          </div>

          {/* Pro Upgrade Card */}
          {!user?.isPro && (
            <div className="card">
              <SubscriptionPaywall 
                variant="compact" 
                onSuccess={() => {
                  // Refresh user data after successful purchase
                  window.location.reload();
                }} 
              />
            </div>
          )}

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            
            <div className="space-y-3">
              <button className="w-full btn-secondary text-left">
                Download Study Report
              </button>
              
              <button className="w-full btn-secondary text-left">
                Reset Progress
              </button>
              
              <button className="w-full text-red-600 hover:bg-red-50 p-3 rounded-lg transition-colors text-left">
                Delete Account
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;