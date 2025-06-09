import React, { useEffect } from 'react';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import toast from 'react-hot-toast';

export const SubscriptionPlans: React.FC = () => {
  const { 
    offerings, 
    customerInfo, 
    isLoading, 
    error,
    fetchOfferings,
    fetchCustomerInfo,
    purchase,
    restore
  } = useSubscriptionStore();

  useEffect(() => {
    fetchOfferings();
    fetchCustomerInfo();
  }, [fetchOfferings, fetchCustomerInfo]);

  const handlePurchase = async (packageToPurchase: any) => {
    try {
      await purchase(packageToPurchase);
      toast.success('Purchase successful!');
    } catch (error) {
      toast.error('Purchase failed. Please try again.');
    }
  };

  const handleRestore = async () => {
    try {
      await restore();
      toast.success('Purchases restored successfully!');
    } catch (error) {
      toast.error('Failed to restore purchases.');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[200px]">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Choose Your Plan</h2>
      
      {offerings?.current?.availablePackages && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offerings.current.availablePackages.map((pkg: any) => (
            <div 
              key={pkg.identifier}
              className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">{pkg.product.title}</h3>
              <p className="text-gray-600 mb-4">{pkg.product.description}</p>
              <p className="text-2xl font-bold mb-4">{pkg.product.priceString}</p>
              <button
                onClick={() => handlePurchase(pkg)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                disabled={isLoading}
              >
                Subscribe Now
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <button
          onClick={handleRestore}
          className="text-blue-600 hover:text-blue-800"
          disabled={isLoading}
        >
          Restore Purchases
        </button>
      </div>

      {customerInfo && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Current Subscription Status</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(customerInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}; 