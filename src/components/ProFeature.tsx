import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { usePaywall } from './PaywallProvider';

interface ProFeatureProps {
  children: ReactNode;
  featureName?: string;
  showUpgradePrompt?: boolean;
  className?: string;
  variant?: 'overlay' | 'compact' | 'inline';
}

export const ProFeature: React.FC<ProFeatureProps> = ({
  children,
  featureName = 'This feature',
  showUpgradePrompt = true,
  className = '',
  variant = 'overlay'
}) => {
  const { user } = useAuthStore();
  const { showPaywall } = usePaywall();

  // If user is Pro, show the feature
  if (user?.isPro) {
    return <div className={className}>{children}</div>;
  }

  const handleUpgrade = () => {
    showPaywall({
      variant: 'modal',
      trigger: 'feature',
      onSuccess: () => {
        // Refresh the page to show the unlocked feature
        window.location.reload();
      }
    });
  };

  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute inset-0 bg-gray-50 bg-opacity-75 rounded-lg flex items-center justify-center z-10">
          <button
            onClick={handleUpgrade}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Lock className="w-4 h-4" />
            <span>Upgrade to Pro</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="opacity-25 pointer-events-none">
          {children}
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Lock className="w-4 h-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {featureName} requires Pro
              </p>
              <p className="text-xs text-gray-600">
                Upgrade to unlock this feature and more
              </p>
            </div>
          </div>
          <button
            onClick={handleUpgrade}
            className="flex items-center space-x-1 px-3 py-1 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            <span>Upgrade</span>
          </button>
        </div>
      </div>
    );
  }

  // Default overlay variant
  return (
    <div className={`relative ${className}`}>
      {showUpgradePrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-white bg-opacity-95 rounded-lg flex flex-col items-center justify-center z-10 p-6"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Pro Feature
            </h3>
            <p className="text-gray-600 mb-4 max-w-sm">
              {featureName} is available exclusively to Pro subscribers. Upgrade to unlock this and many more premium features.
            </p>
            <button
              onClick={handleUpgrade}
              className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors mx-auto"
            >
              <Sparkles className="w-4 h-4" />
              <span>Upgrade to Pro</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
      <div className={showUpgradePrompt ? 'opacity-25 pointer-events-none' : ''}>
        {children}
      </div>
    </div>
  );
};

// Higher-order component for wrapping entire pages
export const withProFeature = <P extends object>(
  Component: React.ComponentType<P>,
  featureName: string = 'This page'
) => {
  return (props: P) => (
    <ProFeature featureName={featureName} variant="overlay">
      <Component {...props} />
    </ProFeature>
  );
}; 