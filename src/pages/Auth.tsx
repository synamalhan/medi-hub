import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import { ActivitySquare} from 'lucide-react';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const { login, register, isLoading, logout, clearAllStores } = useAuthStore();
  const navigate = useNavigate();

  // Clear all caches and log out any previous user when the Auth page is opened
  useEffect(() => {
    const handleAuthPageLoad = async () => {
      console.log('Auth page loaded - clearing all caches...');
      try {
        // Clear all store caches first
        clearAllStores();
        
        // Clear browser storage
        if (typeof window !== 'undefined') {
          localStorage.clear();
          console.log('✓ localStorage cleared');
          sessionStorage.clear();
          console.log('✓ sessionStorage cleared');
          
          // Clear any cached data
          if ('caches' in window) {
            try {
              const cacheNames = await caches.keys();
              await Promise.all(cacheNames.map(name => caches.delete(name)));
              console.log(`✓ ${cacheNames.length} caches cleared`);
            } catch (error) {
              console.warn('Error clearing caches:', error);
            }
          }
          
          // Clear Supabase session storage specifically
          const supabaseKeys = Object.keys(localStorage).filter(key => 
            key.startsWith('sb-') || key.includes('supabase')
          );
          supabaseKeys.forEach(key => localStorage.removeItem(key));
          console.log(`✓ ${supabaseKeys.length} Supabase keys cleared`);
        }
        
        // Log out any previous user
        await logout(false);
        console.log('✓ Previous user logged out');
      } catch (error) {
        console.error('Error clearing cache and logging out:', error);
      }
    };
    
    handleAuthPageLoad();
  }, [logout, clearAllStores]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let success = false;
      
      if (isLogin) {
        success = await login(formData.email, formData.password);
        if (success) {
          toast.success('Welcome back to MediHub!');
          navigate('/dashboard');
        } else {
          toast.error('Invalid credentials. Try student@medihub.com / password');
        }
      } else {
        success = await register(formData.email, formData.password, formData.name);
        if (success) {
          toast.success('Account created successfully!');
          navigate('/dashboard');
        } else {
          toast.error('Registration failed. Please try again.');
        }
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <>
    <div className=" bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Back to Home */}
        <Link
          to="/"
          className="flex items-center text-primary-600 hover:text-primary-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-6"
          >
            <div className="w-16 h-16 medical-gradient rounded-2xl flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Welcome Back' : 'Join MediHub'}
            </h2>
            <p className="text-gray-600">
              {isLogin 
                ? 'Sign in to continue your medical education journey' 
                : 'Create your account and start learning with AI'
              }
            </p>
          </motion.div>
        </div>

        {/* Demo Credentials */}
        {isLogin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Demo Credentials</h3>
            <p className="text-sm text-blue-700">
              Email: <code className="bg-blue-100 px-1 rounded">student@medihub.com</code><br />
              Password: <code className="bg-blue-100 px-1 rounded">password</code>
            </p>
          </motion.div>
        )}

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          onSubmit={handleSubmit}
          className="mt-8 space-y-6"
        >
          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={!isLogin}
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field pl-10"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field pl-10"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-field pl-10 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary-600 hover:text-primary-500 font-medium transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </motion.form>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 text-center text-sm text-gray-500"
        >
          <p className="mb-2">Join thousands of medical students using MediHub to:</p>
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <span className="bg-gray-100 px-3 py-1 rounded-full">AI Patient Simulator</span>
            <span className="bg-gray-100 px-3 py-1 rounded-full">Smart Flashcards</span>
            <span className="bg-gray-100 px-3 py-1 rounded-full">Progress Tracking</span>
          </div>
        </motion.div>
      </div>
    </div>
      <footer className="bg-white border-t border-neutral-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-40">
            <div className="flex items-center gap-20">
              <ActivitySquare className="w-5 h-5 text-primary-500" />
              <p className="text-sm text-neutral-600 padding-left-20">
                 © 2025 mediTalk. All rights reserved.
              </p>
            </div>
            <div className="flex gap-4 text-neutral-600">
              <div className="flex items-center">
                <span className="text-xs">Built with</span>
                <a href="https://bolt.new" target="_blank" rel="noopener noreferrer" className="ml-1 text-xs text-primary-500 hover:underline">
                  Bolt.new
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      </>
  );
};

export default Auth;