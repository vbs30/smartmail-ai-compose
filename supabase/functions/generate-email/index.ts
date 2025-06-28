
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, recipientType, businessType, context, tone } = await req.json()

    console.log('Received request:', { type, recipientType, businessType, context, tone })

    // Check if API key is available
    const apiKey = Deno.env.get('SMART_EMAIL_SECRET_KEY')
    if (!apiKey) {
      console.error('OpenAI API key not found')
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    // Create OpenAI prompt
    const prompt = `You are a professional business email writing assistant. Write a ${tone} email from a ${businessType} to a ${recipientType}. 

Context: ${context}

Requirements:
- Generate a compelling subject line
- Write a professional email body that's concise but effective
- Match the requested tone (${tone})
- Avoid generic phrases and make it specific to the context
- Keep the email between 100-200 words
- Include a clear call-to-action when appropriate

Format your response as JSON with "subject" and "body" fields.`

    console.log('Calling OpenAI API...')

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    console.log('OpenAI API response status:', response.status)

    const data = await response.json()
    console.log('OpenAI API response:', data)
    
    if (!response.ok) {
      const errorMessage = data.error?.message || 'Failed to generate email'
      console.error('OpenAI API error:', errorMessage)
      
      // Provide user-friendly error messages
      let userMessage = 'Failed to generate email. Please try again.'
      if (errorMessage.includes('quota')) {
        userMessage = 'OpenAI API quota exceeded. Please check your OpenAI billing or try again later.'
      } else if (errorMessage.includes('rate limit')) {
        userMessage = 'Rate limit exceeded. Please wait a moment before trying again.'
      } else if (errorMessage.includes('invalid')) {
        userMessage = 'Invalid API key. Please check your OpenAI configuration.'
      }
      
      return new Response(
        JSON.stringify({ error: userMessage }),
        { 
          status: 500,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    const content = data.choices[0].message.content
    console.log('Generated content:', content)
    
    // Try to parse JSON response
    let emailData
    try {
      emailData = JSON.parse(content)
    } catch (e) {
      console.log('Failed to parse JSON, trying manual extraction')
      // If JSON parsing fails, try to extract content manually
      const lines = content.split('\n').filter(line => line.trim())
      const subjectLine = lines.find(line => line.toLowerCase().includes('subject'))
      const bodyStart = lines.findIndex(line => line.toLowerCase().includes('body') || line.toLowerCase().includes('email'))
      
      emailData = {
        subject: subjectLine ? subjectLine.replace(/^.*subject[:\s]+/i, '').replace(/"/g, '') : 'Professional Business Email',
        body: bodyStart > -1 ? lines.slice(bodyStart + 1).join('\n') : content
      }
    }

    console.log('Final email data:', emailData)

    return new Response(
      JSON.stringify(emailData),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error generating email:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
