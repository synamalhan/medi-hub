import React, { useState, useEffect } from 'react';
import { SubscriptionPaywall } from './SubscriptionPaywall';
import { getPackages } from '../lib/revenuecat';
import { useAuthStore } from '../stores/authStore';

export const TestPaywall: React.FC = () => {
  const [showPaywall, setShowPaywall] = useState(false);
  const [packages, setPackages] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    const loadPackages = async () => {
      setIsLoading(true);
      try {
        const pkgs = await getPackages();
        console.log('📦 Test packages loaded:', pkgs);
        setPackages(pkgs);
      } catch (error) {
        console.error('❌ Failed to load packages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPackages();
  }, []);

  return (
    <div className="p-8 bg-gray-50 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Paywall Test</h1>
      
      <div className="mb-4 p-4 bg-white rounded border">
        <h2 className="font-semibold mb-2">User Status:</h2>
        <p>User ID: {user?.id || 'Not logged in'}</p>
        <p>Email: {user?.email || 'N/A'}</p>
        <p>Is Pro: {user?.isPro ? 'Yes' : 'No'}</p>
      </div>

      <div className="mb-4 p-4 bg-white rounded border">
        <h2 className="font-semibold mb-2">Packages Status:</h2>
        {isLoading ? (
          <p>Loading packages...</p>
        ) : packages ? (
          <div>
            <p>✅ Packages loaded successfully</p>
            <p>Available packages: {packages?.current?.availablePackages?.length || 0}</p>
            <ul className="mt-2">
              {packages?.current?.availablePackages?.map((pkg: any, index: number) => (
                <li key={index} className="text-sm">
                  {pkg.identifier}: {pkg.product?.priceString}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>❌ No packages available</p>
        )}
      </div>
      
      <button 
        onClick={() => {
          console.log('🔄 Test paywall button clicked');
          setShowPaywall(true);
        }}
        className="btn-primary mb-4"
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Test Paywall'}
      </button>

      <div className="mb-4">
        <p>Paywall state: <span className="font-semibold">{showPaywall ? 'SHOWING' : 'HIDDEN'}</span></p>
      </div>

      {showPaywall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <SubscriptionPaywall 
              variant="full" 
              onSuccess={() => {
                console.log('✅ Test paywall success');
                setShowPaywall(false);
                // Refresh the page to show updated user status
                window.location.reload();
              }}
              onClose={() => {
                console.log('❌ Test paywall closed');
                setShowPaywall(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}; 