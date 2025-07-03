
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    logStep("Function started");

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      logStep("No authorization header found")
      throw new Error('No authorization header')
    }

    logStep("Creating Supabase client")
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    logStep('User retrieved', { userId: user?.id })

    if (!user) {
      logStep('User not authenticated')
      throw new Error('User not authenticated')
    }

    // Get user profile to check pro status
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      logStep('Error fetching profile', { error: profileError })
      throw new Error('Failed to fetch user profile')
    }

    logStep('Profile retrieved', { isPro: profile.is_pro })

    // For now, we'll return subscription info based on the profile
    // In a real implementation, you'd integrate with your payment provider
    const subscriptionInfo = {
      subscribed: profile.is_pro,
      subscription_tier: profile.is_pro ? 'Pro' : null,
      subscription_start: profile.is_pro ? profile.updated_at : null,
      subscription_end: profile.is_pro ? 
        new Date(new Date(profile.updated_at).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() : 
        null
    }

    logStep('Subscription info prepared', subscriptionInfo)

    return new Response(
      JSON.stringify(subscriptionInfo),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    logStep('Error in check-subscription', { error: error.message })
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
