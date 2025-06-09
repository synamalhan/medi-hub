import { Purchases } from '@revenuecat/purchases-js';

let purchasesInstance: any = null;

// Initialize RevenueCat with your public API key
export const initializeRevenueCat = async () => {
  try {
    purchasesInstance = await Purchases.configure(
      import.meta.env.VITE_REVENUECAT_PUBLIC_KEY,
      'paddle',
      import.meta.env.VITE_PADDLE_API_KEY,
      import.meta.env.VITE_REVENUECAT_ID
    );
    console.log('RevenueCat initialized successfully');
    return purchasesInstance;
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
    throw error;
  }
};

// Get available packages
export const getPackages = async () => {
  try {
    if (!purchasesInstance) {
      await initializeRevenueCat();
    }
    const offerings = await purchasesInstance.getOfferings();
    return offerings;
  } catch (error) {
    console.error('Failed to get packages:', error);
    return null;
  }
};

// Purchase a package
export const purchasePackage = async (packageToPurchase: any) => {
  try {
    if (!purchasesInstance) {
      await initializeRevenueCat();
    }
    const { customerInfo } = await purchasesInstance.purchasePackage(packageToPurchase);
    return customerInfo;
  } catch (error) {
    console.error('Failed to purchase package:', error);
    throw error;
  }
};

// Restore purchases
export const restorePurchases = async () => {
  try {
    if (!purchasesInstance) {
      await initializeRevenueCat();
    }
    const customerInfo = await purchasesInstance.restorePurchases();
    return customerInfo;
  } catch (error) {
    console.error('Failed to restore purchases:', error);
    throw error;
  }
};

// Get current customer info
export const getCustomerInfo = async () => {
  try {
    if (!purchasesInstance) {
      await initializeRevenueCat();
    }
    const customerInfo = await purchasesInstance.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('Failed to get customer info:', error);
    throw error;
  }
};

// Identify user (call this when user logs in)
export const identifyUser = async (userId: string) => {
  try {
    if (!purchasesInstance) {
      await initializeRevenueCat();
    }
    await purchasesInstance.logIn(userId);
    const customerInfo = await purchasesInstance.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('Failed to identify user:', error);
    throw error;
  }
};

// Reset user (call this when user logs out)
export const resetUser = async () => {
  try {
    if (!purchasesInstance) {
      await initializeRevenueCat();
    }
    await purchasesInstance.logOut();
  } catch (error) {
    console.error('Failed to reset user:', error);
    throw error;
  }
}; 