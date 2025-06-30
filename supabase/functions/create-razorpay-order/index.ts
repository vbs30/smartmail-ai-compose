
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    console.log('Razorpay order creation started')
    
    const { amount, currency = 'INR' } = await req.json()
    console.log('Request data:', { amount, currency })
    
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

    console.log('Environment check:', {
      hasKeyId: !!razorpayKeyId,
      hasKeySecret: !!razorpayKeySecret
    })

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Missing Razorpay credentials')
      throw new Error('Razorpay credentials not configured')
    }

    // Create Razorpay order
    const orderData = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        product: 'SmartMail AI Pro'
      }
    }

    console.log('Creating order with Razorpay API:', orderData)

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })

    const order = await response.json()
    console.log('Razorpay API response:', { status: response.status, order })

    if (!response.ok) {
      console.error('Razorpay API error:', order)
      throw new Error(order.error?.description || 'Failed to create Razorpay order')
    }

    const result = { 
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: razorpayKeyId
    }

    console.log('Order created successfully:', result)

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in create-razorpay-order:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
