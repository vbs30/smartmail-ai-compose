
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.208.0/crypto/mod.ts"

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
    console.log('Payment verification started')
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()
    console.log('Payment verification data received:', { razorpay_order_id, razorpay_payment_id })
    
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
    
    if (!razorpayKeySecret) {
      console.error('Missing Razorpay key secret')
      throw new Error('Razorpay key secret not configured')
    }

    // Verify signature using Web Crypto API
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const encoder = new TextEncoder()
    const keyData = encoder.encode(razorpayKeySecret)
    const messageData = encoder.encode(body)
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
    const expectedSignature = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    console.log('Signature verification:', { 
      expected: expectedSignature, 
      received: razorpay_signature,
      match: expectedSignature === razorpay_signature 
    })

    if (expectedSignature !== razorpay_signature) {
      console.error('Payment signature verification failed')
      throw new Error('Invalid payment signature')
    }

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No authorization header found')
      throw new Error('No authorization header')
    }

    console.log('Creating Supabase client with auth header')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    console.log('User retrieved:', { userId: user?.id })

    if (!user) {
      console.error('User not authenticated')
      throw new Error('User not authenticated')
    }

    // Update user to pro status
    console.log('Updating user to pro status')
    const { error } = await supabaseClient
      .from('profiles')
      .update({ 
        is_pro: true,
        pro_upgrade_date: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (error) {
      console.error('Failed to update user profile:', error)
      throw new Error('Failed to update user pro status')
    }

    console.log('Payment verification completed successfully')

    return new Response(
      JSON.stringify({ success: true, message: 'Payment verified and user upgraded to Pro' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in verify-razorpay-payment:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
