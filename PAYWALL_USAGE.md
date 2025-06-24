# RevenueCat Paywall Usage Guide

This guide shows you how to use the RevenueCat paywall system throughout your MediHub application.

## 🚀 Quick Start

### 1. Basic Paywall Usage

```tsx
import { usePaywall } from '../components/PaywallProvider';

function MyComponent() {
  const { showPaywall } = usePaywall();

  const handleUpgrade = () => {
    showPaywall({
      variant: 'modal',
      trigger: 'upgrade',
      onSuccess: () => {
        //console.log('User upgraded to Pro!');
        // Refresh the page or component
        window.location.reload();
      }
    });
  };

  return (
    <button onClick={handleUpgrade}>
      Upgrade to Pro
    </button>
  );
}
```

### 2. Feature Gating with ProFeature Component

```tsx
import { ProFeature } from '../components/ProFeature';

function MyPage() {
  return (
    <div>
      <h1>My Page</h1>
      
      {/* Free content */}
      <p>This content is available to everyone.</p>
      
      {/* Pro-only content */}
      <ProFeature featureName="Advanced Analytics">
        <div className="advanced-analytics">
          <h2>Advanced Analytics Dashboard</h2>
          <p>This is premium content only available to Pro users.</p>
        </div>
      </ProFeature>
    </div>
  );
}
```

## 🎯 Usage Patterns

### 1. Modal Paywall

```tsx
// Show a modal paywall
showPaywall({
  variant: 'modal',
  trigger: 'feature',
  onSuccess: () => {
    // Handle successful upgrade
  }
});
```

### 2. Full-Screen Paywall

```tsx
// Show a full-screen paywall
showPaywall({
  variant: 'full',
  trigger: 'upgrade',
  onSuccess: () => {
    // Handle successful upgrade
  }
});
```

### 3. Compact Paywall

```tsx
// Show a compact paywall inline
<SubscriptionPaywall 
  variant="compact" 
  trigger="trial"
  onSuccess={handleSuccess}
/>
```

## 🔒 Feature Gating Options

### 1. Overlay Variant (Default)

```tsx
<ProFeature featureName="AI Summaries" variant="overlay">
  <div className="ai-summarizer">
    <h2>AI Research Summarizer</h2>
    <p>Upload papers and get instant AI summaries.</p>
  </div>
</ProFeature>
```

### 2. Compact Variant

```tsx
<ProFeature featureName="Advanced Analytics" variant="compact">
  <div className="analytics-dashboard">
    {/* Analytics content */}
  </div>
</ProFeature>
```

### 3. Inline Variant

```tsx
<ProFeature featureName="Priority Support" variant="inline">
  <div className="support-section">
    {/* Support content */}
  </div>
</ProFeature>
```

### 4. Hidden Variant

```tsx
<ProFeature featureName="Export Data" showUpgradePrompt={false}>
  <button>Export Data</button>
</ProFeature>
```

## 🎨 Custom Triggers

### 1. Feature Trigger

```tsx
showPaywall({
  trigger: 'feature',
  variant: 'modal',
  onSuccess: () => {
    // Unlock the specific feature
    unlockFeature();
  }
});
```

### 2. Upgrade Trigger

```tsx
showPaywall({
  trigger: 'upgrade',
  variant: 'full',
  onSuccess: () => {
    // General upgrade success
    refreshUserData();
  }
});
```

### 3. Trial Trigger

```tsx
showPaywall({
  trigger: 'trial',
  variant: 'modal',
  onSuccess: () => {
    // Start trial
    startTrial();
  }
});
```

## 📱 Integration Examples

### 1. Navigation Menu

```tsx
import { usePaywall } from '../components/PaywallProvider';

function Navigation() {
  const { showPaywall } = usePaywall();
  const { user } = useAuthStore();

  return (
    <nav>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/flashcards">Flashcards</Link>
      
      {/* Pro-only navigation item */}
      {user?.isPro ? (
        <Link to="/analytics">Analytics</Link>
      ) : (
        <button 
          onClick={() => showPaywall({ trigger: 'feature' })}
          className="pro-feature-link"
        >
          Analytics (Pro)
        </button>
      )}
    </nav>
  );
}
```

### 2. Feature Cards

```tsx
function FeatureCard({ title, description, isPro, onUpgrade }) {
  return (
    <div className="feature-card">
      <h3>{title}</h3>
      <p>{description}</p>
      
      {isPro ? (
        <button className="btn-primary">Use Feature</button>
      ) : (
        <button 
          onClick={onUpgrade}
          className="btn-secondary"
        >
          Upgrade to Pro
        </button>
      )}
    </div>
  );
}
```

### 3. Usage Limits

```tsx
function MnemonicsGenerator() {
  const { user } = useAuthStore();
  const { showPaywall } = usePaywall();
  const [usageCount, setUsageCount] = useState(0);
  
  const maxFreeUsage = 5;
  const isLimitReached = !user?.isPro && usageCount >= maxFreeUsage;

  const handleGenerate = () => {
    if (isLimitReached) {
      showPaywall({
        trigger: 'feature',
        onSuccess: () => {
          // User upgraded, allow generation
          generateMnemonic();
        }
      });
      return;
    }
    
    generateMnemonic();
    setUsageCount(prev => prev + 1);
  };

  return (
    <div>
      <button onClick={handleGenerate}>
        Generate Mnemonic
      </button>
      
      {!user?.isPro && (
        <p className="usage-info">
          {usageCount}/{maxFreeUsage} free generations used
        </p>
      )}
    </div>
  );
}
```

## 🎯 Advanced Patterns

### 1. Conditional Rendering

```tsx
function ConditionalFeature() {
  const { user } = useAuthStore();
  const { showPaywall } = usePaywall();

  if (!user?.isPro) {
    return (
      <div className="upgrade-prompt">
        <h3>Unlock Premium Features</h3>
        <p>Upgrade to Pro to access advanced analytics and unlimited AI generations.</p>
        <button onClick={() => showPaywall()}>
          Upgrade Now
        </button>
      </div>
    );
  }

  return <PremiumFeature />;
}
```

### 2. Higher-Order Component

```tsx
import { withProFeature } from '../components/ProFeature';

// Wrap an entire page component
const AnalyticsPage = withProFeature(Analytics, 'Analytics Dashboard');

// Use in routes
<Route path="/analytics" element={<AnalyticsPage />} />
```

### 3. Custom Hook

```tsx
import { useFeatureGate } from '../components/PaywallProvider';

function MyComponent() {
  const { requirePro } = useFeatureGate('Advanced AI Features');

  const handleAdvancedFeature = () => {
    requirePro();
  };

  return (
    <button onClick={handleAdvancedFeature}>
      Use Advanced AI
    </button>
  );
}
```

## 🎨 Styling Customization

### 1. Custom Paywall Styling

```tsx
// The paywall uses Tailwind classes, so you can customize via CSS
.paywall-modal {
  @apply bg-white rounded-2xl shadow-2xl;
}

.paywall-overlay {
  @apply bg-black bg-opacity-50;
}
```

### 2. ProFeature Variants

```tsx
// Overlay (default) - covers the entire feature
<ProFeature variant="overlay">
  <div>Feature content</div>
</ProFeature>

// Compact - shows upgrade button overlaid
<ProFeature variant="compact">
  <div>Feature content</div>
</ProFeature>

// Inline - shows upgrade prompt inline
<ProFeature variant="inline">
  <div>Feature content</div>
</ProFeature>
```

## 🔧 Configuration

### 1. Environment Variables

Make sure these are set in your `.env` file:

```env
VITE_REVENUECAT_API_KEY=your_api_key_here
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key_here
VITE_STRIPE_MERCHANT_ID=your_merchant_id_here
```

### 2. RevenueCat Products

Ensure these products are configured in RevenueCat:

- `medihub_pro_monthly` - Monthly subscription
- `medihub_pro_yearly` - Yearly subscription
- `pro` entitlement

## 🚨 Best Practices

### 1. User Experience

- Show paywall at the right moment (when user tries to use a feature)
- Provide clear value proposition
- Make it easy to upgrade
- Don't be too aggressive with prompts

### 2. Performance

- Lazy load paywall components
- Cache subscription status
- Handle loading states gracefully

### 3. Analytics

- Track paywall impressions
- Monitor conversion rates
- A/B test different paywall variants

### 4. Error Handling

```tsx
const handleUpgrade = async () => {
  try {
    showPaywall({
      onSuccess: () => {
        toast.success('Welcome to Pro!');
      }
    });
  } catch (error) {
    console.error('Paywall error:', error);
    toast.error('Failed to show upgrade options');
  }
};
```

## 📊 Monitoring

### 1. Track Paywall Events

```tsx
// In your analytics service
const trackPaywallEvent = (event, data) => {
  analytics.track('paywall_event', {
    event,
    variant: data.variant,
    trigger: data.trigger,
    timestamp: new Date().toISOString()
  });
};
```

### 2. Conversion Tracking

```tsx
showPaywall({
  onSuccess: () => {
    // Track successful conversion
    analytics.track('subscription_converted', {
      plan: selectedPlan,
      source: 'paywall'
    });
  }
});
```

---

**Need Help?** Check the RevenueCat documentation or contact support for advanced configuration options. 