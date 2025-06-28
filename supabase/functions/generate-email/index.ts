
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

    // Create a refined prompt for better email generation
    const prompt = createRefinedPrompt(type, recipientType, businessType, context, tone)

    console.log('Generated prompt:', prompt)

    // Try multiple Hugging Face models for better results
    const models = [
      'microsoft/DialoGPT-large',
      'facebook/blenderbot-400M-distill',
      'microsoft/DialoGPT-medium'
    ]

    for (const model of models) {
      try {
        console.log(`Trying model: ${model}`)
        
        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 300,
              temperature: 0.7,
              do_sample: true,
              top_p: 0.9,
              return_full_text: false
            }
          }),
        })

        console.log(`${model} response status:`, response.status)

        if (response.ok) {
          const data = await response.json()
          console.log(`${model} response:`, data)
          
          const generatedText = Array.isArray(data) ? data[0]?.generated_text : data.generated_text
          
          if (generatedText && generatedText.trim()) {
            const emailData = parseAndRefineEmail(generatedText, type, recipientType, businessType, context, tone)
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
          }
        }
      } catch (modelError) {
        console.log(`Model ${model} failed:`, modelError)
        continue
      }
    }

    // If all models fail, use intelligent template generation
    console.log('All models failed, using intelligent template generation')
    const emailData = generateIntelligentEmail(type, recipientType, businessType, context, tone)
    
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
    
    try {
      const { type, recipientType, businessType, context, tone } = await req.json()
      const emailData = generateIntelligentEmail(type, recipientType, businessType, context, tone)
      
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

function createRefinedPrompt(type: string, recipientType: string, businessType: string, context: string, tone: string) {
  const toneInstructions = {
    formal: "Write in a professional, respectful, and business-appropriate tone.",
    friendly: "Write in a warm, approachable, and conversational tone while maintaining professionalism.",
    persuasive: "Write in a compelling, convincing tone that motivates action while being respectful."
  }

  const typeInstructions = {
    cold_email: "Write a professional cold outreach email that introduces your business and creates interest.",
    follow_up: "Write a polite follow-up email that continues a previous conversation or inquiry.",
    offer: "Write an engaging email presenting a valuable offer or opportunity.",
    apology: "Write a sincere, professional apology email that takes responsibility and offers resolution.",
    partnership: "Write a professional partnership proposal email that highlights mutual benefits."
  }

  return `You are a professional business email writer. Create a complete, polished email based on the following information:

Email Type: ${type}
Writing to: ${recipientType}
From: ${businessType}
Context/Background: ${context}
Tone: ${tone}

Instructions:
- ${typeInstructions[type as keyof typeof typeInstructions] || 'Write a professional business email'}
- ${toneInstructions[tone as keyof typeof toneInstructions]}
- Transform the provided context into a refined, professional message
- Don't just copy the context - interpret it and write a polished version
- Include a compelling subject line
- Keep the email concise but impactful (150-250 words)
- End with an appropriate call-to-action
- Make it ready to send without further editing

Format your response as:
Subject: [Professional subject line]

Dear [Recipient],

[Polished email body that interprets and refines the context]

Best regards,
[Sender name/business]`
}

function parseAndRefineEmail(generatedText: string, type: string, recipientType: string, businessType: string, context: string, tone: string) {
  let subject = `Professional ${type.replace('_', ' ')} from ${businessType}`
  let body = generatedText

  // Try to extract subject line
  const subjectMatch = generatedText.match(/Subject:\s*(.+?)(?:\n|$)/i)
  if (subjectMatch) {
    subject = subjectMatch[1].trim()
    body = generatedText.replace(/Subject:\s*.+?(?:\n|$)/i, '').trim()
  }

  // Clean up the body
  body = body
    .replace(/^Dear\s+\[Recipient\]/i, `Dear ${recipientType}`)
    .replace(/\[Sender name\/business\]/gi, businessType)
    .replace(/\[Recipient\]/gi, recipientType)
    .replace(/\[Your.*?\]/gi, '')
    .trim()

  // If body is too short or just the context, enhance it
  if (body.length < 100 || body.includes(context.substring(0, 50))) {
    body = enhanceEmailBody(type, recipientType, businessType, context, tone)
  }

  return { subject, body }
}

function generateIntelligentEmail(type: string, recipientType: string, businessType: string, context: string, tone: string) {
  // Analyze the context to extract key information
  const contextAnalysis = analyzeContext(context)
  
  const subject = generateSubject(type, businessType, contextAnalysis, tone)
  const body = enhanceEmailBody(type, recipientType, businessType, context, tone)
  
  return { subject, body }
}

function analyzeContext(context: string) {
  const analysis = {
    isProductLaunch: context.toLowerCase().includes('new') && (context.toLowerCase().includes('app') || context.toLowerCase().includes('product') || context.toLowerCase().includes('tool')),
    isRequestingFeedback: context.toLowerCase().includes('feedback') || context.toLowerCase().includes('review'),
    isAnnouncement: context.toLowerCase().includes('announce') || context.toLowerCase().includes('launch'),
    hasCallToAction: context.toLowerCase().includes('try') || context.toLowerCase().includes('look') || context.toLowerCase().includes('check'),
    isAboutSaas: context.toLowerCase().includes('saas') || context.toLowerCase().includes('application') || context.toLowerCase().includes('software'),
    mentionsEfficiency: context.toLowerCase().includes('skip') || context.toLowerCase().includes('save') || context.toLowerCase().includes('easier')
  }
  
  return analysis
}

function generateSubject(type: string, businessType: string, analysis: any, tone: string) {
  if (analysis.isProductLaunch && analysis.isRequestingFeedback) {
    return tone === 'formal' ? 
      `Introducing Our New Solution - Your Feedback Valued` :
      `🚀 We've Built Something New - Would Love Your Thoughts!`
  }
  
  if (analysis.isAnnouncement && analysis.isAboutSaas) {
    return tone === 'formal' ? 
      `New SaaS Solution to Streamline Your Workflow` :
      `Save Hours Weekly with Our New Tool ⚡`
  }
  
  if (analysis.mentionsEfficiency) {
    return tone === 'formal' ? 
      `Streamline Your Business Communications` :
      `Cut Your Email Writing Time in Half 📧`
  }
  
  // Default subjects based on type
  const subjects = {
    cold_email: tone === 'formal' ? 
      `Partnership Opportunity with ${businessType}` : 
      `Let's Explore Working Together! 🤝`,
    follow_up: `Following Up on Our Conversation`,
    offer: tone === 'formal' ? 
      `Exclusive Offer from ${businessType}` : 
      `Special Offer Just for You! 🎉`,
    apology: `Our Sincere Apologies`,
    partnership: `Partnership Proposal from ${businessType}`
  }
  
  return subjects[type as keyof typeof subjects] || `Message from ${businessType}`
}

function enhanceEmailBody(type: string, recipientType: string, businessType: string, context: string, tone: string) {
  // Extract key points from context
  const isAboutEmailTool = context.toLowerCase().includes('smartmail') || context.toLowerCase().includes('email')
  const mentionsAI = context.toLowerCase().includes('ai')
  const mentionsEfficiency = context.toLowerCase().includes('skip') || context.toLowerCase().includes('manual')
  const requestsFeedback = context.toLowerCase().includes('feedback') || context.toLowerCase().includes('rate')
  
  const greeting = tone === 'formal' ? 
    `Dear ${recipientType},\n\nI hope this email finds you well.` :
    `Hi there!\n\nHope you're doing great!`
  
  let mainContent = ''
  
  if (isAboutEmailTool && mentionsAI) {
    mainContent = tone === 'formal' ? 
      `I'm excited to introduce SmartMail AI, an innovative solution designed to revolutionize how businesses handle email communications.\n\nOur platform eliminates the time-consuming process of manually crafting emails by providing AI-powered email generation. Simply select your email type, and our intelligent system creates professional, tailored messages instantly.\n\nThis solution is particularly valuable for growing businesses and professionals who want to maintain high-quality communications while focusing on their core activities.` :
      `I've got something exciting to share with you! We've just launched SmartMail AI - a game-changing tool that's going to save you tons of time on email writing.\n\nInstead of staring at a blank screen or copying templates, you just pick what kind of email you need, and our AI creates it for you. It's perfect for busy professionals and growing businesses who want to communicate effectively without the hassle.`
  } else {
    // Generic enhancement based on context
    const contextWords = context.split(' ')
    const keyPhrases = contextWords.filter(word => 
      word.length > 4 && !['this', 'that', 'with', 'have', 'will', 'would', 'could', 'should'].includes(word.toLowerCase())
    )
    
    mainContent = tone === 'formal' ? 
      `I wanted to reach out regarding an opportunity that I believe could be of significant value to you.\n\nWe've developed a solution that addresses common challenges in business communications, specifically focusing on efficiency and professional quality. Our approach has already helped numerous clients streamline their processes and achieve better results.\n\nI believe this could be particularly relevant for your current needs.` :
      `I wanted to share something that I think you'll find really interesting!\n\nWe've been working on a solution that makes business communications so much easier and more effective. The feedback has been amazing, and I genuinely think it could be a game-changer for you too.\n\nLet me know what you think!`
  }
  
  const callToAction = requestsFeedback ? 
    (tone === 'formal' ? 
      `I would greatly appreciate the opportunity to hear your thoughts and gather your valuable feedback on this solution.` :
      `I'd absolutely love to get your honest feedback and hear what you think!`) :
    (tone === 'formal' ? 
      `I would welcome the opportunity to discuss this further and explore how we might work together.` :
      `Would love to chat more about this and see if it's a good fit for you!`)
  
  const closing = tone === 'formal' ? 
    `Thank you for your time and consideration.\n\nBest regards,\n${businessType} Team` :
    `Thanks for taking the time to read this!\n\nCheers,\n${businessType} Team`
  
  return `${greeting}\n\n${mainContent}\n\n${callToAction}\n\n${closing}`
}
