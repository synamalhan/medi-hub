import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SubscriptionPaywall } from './SubscriptionPaywall';

interface PaywallContextType {
  showPaywall: (options?: PaywallOptions) => void;
  hidePaywall: () => void;
  isPaywallVisible: boolean;
}

interface PaywallOptions {
  variant?: 'full' | 'compact' | 'modal';
  trigger?: 'feature' | 'upgrade' | 'trial';
  onSuccess?: () => void;
}

const PaywallContext = createContext<PaywallContextType | undefined>(undefined);

interface PaywallProviderProps {
  children: ReactNode;
}

export const PaywallProvider: React.FC<PaywallProviderProps> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [options, setOptions] = useState<PaywallOptions>({
    variant: 'full',
    trigger: 'upgrade'
  });

  const showPaywall = (newOptions?: PaywallOptions) => {
    setOptions({
      variant: 'full',
      trigger: 'upgrade',
      ...newOptions
    });
    setIsVisible(true);
  };

  const hidePaywall = () => {
    setIsVisible(false);
  };

  const handleSuccess = () => {
    hidePaywall();
    options.onSuccess?.();
  };

  return (
    <PaywallContext.Provider value={{
      showPaywall,
      hidePaywall,
      isPaywallVisible: isVisible
    }}>
      {children}
      
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
            options.variant === 'modal' ? 'max-w-2xl' : ''
          }`}>
            <SubscriptionPaywall
              variant={options.variant}
              trigger={options.trigger}
              onSuccess={handleSuccess}
              onClose={hidePaywall}
            />
          </div>
        </div>
      )}
    </PaywallContext.Provider>
  );
};

export const usePaywall = () => {
  const context = useContext(PaywallContext);
  if (context === undefined) {
    throw new Error('usePaywall must be used within a PaywallProvider');
  }
  return context;
};

// Hook for feature-gated components
export const useFeatureGate = (featureName: string) => {
  const { showPaywall } = usePaywall();
  
  const requirePro = () => {
    showPaywall({
      variant: 'modal',
      trigger: 'feature',
      onSuccess: () => {
        // Optionally refresh the page or component after upgrade
        window.location.reload();
      }
    });
  };

  return { requirePro };
}; 