// Simple mock implementation for now
let purchasesInstance: any = null;

// Initialize RevenueCat with Paddle
export const initializeRevenueCat = async () => {
  try {
    if (!purchasesInstance) {
      // Mock initialization
      purchasesInstance = {
        logIn: async (userId: string) => {
          //console.log('Mock RevenueCat: User logged in', userId);
        },
        logOut: async () => {
          //console.log('Mock RevenueCat: User logged out');
        }
      };
    }
  } catch (error) {
    console.error('Error initializing RevenueCat:', error);
  }
};

// Get available subscription packages
export const getPackages = async () => {
  try {
    if (!purchasesInstance) {
      await initializeRevenueCat();
    }
    
    const offerings = await purchasesInstance.getOfferings();
    return offerings;
  } catch (error) {
    console.error('Failed to get packages:', error);
    
    // Return mock packages for development
    return {
      current: {
        availablePackages: [
          {
            identifier: 'medihub_pro_monthly',
            product: {
              title: 'MediHub Pro Monthly',
              description: 'Full access to all premium features',
              priceString: '$9.99/month',
              price: 9.99,
              currencyCode: 'USD'
            }
          },
          {
            identifier: 'medihub_pro_yearly',
            product: {
              title: 'MediHub Pro Yearly',
              description: 'Full access to all premium features (Save 40%)',
              priceString: '$59.99/year',
              price: 59.99,
              currencyCode: 'USD'
            }
          }
        ]
      }
    };
  }
};

// Purchase a package
export const purchasePackage = async (packageToPurchase: any) => {
  try {
    if (!purchasesInstance) {
      await initializeRevenueCat();
    }

    const { customerInfo } = await purchasesInstance.purchasePackage(packageToPurchase);
    
    // Log the purchase event
    await logSubscriptionEvent('initial_purchase', packageToPurchase.identifier, customerInfo);
    
    return customerInfo;
  } catch (error) {
    console.error('Failed to purchase package:', error);
    
    // For development/demo purposes, simulate successful purchase
    if (import.meta.env.DEV) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ 
            is_pro: true,
            subscription_status: 'pro',
            subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          })
          .eq('id', user.id);
        
        return { success: true };
      }
    }
    
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
    
    // Log the restore event
    await logSubscriptionEvent('restore', null, customerInfo);
    
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
    if (purchasesInstance) {
    await purchasesInstance.logIn(userId);
    }
  } catch (error) {
    console.error('Error identifying user in RevenueCat:', error);
  }
};

// Reset user (call this when user logs out)
export const resetUser = async () => {
  try {
    if (purchasesInstance) {
      await purchasesInstance.logOut();
    }
  } catch (error) {
    console.error('Failed to reset user:', error);
  }
};

// Log subscription events to database
const logSubscriptionEvent = async (eventType: string, productId: string | null, customerInfo: any) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('subscription_events')
      .insert({
        user_id: user.id,
        event_type: eventType,
        product_id: productId,
        revenue_cat_data: customerInfo,
      });

    // Update user's subscription status
    if (eventType === 'initial_purchase' && customerInfo?.entitlements?.active?.pro) {
      await supabase
        .from('profiles')
        .update({
          is_pro: true,
          subscription_status: 'pro',
          subscription_expires_at: customerInfo.entitlements.active.pro.expirationDate,
        })
        .eq('id', user.id);
    }
  } catch (error) {
    console.error('Failed to log subscription event:', error);
  }
};

// Webhook handler for RevenueCat events (for backend)
export const handleRevenueCatWebhook = async (event: any) => {
  try {
    const { event_type, app_user_id, product_id, expiration_at_ms } = event;
    
    // Find user by RevenueCat user ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('revenue_cat_user_id', app_user_id)
      .single();

    if (!profile) {
      console.error('User not found for RevenueCat user ID:', app_user_id);
      return;
    }

    // Log the event
    await supabase
      .from('subscription_events')
      .insert({
        user_id: profile.id,
        event_type,
        revenue_cat_user_id: app_user_id,
        product_id,
        revenue_cat_data: event,
      });

    // Update subscription status based on event type
    const expiresAt = expiration_at_ms ? new Date(expiration_at_ms) : null;
    
    await supabase.rpc('handle_subscription_event', {
      user_id_param: profile.id,
      event_type_param: event_type,
      product_id_param: product_id,
      expires_at_param: expiresAt?.toISOString(),
    });

  } catch (error) {
    console.error('Error handling RevenueCat webhook:', error);
    throw error;
  }
};