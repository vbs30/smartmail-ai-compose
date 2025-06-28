
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

    // Create prompt for email generation
    const prompt = `Write a professional ${tone} business email from a ${businessType} to a ${recipientType}.

Context: ${context}

Requirements:
- Generate a compelling subject line
- Write a professional email body that's concise but effective
- Match the requested tone (${tone})
- Keep the email between 100-200 words
- Include a clear call-to-action when appropriate

Please format your response as:
Subject: [Your subject line here]

Body:
[Your email body here]`

    console.log('Calling Hugging Face API...')

    // Using Hugging Face's free inference API
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-large', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          return_full_text: false
        }
      }),
    })

    console.log('Hugging Face API response status:', response.status)

    if (!response.ok) {
      // If the model is loading, try a different approach
      console.log('Trying alternative free model...')
      
      // Use a simple text generation approach as fallback
      const fallbackResponse = await fetch('https://api-inference.huggingface.co/models/gpt2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `Subject: Professional ${type} email\n\nDear ${recipientType},\n\n${context}\n\nBest regards,\n${businessType}`,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.8
          }
        }),
      })

      if (!fallbackResponse.ok) {
        // Generate a simple template-based email as final fallback
        console.log('Using template-based generation')
        const emailData = generateTemplateEmail(type, recipientType, businessType, context, tone)
        
        return new Response(
          JSON.stringify(emailData),
          { 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            } 
          }
        )
      }

      const fallbackData = await fallbackResponse.json()
      const generatedText = Array.isArray(fallbackData) ? fallbackData[0]?.generated_text : fallbackData.generated_text
      
      const emailData = parseEmailFromText(generatedText || '')
      
      return new Response(
        JSON.stringify(emailData),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    const data = await response.json()
    console.log('Hugging Face API response:', data)
    
    const generatedText = Array.isArray(data) ? data[0]?.generated_text : data.generated_text
    const emailData = parseEmailFromText(generatedText || '')

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
    
    // Generate a template-based email as final fallback
    try {
      const { type, recipientType, businessType, context, tone } = await req.json()
      const emailData = generateTemplateEmail(type, recipientType, businessType, context, tone)
      
      return new Response(
        JSON.stringify(emailData),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      )
    } catch (fallbackError) {
      return new Response(
        JSON.stringify({ error: 'Unable to generate email. Please try again.' }),
        { 
          status: 500,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      )
    }
  }
})

function parseEmailFromText(text: string) {
  const lines = text.split('\n').filter(line => line.trim())
  
  let subject = 'Professional Business Email'
  let body = text
  
  // Try to extract subject
  const subjectLine = lines.find(line => 
    line.toLowerCase().includes('subject:') || 
    line.toLowerCase().startsWith('subject')
  )
  
  if (subjectLine) {
    subject = subjectLine.replace(/^.*subject[:\s]+/i, '').trim()
    // Remove subject from body
    body = text.replace(subjectLine, '').trim()
  }
  
  // Clean up the body
  body = body.replace(/^subject:.*$/im, '').trim()
  
  return { subject, body }
}

function generateTemplateEmail(type: string, recipientType: string, businessType: string, context: string, tone: string) {
  const templates = {
    cold_email: {
      subject: `Partnership Opportunity with ${businessType}`,
      body: `Dear ${recipientType},

I hope this email finds you well. I'm reaching out from ${businessType} regarding ${context}.

We believe there's a great opportunity for collaboration that could benefit both of our organizations. Our expertise in this area has helped numerous clients achieve their goals.

${tone === 'formal' ? 'I would be delighted to schedule a brief call to discuss this opportunity further.' : 'Would love to hop on a quick call to chat about this!'}

Best regards,
${businessType} Team`
    },
    follow_up: {
      subject: `Following up on our conversation`,
      body: `Hi there,

I wanted to follow up on our previous conversation regarding ${context}.

${tone === 'formal' ? 'I trust you have had time to consider our proposal.' : 'Hope you\'ve had a chance to think things over!'} 

From ${businessType}, we're committed to providing excellent service to ${recipientType}s like yourself.

Please let me know if you have any questions or if there's anything else I can help with.

Best regards,
${businessType} Team`
    },
    offer: {
      subject: `Special Offer from ${businessType}`,
      body: `Dear ${recipientType},

We have an exciting offer that I believe would be of great interest to you!

${context}

As a ${businessType}, we're committed to providing exceptional value to our clients. This limited-time offer is our way of showing appreciation for ${recipientType}s like yourself.

${tone === 'formal' ? 'Please feel free to contact us to discuss this opportunity.' : 'Let\'s chat about how this can benefit you!'}

Best regards,
${businessType} Team`
    },
    apology: {
      subject: `Our Sincere Apologies`,
      body: `Dear ${recipientType},

I am writing to sincerely apologize regarding ${context}.

As a ${businessType}, we take full responsibility for this situation and are committed to making things right. We value our relationship with ${recipientType}s like yourself.

${tone === 'formal' ? 'We would appreciate the opportunity to discuss how we can resolve this matter to your satisfaction.' : 'We\'d love to make this right - let\'s talk!'}

Thank you for your understanding.

Sincerely,
${businessType} Team`
    },
    partnership: {
      subject: `Partnership Proposal from ${businessType}`,
      body: `Dear ${recipientType},

I hope this message finds you well. I'm reaching out to explore a potential partnership opportunity.

${context}

As a ${businessType}, we believe that collaborating with ${recipientType}s like yourself could create mutual value and drive success for both parties.

${tone === 'formal' ? 'I would welcome the opportunity to discuss this proposal in more detail at your convenience.' : 'Would love to brainstorm some ideas together!'}

Looking forward to hearing from you.

Best regards,
${businessType} Team`
    }
  }
  
  return templates[type as keyof typeof templates] || templates.cold_email
}
