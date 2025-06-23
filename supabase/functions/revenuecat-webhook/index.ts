import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify webhook signature
    const signature = req.headers.get('authorization')
    const webhookSecret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET')
    
    if (!signature || !webhookSecret) {
      console.error('Missing webhook signature or secret')
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    // Get the event data
    const event = await req.json()
    console.log('🔄 RevenueCat webhook received:', event.event_type)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Handle different event types
    switch (event.event_type) {
      case 'INITIAL_PURCHASE':
        await handleInitialPurchase(supabase, event)
        break
      case 'RENEWAL':
        await handleRenewal(supabase, event)
        break
      case 'CANCELLATION':
        await handleCancellation(supabase, event)
        break
      case 'EXPIRATION':
        await handleExpiration(supabase, event)
        break
      default:
        console.log('Unhandled event type:', event.event_type)
    }

    // Log the event
    await logWebhookEvent(supabase, event)

    return new Response('OK', { status: 200, headers: corsHeaders })
  } catch (error) {
    console.error('❌ Webhook error:', error)
    return new Response('Internal Server Error', { status: 500, headers: corsHeaders })
  }
})

async function handleInitialPurchase(supabase: any, event: any) {
  const { app_user_id, product_id, expiration_at_ms } = event
  
  console.log('💰 Processing initial purchase for user:', app_user_id)
  
  // Find user by RevenueCat user ID
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('revenue_cat_user_id', app_user_id)
    .single()

  if (error || !profile) {
    console.error('❌ User not found for RevenueCat user ID:', app_user_id)
    return
  }

  // Update user subscription status
  const expiresAt = expiration_at_ms ? new Date(expiration_at_ms) : null
  
  await supabase
    .from('profiles')
    .update({
      is_pro: true,
      subscription_status: 'pro',
      subscription_expires_at: expiresAt?.toISOString(),
      revenue_cat_user_id: app_user_id
    })
    .eq('id', profile.id)

  console.log('✅ User subscription activated:', profile.id)
}

async function handleRenewal(supabase: any, event: any) {
  const { app_user_id, expiration_at_ms } = event
  
  console.log('🔄 Processing renewal for user:', app_user_id)
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('revenue_cat_user_id', app_user_id)
    .single()

  if (!profile) return

  const expiresAt = expiration_at_ms ? new Date(expiration_at_ms) : null
  
  await supabase
    .from('profiles')
    .update({
      subscription_expires_at: expiresAt?.toISOString(),
    })
    .eq('id', profile.id)

  console.log('✅ User subscription renewed:', profile.id)
}

async function handleCancellation(supabase: any, event: any) {
  const { app_user_id } = event
  
  console.log('❌ Processing cancellation for user:', app_user_id)
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('revenue_cat_user_id', app_user_id)
    .single()

  if (!profile) return

  await supabase
    .from('profiles')
    .update({
      subscription_status: 'cancelled',
    })
    .eq('id', profile.id)

  console.log('✅ User subscription cancelled:', profile.id)
}

async function handleExpiration(supabase: any, event: any) {
  const { app_user_id } = event
  
  console.log('⏰ Processing expiration for user:', app_user_id)
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('revenue_cat_user_id', app_user_id)
    .single()

  if (!profile) return

  await supabase
    .from('profiles')
    .update({
      is_pro: false,
      subscription_status: 'expired',
    })
    .eq('id', profile.id)

  console.log('✅ User subscription expired:', profile.id)
}

async function logWebhookEvent(supabase: any, event: any) {
  try {
    await supabase
      .from('subscription_events')
      .insert({
        event_type: event.event_type,
        revenue_cat_user_id: event.app_user_id,
        product_id: event.product_id,
        revenue_cat_data: event,
        created_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('❌ Failed to log webhook event:', error)
  }
} 