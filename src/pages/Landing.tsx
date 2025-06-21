import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Stethoscope, 
  BookOpen, 
  Calendar, 
  Lightbulb, 
  BarChart3,
  Play,
  CheckCircle,
  Star,
  ArrowRight,
  Users,
  Award,
  Zap,
  Loader
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createDemoVideo, getVideoStatus } from '../lib/tavus';
import toast from 'react-hot-toast';
import demo_video from '../components/demo_video.mp4'; // Fallback static demo video

const Landing: React.FC = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  const features = [
    {
      icon: Stethoscope,
      title: 'AI Patient Simulator',
      description: 'Practice with realistic virtual patients powered by advanced AI, complete with voice interactions and comprehensive case studies.',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      icon: BookOpen,
      title: 'Adaptive Flashcards',
      description: 'Intelligent spaced repetition system that adapts to your learning pace and optimizes memory retention.',
      gradient: 'from-green-500 to-green-600'
    },
    {
      icon: Calendar,
      title: 'Smart Deadline Tracker',
      description: 'Never miss important exams or assignments with our intelligent countdown system and priority management.',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      icon: Lightbulb,
      title: 'Mnemonic Generator',
      description: 'AI-powered mnemonic creation and curated library of medical mnemonics to boost memorization.',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Track your progress with detailed performance insights and personalized study recommendations.',
      gradient: 'from-red-500 to-pink-500'
    },
    {
      icon: Brain,
      title: 'Research Summarizer',
      description: 'Summarize medical research papers with AI. Get the key insights and findings of a paper in a few seconds.',
      gradient: 'from-indigo-500 to-purple-500'
    }
  ];

  const stats = [
    { icon: Users, value: '50,000+', label: 'Medical Students' },
    { icon: Award, value: '95%', label: 'Pass Rate Improvement' },
    { icon: Zap, value: '40%', label: 'Faster Learning' },
    { icon: Star, value: '4.9/5', label: 'Student Rating' }
  ];

  const testimonials = [
    {
      name: 'Dr. Sarah Chen',
      role: 'MD, Harvard Medical School',
      content: 'MediHub transformed my study experience. The AI patient simulator helped me practice clinical reasoning in ways traditional textbooks never could.',
      avatar: 'https://images.pexels.com/photos/7446686/pexels-photo-7446686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      name: 'Alex Rodriguez',
      role: '3rd Year Medical Student',
      content: 'The adaptive flashcard system is incredible. I\'ve improved my retention rate by 60% and my USMLE practice scores are consistently higher.',
      avatar: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      name: 'Dr. Michael Park',
      role: 'Resident, Johns Hopkins',
      content: 'The mnemonic generator and deadline tracker kept me organized throughout medical school. I recommend MediHub to all my junior colleagues.',
      avatar: 'https://images.pexels.com/photos/6749778/pexels-photo-6749778.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    }
  ];

  // const handleGenerateDemo = async () => {
  //   setIsGeneratingVideo(true);
  //   try {
  //     const videoId = "dde42cde1d";
      
  //     // Poll for video completion
  //     const pollVideo = async () => {
  //       try {
  //         const status = await getVideoStatus(videoId);
          
  //         if (status.status === 'completed' && status.download_url) {
  //           setVideoUrl(status.download_url);
  //           setIsVideoPlaying(true);
  //           setIsGeneratingVideo(false);
  //           toast.success('Demo video ready!');
  //         } else if (status.status === 'failed') {
  //           setIsGeneratingVideo(false);
  //           toast.error('Video generation failed');
  //         } else {
  //           // Continue polling
  //           setTimeout(pollVideo, 5000);
  //         }
  //       } catch (error) {
  //         console.error('Error checking video status:', error);
  //         setIsGeneratingVideo(false);
  //         toast.error('Error generating video');
  //       }
  //     };
      
  //     pollVideo();
  //     toast.success('Generating demo video...');
      
  //   } catch (error) {
  //     console.error('Error generating demo:', error);
  //     setIsGeneratingVideo(false);
  //     toast.error('Demo video generation not available');
  //     // Fallback to static demo
  //     setIsVideoPlaying(true);
  //   }
  // };
   const handleGenerateDemo = () => {
    setIsVideoPlaying(true);
    toast.success('Playing demo video');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 medical-gradient rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MediHub</h1>
                <p className="text-xs text-gray-500">AI Learning Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/auth"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/auth"
                className="btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
                The Future of{' '}
                <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  Medical Education
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                AI-powered learning platform that consolidates patient simulators, adaptive flashcards, 
                and intelligent study tools into one revolutionary system for medical students.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/auth"
                  className="btn-primary text-lg px-8 py-3 flex items-center space-x-2"
                >
                  <span>Start Learning</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                
                <button
                  onClick={handleGenerateDemo}
                  disabled={isGeneratingVideo}
                  className="btn-secondary text-lg px-8 py-3 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingVideo ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      <span>Watch AI Demo</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>

          {/* Hero Video/Image */}
         <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mx-auto max-w-4xl"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              {isVideoPlaying ? (
                <video
                  src={demo_video} // Use the imported video file
                  controls
                  autoPlay
                  className="w-full h-auto"
                  poster="https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=1200"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src="https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Medical students using MediHub"
                  className="w-full h-auto"
                />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      {/* <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <Icon className="w-8 h-8 text-primary-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section> */}

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our comprehensive suite of AI-powered tools transforms how medical students 
              learn, practice, and prepare for their careers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="card hover:shadow-lg group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Medical Students Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what our community of future healthcare professionals has to say
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card"
              >
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 medical-gradient">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Medical Education?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of medical students who are already using MediHub to 
              accelerate their learning and boost their confidence.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/auth"
                className="bg-white text-primary-600 hover:bg-gray-50 font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <button className="text-white border border-white/30 hover:bg-white/10 font-semibold py-3 px-8 rounded-lg transition-all duration-200 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>No Credit Card Required</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 medical-gradient rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">MediHub</h3>
                <p className="text-sm text-gray-400">AI Learning Platform</p>
              </div>
            </div>
            
            <div className="text-sm text-gray-400">
              © 2025 MediHub. Empowering the next generation of healthcare professionals.
            </div>
            <span className="text-xs">Built with</span>
                <a href="https://bolt.new" target="_blank" rel="noopener noreferrer" className="ml-1 text-xs text-primary-500 hover:underline">
                  Bolt.new
                </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;