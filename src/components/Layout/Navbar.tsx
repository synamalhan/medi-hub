import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  User, 
  Brain, 
  Calendar, 
  Lightbulb, 
  BookOpen, 
  BarChart3, 
  LogOut,
  Stethoscope,
  FileText
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/simulator', icon: Stethoscope, label: 'Patient Simulator' },
    { path: '/flashcards', icon: BookOpen, label: 'Flashcards' },
    { path: '/deadlines', icon: Calendar, label: 'Deadlines' },
    { path: '/mnemonics', icon: Lightbulb, label: 'Mnemonics' },
    { path: '/research-summarizer', icon: FileText, label: 'Research Summarizer' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics', isPro: true },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-r border-gray-200 h-full w-64 fixed left-0 top-0 z-40 overflow-y-auto">
      <div className="p-6">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 medical-gradient rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">MediHub</h1>
            <p className="text-xs text-gray-500">AI Learning Platform</p>
          </div>
        </Link>

        {/* Navigation Items */}
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            if (item.isPro && !user?.isPro) {
              return (
                <div key={item.path} className="relative">
                  <div className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-400 cursor-not-allowed">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    <span className="text-xs bg-warning-100 text-warning-800 px-2 py-1 rounded-full ml-auto">
                      Pro
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {active && (
                  <motion.div
                    className="w-2 h-2 bg-primary-600 rounded-full ml-auto"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* User Profile Section */}
        {user && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-gray-50">
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff`}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              {user.isPro && (
                <span className="text-xs bg-success-100 text-success-800 px-2 py-1 rounded-full">
                  Pro
                </span>
              )}
            </div>
            
            <button
              onClick={logout}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full mt-2 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        )}
      </div>
      
    </nav>
  );
};

export default Navbar;