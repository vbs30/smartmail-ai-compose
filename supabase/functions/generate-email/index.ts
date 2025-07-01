
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
    mentionsEfficiency: context.toLowerCase().includes('skip') || context.toLowerCase().includes('save') || context.toLowerCase().includes('easier'),
    isMeeting: context.toLowerCase().includes('meeting') || context.toLowerCase().includes('call') || context.toLowerCase().includes('schedule'),
    isProposal: context.toLowerCase().includes('proposal') || context.toLowerCase().includes('offer') || context.toLowerCase().includes('quote'),
    isThankYou: context.toLowerCase().includes('thank') || context.toLowerCase().includes('grateful'),
    isIntroduction: context.toLowerCase().includes('introduce') || context.toLowerCase().includes('introduction'),
    isUrgent: context.toLowerCase().includes('urgent') || context.toLowerCase().includes('asap') || context.toLowerCase().includes('immediately')
  }
  
  return analysis
}

function generateSubject(type: string, businessType: string, analysis: any, tone: string) {
  const subjectTemplates = {
    cold_email: {
      formal: [
        `Partnership Opportunity with ${businessType}`,
        `Exploring Potential Collaboration`,
        `Business Development Inquiry`,
        `Strategic Partnership Discussion`
      ],
      friendly: [
        `Let's Explore Working Together! 🤝`,
        `Exciting Collaboration Opportunity`,
        `Quick Chat About Partnership?`,
        `Would Love to Connect!`
      ],
      persuasive: [
        `Exclusive Partnership Opportunity`,
        `Transform Your Business with ${businessType}`,
        `Limited-Time Collaboration Offer`,
        `Game-Changing Partnership Awaits`
      ]
    },
    follow_up: {
      formal: [
        `Following Up on Our Previous Discussion`,
        `Next Steps for Our Conversation`,
        `Continuing Our Business Discussion`,
        `Update on Previous Inquiry`
      ],
      friendly: [
        `Just Checking In! 👋`,
        `Quick Follow-up on Our Chat`,
        `Hope You're Doing Well!`,
        `Circling Back on Our Conversation`
      ],
      persuasive: [
        `Don't Miss This Opportunity`,
        `Time-Sensitive Follow-up`,
        `Your Success Depends on This`,
        `Final Reminder - Act Now`
      ]
    },
    offer: {
      formal: [
        `Exclusive Offer from ${businessType}`,
        `Special Proposal for Your Business`,
        `Limited-Time Business Opportunity`,
        `Professional Service Offer`
      ],
      friendly: [
        `Special Offer Just for You! 🎉`,
        `Amazing Deal Inside!`,
        `You're Going to Love This!`,
        `Surprise Offer from ${businessType}`
      ],
      persuasive: [
        `Unmissable Offer - 24 Hours Only`,
        `Your Competitors Don't Know About This`,
        `Last Chance for Exclusive Deal`,
        `Transform Your Business Today`
      ]
    },
    apology: {
      formal: [
        `Our Sincere Apologies`,
        `Important Update and Apology`,
        `Formal Apology from ${businessType}`,
        `Addressing Recent Concerns`
      ],
      friendly: [
        `We're Really Sorry 😔`,
        `Sincere Apologies from Our Team`,
        `Making Things Right`,
        `Our Heartfelt Apology`
      ],
      persuasive: [
        `How We're Making This Right`,
        `Your Trust Matters - Our Response`,
        `Turning This Around for You`,
        `Our Commitment to Excellence`
      ]
    },
    partnership: {
      formal: [
        `Partnership Proposal from ${businessType}`,
        `Strategic Alliance Opportunity`,
        `Mutual Benefit Partnership Discussion`,
        `Business Collaboration Proposal`
      ],
      friendly: [
        `Let's Build Something Amazing Together!`,
        `Partnership Opportunity - Exciting!`,
        `Growing Together - Partnership Idea`,
        `Team Up for Success! 🚀`
      ],
      persuasive: [
        `Exclusive Partnership - Limited Spots`,
        `Join Our Success Story`,
        `Partnership That Changes Everything`,
        `Your Competitive Advantage Awaits`
      ]
    }
  }

  // Context-specific subject modifications
  if (analysis.isUrgent) {
    return tone === 'formal' ? 
      `Urgent: ${getRandomTemplate(subjectTemplates[type as keyof typeof subjectTemplates][tone])}` :
      `🚨 Urgent: ${getRandomTemplate(subjectTemplates[type as keyof typeof subjectTemplates][tone])}`
  }

  if (analysis.isMeeting && type === 'follow_up') {
    return tone === 'formal' ? 
      'Meeting Follow-up and Next Steps' :
      'Great Meeting Today! Next Steps 📅'
  }

  if (analysis.isProposal && type === 'cold_email') {
    return tone === 'formal' ? 
      `Business Proposal from ${businessType}` :
      `Exciting Proposal for Your Business! 💡`
  }

  // Default to random template from appropriate category
  const templates = subjectTemplates[type as keyof typeof subjectTemplates]?.[tone as keyof typeof subjectTemplates['cold_email']] || 
                   [`Message from ${businessType}`]
  
  return getRandomTemplate(templates)
}

function getRandomTemplate(templates: string[]): string {
  return templates[Math.floor(Math.random() * templates.length)]
}

function enhanceEmailBody(type: string, recipientType: string, businessType: string, context: string, tone: string) {
  const analysis = analyzeContext(context)
  
  // Generate opening based on tone and type
  const opening = generateOpening(tone, recipientType, type, analysis)
  
  // Generate main content based on context analysis
  const mainContent = generateMainContent(type, businessType, context, tone, analysis)
  
  // Generate call to action
  const callToAction = generateCallToAction(type, tone, analysis)
  
  // Generate closing
  const closing = generateClosing(tone, businessType)
  
  return `${opening}\n\n${mainContent}\n\n${callToAction}\n\n${closing}`
}

function generateOpening(tone: string, recipientType: string, type: string, analysis: any) {
  const openings = {
    formal: [
      `Dear ${recipientType},\n\nI hope this email finds you well.`,
      `Dear ${recipientType},\n\nI trust this message reaches you at a good time.`,
      `Dear ${recipientType},\n\nI hope you're having a productive week.`,
      `Dear ${recipientType},\n\nI hope this email finds you in good health and high spirits.`
    ],
    friendly: [
      `Hi there!\n\nHope you're having a fantastic day!`,
      `Hello!\n\nI hope this message finds you well and thriving!`,
      `Hi!\n\nI hope your week is going great so far!`,
      `Hey there!\n\nHope you're doing amazing!`
    ],
    persuasive: [
      `Dear ${recipientType},\n\nI have some exciting news that could transform your business.`,
      `Dear ${recipientType},\n\nWhat I'm about to share could be a game-changer for you.`,
      `Dear ${recipientType},\n\nI have an opportunity that's too good to ignore.`,
      `Dear ${recipientType},\n\nYour success story could start with this email.`
    ]
  }

  if (analysis.isThankYou && type === 'follow_up') {
    return tone === 'formal' ? 
      `Dear ${recipientType},\n\nThank you for taking the time to meet with us recently.` :
      `Hi there!\n\nThanks so much for the great conversation we had!`
  }

  return getRandomTemplate(openings[tone as keyof typeof openings])
}

function generateMainContent(type: string, businessType: string, context: string, tone: string, analysis: any) {
  const contentTemplates = {
    cold_email: {
      saas: `I'm reaching out to introduce ${businessType}, a cutting-edge solution designed to streamline your business operations. Our platform has helped companies like yours achieve remarkable efficiency gains and cost savings.\n\nWhat sets us apart is our commitment to delivering measurable results. We understand the challenges you face in today's competitive market, and we've built our solution specifically to address these pain points.`,
      generic: `I wanted to introduce you to ${businessType} and explore how we might be able to support your business objectives. We've had the privilege of working with companies in your industry and have consistently delivered exceptional results.\n\nOur approach is tailored to meet the unique needs of each client, ensuring that you receive maximum value from our partnership.`
    },
    follow_up: {
      meeting: `Following our productive discussion, I wanted to recap the key points we covered and outline the next steps we discussed.\n\nAs promised, I'm providing you with the additional information you requested. I believe this will give you a clearer picture of how we can move forward together.`,
      generic: `I wanted to follow up on our previous conversation and see if you've had a chance to consider the information we discussed.\n\nI understand you're busy, but I believe this opportunity could bring significant value to your organization. I'm here to answer any questions you might have.`
    },
    offer: {
      urgent: `I'm excited to present you with an exclusive opportunity that's available for a limited time. This offer has been specifically designed to provide maximum value while addressing your immediate business needs.\n\nThis is a unique chance to access our premium services at a significantly reduced investment, but time is of the essence.`,
      generic: `I have an exciting offer that I believe aligns perfectly with your business goals. This opportunity combines exceptional value with proven results.\n\nWe're extending this special offer to select businesses that we believe can benefit most from our services.`
    },
    apology: {
      service: `I want to personally apologize for the inconvenience you experienced with our service. This does not reflect the standard of excellence we strive to maintain, and I take full responsibility for this oversight.\n\nWe've immediately implemented measures to prevent this from happening again, and I want to make this right for you.`,
      generic: `I sincerely apologize for any inconvenience our recent issue may have caused you. We take these matters very seriously and are committed to making things right.\n\nYour satisfaction is our top priority, and we're taking immediate action to address this situation.`
    },
    partnership: {
      mutual: `I'm reaching out to explore a potential partnership between our organizations. I believe there's a significant opportunity for mutual benefit through collaboration.\n\nOur companies share similar values and complement each other's strengths perfectly. Together, we could create something truly remarkable for our respective clients.`,
      generic: `I've been following your company's impressive growth and would love to discuss how ${businessType} could partner with you to achieve even greater success.\n\nWe have a proven track record of successful partnerships, and I believe we could create substantial value together.`
    }
  }

  // Determine content category
  let category = 'generic'
  if (analysis.isAboutSaas && type === 'cold_email') category = 'saas'
  if (analysis.isMeeting && type === 'follow_up') category = 'meeting'
  if (analysis.isUrgent && type === 'offer') category = 'urgent'
  if (analysis.isAnnouncement && type === 'apology') category = 'service'
  if (analysis.isProposal && type === 'partnership') category = 'mutual'

  // Get appropriate template
  const templates = contentTemplates[type as keyof typeof contentTemplates]
  const content = templates[category as keyof typeof templates] || templates.generic

  // Personalize with context if meaningful
  if (context.length > 20 && !content.includes(context.substring(0, 30))) {
    const contextIntegration = tone === 'formal' ? 
      `\n\nRegarding your specific situation with ${context.substring(0, 100)}...` :
      `\n\nI noticed that ${context.substring(0, 100)}...`
    
    return content + contextIntegration.substring(0, 200) + '.'
  }

  return content
}

function generateCallToAction(type: string, tone: string, analysis: any) {
  const ctaTemplates = {
    cold_email: {
      formal: [
        'I would welcome the opportunity to discuss how we can support your business objectives. Would you be available for a brief conversation next week?',
        'I believe a short call would be mutually beneficial. May I suggest we schedule 15-20 minutes to explore this further?',
        'I would appreciate the chance to learn more about your current priorities and discuss how we might align our services accordingly.'
      ],
      friendly: [
        'Would you be up for a quick chat about this? I promise it will be worth your time!',
        'I\'d love to learn more about your goals and see how we can help. Coffee meeting perhaps?',
        'What do you think? Would you like to explore this opportunity together?'
      ],
      persuasive: [
        'Don\'t let this opportunity pass by. Let\'s schedule a call this week to get started.',
        'Your competitors won\'t wait, and neither should you. Can we talk tomorrow?',
        'This could be the breakthrough you\'ve been looking for. Shall we make it happen?'
      ]
    },
    follow_up: {
      formal: [
        'I look forward to hearing your thoughts and continuing our productive dialogue.',
        'Please let me know if you need any additional information to move forward.',
        'I\'m available at your convenience to discuss the next steps.'
      ],
      friendly: [
        'Let me know what you think! I\'m excited to hear back from you.',
        'Hope to hear from you soon! Feel free to reach out anytime.',
        'Looking forward to your thoughts and hopefully moving forward together!'
      ],
      persuasive: [
        'Time is ticking on this opportunity. Let\'s finalize the details this week.',
        'Every day we wait is a day of potential lost. Shall we proceed?',
        'Your success story is waiting to be written. Let\'s make it happen now.'
      ]
    },
    offer: {
      formal: [
        'This offer is available for a limited time. I encourage you to consider it carefully.',
        'Please review the attached proposal and let me know if you have any questions.',
        'I believe this offer represents exceptional value and look forward to your response.'
      ],
      friendly: [
        'This deal won\'t last long, so let me know if you\'re interested!',
        'I think you\'re going to love this offer. What do you say?',
        'Ready to take advantage of this amazing opportunity?'
      ],
      persuasive: [
        'This exclusive offer expires soon. Secure your spot today to avoid disappointment.',
        'Limited availability - only a few spots remaining. Claim yours now.',
        'Don\'t miss out on this game-changing opportunity. Act today.'
      ]
    }
  }

  const defaultCTA = {
    apology: tone === 'formal' ? 
      'Please contact me directly to discuss how we can resolve this matter to your complete satisfaction.' :
      'I\'d love to make this right for you. Can we set up a quick call to discuss?',
    partnership: tone === 'formal' ?
      'I would appreciate the opportunity to discuss this partnership proposal in detail at your earliest convenience.' :
      'Let\'s hop on a call and explore how we can create something amazing together!'
  }

  if (type === 'apology' || type === 'partnership') {
    return defaultCTA[type as keyof typeof defaultCTA]
  }

  const templates = ctaTemplates[type as keyof typeof ctaTemplates]?.[tone as keyof typeof ctaTemplates['cold_email']] || 
                   ['I look forward to hearing from you soon.']
  
  return getRandomTemplate(templates)
}

function generateClosing(tone: string, businessType: string) {
  const closings = {
    formal: [
      `Thank you for your time and consideration.\n\nBest regards,\n${businessType} Team`,
      `I appreciate your attention to this matter.\n\nSincerely,\n${businessType} Team`,
      `Thank you for considering this opportunity.\n\nProfessionally yours,\n${businessType} Team`,
      `I look forward to your response.\n\nWarm regards,\n${businessType} Team`
    ],
    friendly: [
      `Thanks for taking the time to read this!\n\nCheers,\n${businessType} Team`,
      `Hope to connect with you soon!\n\nBest,\n${businessType} Team`,
      `Have a wonderful day!\n\nWarmly,\n${businessType} Team`,
      `Looking forward to hearing from you!\n\nAll the best,\n${businessType} Team`
    ],
    persuasive: [
      `Don't wait - your success starts now.\n\nTo your success,\n${businessType} Team`,
      `The opportunity is in your hands.\n\nCommitted to your growth,\n${businessType} Team`,
      `Your transformation begins today.\n\nPartner in success,\n${businessType} Team`,
      `Ready to make it happen?\n\nYour growth catalyst,\n${businessType} Team`
    ]
  }

  return getRandomTemplate(closings[tone as keyof typeof closings])
}
