
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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SMART_EMAIL_SECRET_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
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

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate email')
    }

    const content = data.choices[0].message.content
    
    // Try to parse JSON response
    let emailData
    try {
      emailData = JSON.parse(content)
    } catch (e) {
      // If JSON parsing fails, try to extract content manually
      const lines = content.split('\n').filter(line => line.trim())
      const subjectLine = lines.find(line => line.toLowerCase().includes('subject'))
      const bodyStart = lines.findIndex(line => line.toLowerCase().includes('body') || line.toLowerCase().includes('email'))
      
      emailData = {
        subject: subjectLine ? subjectLine.replace(/^.*subject[:\s]+/i, '').replace(/"/g, '') : 'Professional Business Email',
        body: bodyStart > -1 ? lines.slice(bodyStart + 1).join('\n') : content
      }
    }

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
      JSON.stringify({ error: error.message }),
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
