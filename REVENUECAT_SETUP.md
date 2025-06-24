# RevenueCat Web Billing Setup Guide

This guide will help you configure RevenueCat with web billing for the MediHub platform.

## 🚀 Quick Setup

### 1. Create RevenueCat Account

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com/)
2. Sign up for a free account
3. Create a new project for MediHub

### 2. Configure Products

1. In your RevenueCat dashboard, go to **Products**
2. Create two products:
   - `medihub_pro_monthly` - Monthly subscription
   - `medihub_pro_yearly` - Yearly subscription

### 3. Set Up Entitlements

1. Go to **Entitlements**
2. Create an entitlement called `pro`
3. Attach both products to this entitlement

### 4. Configure Web Billing

1. Go to **Project Settings** > **Billing**
2. Enable **Web Billing**
3. Connect your Stripe account
4. Configure web-specific settings

### 5. Get API Keys

1. Go to **Project Settings** > **API Keys**
2. Copy your **Public API Key**
3. Copy your **Webhook Secret** (for backend)

## 🔧 Environment Variables

Create a `.env` file in your project root with:

```env
# RevenueCat Configuration
VITE_REVENUECAT_API_KEY=your_revenuecat_api_key_here

# Stripe Configuration (for web billing)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
VITE_STRIPE_MERCHANT_ID=your_stripe_merchant_id_here

# Optional: RevenueCat Webhook Secret (for backend)
REVENUECAT_WEBHOOK_SECRET=your_webhook_secret_here
```

## 📦 Product Configuration

### Monthly Subscription
- **Product ID**: `medihub_pro_monthly`
- **Price**: $9.99/month
- **Entitlement**: `pro`

### Yearly Subscription
- **Product ID**: `medihub_pro_yearly`
- **Price**: $59.99/year (40% savings)
- **Entitlement**: `pro`

## 🔗 Webhook Setup

### 1. Create Webhook Endpoint

Create a webhook endpoint in your backend (e.g., Supabase Edge Functions):

```typescript
// supabase/functions/revenuecat-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const event = await req.json()
  
  // Verify webhook signature
  const signature = req.headers.get('authorization')
  if (!verifyWebhookSignature(signature, event)) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  // Handle the event
  await handleRevenueCatEvent(event)
  
  return new Response('OK', { status: 200 })
})
```

### 2. Configure Webhook URL

1. In RevenueCat dashboard, go to **Project Settings** > **Webhooks**
2. Add your webhook URL: `https://your-domain.com/api/revenuecat-webhook`
3. Select events to listen for:
   - `INITIAL_PURCHASE`
   - `RENEWAL`
   - `CANCELLATION`
   - `EXPIRATION`

## 🧪 Testing

### Development Mode

The app includes a mock implementation for development:

```typescript
// Mock purchases work in development
if (import.meta.env.DEV) {
  // Simulates successful purchase
  await handleMockPurchase(packageToPurchase);
}
```

### Production Testing

1. Use Stripe test keys for testing
2. Test the full purchase flow
3. Verify webhook events are received
4. Check subscription status updates

## 📊 Analytics & Monitoring

### RevenueCat Dashboard

Monitor:
- Subscription metrics
- Revenue analytics
- Churn analysis
- User behavior

### Custom Events

Track custom events:

```typescript
// Log subscription events
await logSubscriptionEvent('initial_purchase', productId, customerInfo);
```

## 🔒 Security

### API Key Security

- Never expose private API keys in frontend code
- Use environment variables
- Rotate keys regularly

### Webhook Security

- Verify webhook signatures
- Use HTTPS endpoints
- Validate event data

## 🚨 Troubleshooting

### Common Issues

1. **API Key Not Found**
   - Check environment variable name
   - Verify API key is correct
   - Ensure key has proper permissions

2. **Webhook Not Receiving Events**
   - Check webhook URL is accessible
   - Verify webhook secret
   - Check server logs

3. **Purchase Fails**
   - Verify Stripe configuration
   - Check product IDs match
   - Ensure entitlements are configured

### Debug Mode

Enable debug logging:

```typescript
// Add to your code
//console.log('🔄 RevenueCat Debug:', { event, data });
```

## 📚 Resources

- [RevenueCat Documentation](https://docs.revenuecat.com/)
- [Web Billing Guide](https://docs.revenuecat.com/docs/web-billing)
- [Stripe Integration](https://docs.revenuecat.com/docs/stripe)
- [Webhook Events](https://docs.revenuecat.com/docs/webhooks)

## 🎯 Next Steps

1. Set up your RevenueCat account
2. Configure products and entitlements
3. Add environment variables
4. Test the integration
5. Deploy to production
6. Monitor analytics

---

**Need Help?** Check the RevenueCat documentation or contact their support team. 