import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, BarChart3, Brain, TrendingUp, X, CreditCard, Lock, Sparkles, Zap, CheckCircle } from 'lucide-react';
import { getPackages, purchasePackage } from '../lib/revenuecat';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

interface SubscriptionPaywallProps {
  variant?: 'full' | 'compact';
  onSuccess?: () => void;
  onClose?: () => void;
}

interface PaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  name: string;
}

export const SubscriptionPaywall: React.FC<SubscriptionPaywallProps> = ({ 
  variant = 'full',
  onSuccess,
  onClose 
}) => {
  const { refreshUserStats } = useAuthStore();
  const [offerings, setOfferings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: ''
  });

  useEffect(() => {
    const loadOfferings = async () => {
      try {
        const packages = await getPackages();
        setOfferings(packages);
        if (packages?.current?.availablePackages?.[0]) {
          setSelectedPackage(packages.current.availablePackages[0]);
        }
      } catch (error) {
        console.error('Failed to load packages:', error);
        toast.error('Failed to load subscription options');
      } finally {
        setIsLoading(false);
      }
    };

    loadOfferings();
  }, []);

  const handlePurchase = async (packageToPurchase: any) => {
    try {
      setIsLoading(true);
      await purchasePackage(packageToPurchase);
      
      // Refresh user stats to reflect Pro status
      await refreshUserStats();
      
      toast.success('Successfully upgraded to Pro!');
      onSuccess?.();
    } catch (error) {
      console.error('Purchase failed:', error);
      toast.error('Failed to complete purchase');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) return;

    try {
      setIsLoading(true);
      await handlePurchase(selectedPackage);
    } catch (error) {
      console.error('Payment failed:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 3) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Award className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-semibold text-yellow-800 bg-yellow-200 px-2 py-1 rounded-full">
                Pro Feature
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Unlock Advanced Features
            </h3>
            <p className="text-gray-600 mb-4">
              Get unlimited AI generations, advanced analytics, and personalized learning paths.
            </p>
            {selectedPackage && (
              <button 
                onClick={() => setShowPaymentForm(true)}
                className="btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Upgrade to Pro'}
              </button>
            )}
          </div>
          <div className="hidden md:block">
            <Sparkles className="w-12 h-12 text-yellow-400" />
          </div>
        </div>
      </div>
    );
  }

  const proFeatures = [
    {
      icon: Sparkles,
      title: 'Unlimited AI Generations',
      description: 'Generate unlimited funny, professional, and creative mnemonics with AI'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Track performance across all specialties with detailed insights'
    },
    {
      icon: TrendingUp,
      title: 'Progress Insights',
      description: 'Visualize your learning journey with comprehensive reports'
    },
    {
      icon: Brain,
      title: 'AI Study Recommendations',
      description: 'Get personalized study suggestions based on your performance'
    },
    {
      icon: Zap,
      title: 'Priority Support',
      description: 'Get faster response times and dedicated customer support'
    },
    {
      icon: Award,
      title: 'Exclusive Content',
      description: 'Access premium study materials and advanced case studies'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Upgrade to Pro</h2>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="px-6">
        {!showPaymentForm ? (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Unlock Your Full Potential
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Take your medical education to the next level with our comprehensive Pro features designed to accelerate your learning.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {proFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <Icon className="w-8 h-8 text-primary-600 mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                );
              })}
            </div>
            
            {offerings?.current?.availablePackages && (
              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
                {offerings.current.availablePackages.map((pkg: any) => (
                  <div 
                    key={pkg.identifier}
                    className={`bg-white rounded-xl p-6 border-2 transition-colors cursor-pointer ${
                      selectedPackage?.identifier === pkg.identifier 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.product.title}</h3>
                      <p className="text-gray-600 mb-4">{pkg.product.description}</p>
                      <p className="text-3xl font-bold text-gray-900 mb-6">{pkg.product.priceString}</p>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          <span>Unlimited AI generations</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          <span>Advanced analytics</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          <span>Priority support</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPaymentForm(true);
                        }}
                        className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                          selectedPackage?.identifier === pkg.identifier
                            ? 'bg-primary-600 text-white hover:bg-primary-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Processing...' : 'Subscribe Now'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Lock className="w-6 h-6 text-gray-400 mr-2" />
              <span className="text-sm text-gray-500">Secure Payment</span>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <div className="relative">
                  <CreditCard className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    value={paymentData.cardNumber}
                    onChange={(e) => setPaymentData({
                      ...paymentData,
                      cardNumber: formatCardNumber(e.target.value)
                    })}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={paymentData.expiryDate}
                    onChange={(e) => setPaymentData({
                      ...paymentData,
                      expiryDate: formatExpiryDate(e.target.value)
                    })}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={paymentData.cvv}
                    onChange={(e) => setPaymentData({
                      ...paymentData,
                      cvv: e.target.value.replace(/\D/g, '').slice(0, 3)
                    })}
                    placeholder="123"
                    maxLength={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name on Card
                </label>
                <input
                  type="text"
                  value={paymentData.name}
                  onChange={(e) => setPaymentData({
                    ...paymentData,
                    name: e.target.value
                  })}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : `Pay ${selectedPackage?.product?.priceString}`}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowPaymentForm(false)}
                className="w-full text-gray-600 hover:text-gray-800 text-sm font-medium mt-2"
              >
                Back to Plans
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Your payment information is secure and encrypted.</p>
            </div>
          </div>
        )}

        {!showPaymentForm && (
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Cancel anytime. All subscriptions automatically renew unless auto-renew is turned off.</p>
          </div>
        )}
      </div>
    </div>
  );
};