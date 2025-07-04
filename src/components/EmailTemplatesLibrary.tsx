
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Copy, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmailTemplate {
  id: string;
  title: string;
  category: string;
  subject: string;
  body: string;
  variables: string[];
  isPopular?: boolean;
}

interface EmailTemplatesLibraryProps {
  onSelectTemplate: (template: EmailTemplate) => void;
}

const EmailTemplatesLibrary: React.FC<EmailTemplatesLibraryProps> = ({ onSelectTemplate }) => {
  const { toast } = useToast();
  
  const templates: EmailTemplate[] = [
    // Cold Email Templates
    {
      id: 'cold-outreach-1',
      title: 'Professional Cold Outreach',
      category: 'Cold Email',
      subject: 'Quick question about {company_name}\'s {pain_point}',
      body: `Hi {recipient_name},

I noticed that {company_name} has been {company_achievement}. Congratulations on that milestone!

I'm reaching out because I've been helping companies in {industry} overcome {pain_point} challenges. In fact, we recently helped {similar_company} achieve {specific_result}.

I'd love to share how we could potentially help {company_name} achieve similar results. Would you be interested in a brief 15-minute conversation to explore this?

Best regards,
{sender_name}
{company_name}`,
      variables: ['recipient_name', 'company_name', 'pain_point', 'company_achievement', 'industry', 'similar_company', 'specific_result', 'sender_name'],
      isPopular: true
    },
    {
      id: 'cold-outreach-2',
      title: 'Value-First Cold Email',
      category: 'Cold Email',
      subject: 'Free {resource_type} for {company_name}',
      body: `Hello {recipient_name},

I've been following {company_name}'s work in {industry} and was impressed by your recent {recent_achievement}.

I wanted to share a {resource_type} that might be valuable for your team. We recently created this for companies facing {common_challenge} - no strings attached.

The resource includes:
• {benefit_1}
• {benefit_2}
• {benefit_3}

Would you like me to send it over? It takes 2 minutes to read and could save you hours of work.

Best,
{sender_name}`,
      variables: ['recipient_name', 'company_name', 'industry', 'recent_achievement', 'resource_type', 'common_challenge', 'benefit_1', 'benefit_2', 'benefit_3', 'sender_name']
    },
    {
      id: 'cold-outreach-3',
      title: 'Connection-Based Cold Email',
      category: 'Cold Email',
      subject: '{mutual_connection} suggested I reach out',
      body: `Hi {recipient_name},

{mutual_connection} mentioned that you're the right person to speak with about {topic} at {company_name}.

I've been working with companies like {similar_company_1} and {similar_company_2} to help them {main_benefit}. Given your focus on {company_focus}, I thought this might be relevant.

Would you be open to a brief 10-minute call to see if there's a fit? I'm happy to share some insights that have worked well for similar companies, regardless of whether we work together.

Thanks for your time,
{sender_name}`,
      variables: ['recipient_name', 'mutual_connection', 'topic', 'company_name', 'similar_company_1', 'similar_company_2', 'main_benefit', 'company_focus', 'sender_name'],
      isPopular: true
    },
    {
      id: 'cold-outreach-4',
      title: 'Problem-Solution Cold Email',
      category: 'Cold Email',
      subject: 'Solving {specific_problem} at {company_name}',
      body: `Dear {recipient_name},

I noticed {company_name} is expanding into {new_market}. That's exciting!

Many companies face {specific_problem} during this phase. We've helped {number} companies overcome this exact challenge, resulting in {average_improvement}.

Our approach:
1. {step_1}
2. {step_2}
3. {step_3}

Would you be interested in a 15-minute call to discuss how this might apply to {company_name}'s situation?

Looking forward to hearing from you,
{sender_name}`,
      variables: ['recipient_name', 'company_name', 'new_market', 'specific_problem', 'number', 'average_improvement', 'step_1', 'step_2', 'step_3', 'sender_name']
    },
    {
      id: 'cold-outreach-5',
      title: 'Compliment-Based Cold Email',
      category: 'Cold Email',
      subject: 'Impressed by {company_achievement}',
      body: `Hello {recipient_name},

I came across {company_name}'s recent {company_achievement} and was genuinely impressed. The way you handled {specific_aspect} was particularly clever.

I work with {industry} companies to help them {main_service}. Given your innovative approach, I thought you might be interested in how companies like {example_company} have achieved {specific_result}.

I'd love to share a quick case study that might give you some ideas, whether we work together or not.

Interested in a 10-minute chat?

Best regards,
{sender_name}`,
      variables: ['recipient_name', 'company_name', 'company_achievement', 'specific_aspect', 'industry', 'main_service', 'example_company', 'specific_result', 'sender_name']
    },
    {
      id: 'cold-outreach-6',
      title: 'Research-Based Cold Email',
      category: 'Cold Email',
      subject: 'Your thoughts on {industry_trend}?',
      body: `Hi {recipient_name},

I've been researching {industry_trend} and found your insights on {platform} particularly valuable. Your point about {specific_insight} really resonated.

I'm working on a {project_type} about this topic and would love to include perspective from leaders like yourself. I'm also happy to share our preliminary findings with you.

The research has uncovered some surprising trends about {finding}, which I think would interest someone in your position at {company_name}.

Would you be interested in a brief conversation about this?

Best,
{sender_name}`,
      variables: ['recipient_name', 'industry_trend', 'platform', 'specific_insight', 'project_type', 'finding', 'company_name', 'sender_name']
    },

    // Follow-up Templates
    {
      id: 'follow-up-1',
      title: 'Professional Follow-up',
      category: 'Follow-up',
      subject: 'Following up on our {meeting_type} discussion',
      body: `Hi {recipient_name},

Thank you for taking the time to meet with me {time_reference}. I enjoyed our discussion about {topic_discussed}.

As promised, I'm attaching {attachment_description} that we talked about. I believe this could help {company_name} with {specific_challenge}.

Next steps:
- {next_step_1}
- {next_step_2}

I'll follow up again on {follow_up_date} unless I hear from you sooner.

Best regards,
{sender_name}`,
      variables: ['recipient_name', 'meeting_type', 'time_reference', 'topic_discussed', 'attachment_description', 'company_name', 'specific_challenge', 'next_step_1', 'next_step_2', 'follow_up_date', 'sender_name'],
      isPopular: true
    },
    {
      id: 'follow-up-2',
      title: 'Value-Add Follow-up',
      category: 'Follow-up',
      subject: 'Additional insights for {company_name}',
      body: `Hello {recipient_name},

Following our conversation {time_reference}, I came across an article about {relevant_topic} that I thought might interest you.

The article mentions {key_insight}, which aligns with what we discussed regarding {previous_topic}.

I also wanted to share that {additional_value} - this might help you with {specific_goal} we talked about.

Let me know if you'd like to continue our conversation or if there's anything else I can help with.

Best,
{sender_name}`,
      variables: ['recipient_name', 'time_reference', 'relevant_topic', 'key_insight', 'previous_topic', 'additional_value', 'specific_goal', 'sender_name']
    },
    {
      id: 'follow-up-3',
      title: 'Timeline Follow-up',
      category: 'Follow-up',
      subject: 'Checking in on {project_name} timeline',
      body: `Hi {recipient_name},

I hope you're doing well. I wanted to check in regarding {project_name} that we discussed.

You mentioned that {timeline_detail} would be the right time to move forward. As we're approaching that timeframe, I wanted to see if your priorities have remained the same.

In the meantime, I've prepared {preparation_item} to help streamline the process when you're ready.

Would it be helpful to schedule a brief call to discuss the next steps?

Looking forward to hearing from you,
{sender_name}`,
      variables: ['recipient_name', 'project_name', 'timeline_detail', 'preparation_item', 'sender_name']
    },
    {
      id: 'follow-up-4',
      title: 'Soft Follow-up',
      category: 'Follow-up',
      subject: 'Just checking in',
      body: `Hello {recipient_name},

I hope things are going well at {company_name}. I know you've been busy with {known_priority}.

I wanted to briefly follow up on our previous conversation about {previous_topic}. No pressure at all - I understand priorities shift and timing isn't always right.

If it's still relevant, I'm here to help. If not, please feel free to ignore this email.

Either way, I wish you continued success with {current_project}.

Best regards,
{sender_name}`,
      variables: ['recipient_name', 'company_name', 'known_priority', 'previous_topic', 'current_project', 'sender_name']
    },
    {
      id: 'follow-up-5',
      title: 'Results-Based Follow-up',
      category: 'Follow-up',
      subject: 'Update: {success_metric} achieved for {similar_company}',
      body: `Hi {recipient_name},

Quick update - remember when we discussed {previous_topic}? I wanted to share that we just helped {similar_company} achieve {specific_result}.

This is particularly relevant because they faced a similar {challenge_type} that you mentioned {company_name} is experiencing.

The approach we used:
• {method_1}
• {method_2}
• {method_3}

I thought this might interest you as you consider your options for {original_goal}.

Happy to share more details if you'd like.

Best,
{sender_name}`,
      variables: ['recipient_name', 'success_metric', 'similar_company', 'previous_topic', 'specific_result', 'challenge_type', 'company_name', 'method_1', 'method_2', 'method_3', 'original_goal', 'sender_name']
    },

    // Partnership Templates
    {
      id: 'partnership-1',
      title: 'Partnership Proposal',
      category: 'Partnership',
      subject: 'Partnership opportunity between {your_company} and {their_company}',
      body: `Dear {recipient_name},

I hope this email finds you well. I'm {your_name}, {your_title} at {your_company}.

I've been following {their_company}'s impressive work in {their_industry}, particularly your recent {their_achievement}. Our companies share similar values around {shared_values}.

I believe there's a significant opportunity for collaboration between our organizations. Specifically:

• {benefit_1}
• {benefit_2}
• {benefit_3}

I'd love to schedule a brief call to discuss how we might work together to create mutual value. Would you be available for a 20-minute conversation next week?

Looking forward to hearing from you.

Best regards,
{your_name}
{your_title}
{your_company}`,
      variables: ['recipient_name', 'your_name', 'your_title', 'your_company', 'their_company', 'their_industry', 'their_achievement', 'shared_values', 'benefit_1', 'benefit_2', 'benefit_3']
    },
    {
      id: 'partnership-2',
      title: 'Strategic Alliance Proposal',
      category: 'Partnership',
      subject: 'Strategic alliance opportunity in {market_segment}',
      body: `Hello {recipient_name},

I'm reaching out to explore a potential strategic alliance between {your_company} and {their_company}.

Both our companies serve {target_market} but with complementary strengths:
- {your_company}: {your_strength}
- {their_company}: {their_strength}

By partnering, we could:
1. {joint_benefit_1}
2. {joint_benefit_2}
3. {joint_benefit_3}

I envision this as a {partnership_type} where both companies maintain their independence while leveraging each other's strengths.

Would you be interested in exploring this further? I'd be happy to put together a brief presentation outlining the potential.

Best regards,
{your_name}`,
      variables: ['recipient_name', 'your_company', 'their_company', 'target_market', 'your_strength', 'their_strength', 'joint_benefit_1', 'joint_benefit_2', 'joint_benefit_3', 'partnership_type', 'your_name']
    },
    {
      id: 'partnership-3',
      title: 'Cross-Promotion Partnership',
      category: 'Partnership',
      subject: 'Cross-promotion opportunity for our audiences',
      body: `Hi {recipient_name},

I've been following {their_company}'s content strategy and am impressed by your engagement with {audience_type}.

I think there's a great opportunity for cross-promotion between our audiences. {your_company} serves {your_audience} while you focus on {their_audience} - there's clear overlap without direct competition.

Potential collaboration ideas:
• {idea_1}
• {idea_2}
• {idea_3}

Our recent {content_type} reached {reach_metric}, so I believe we could create significant value for both audiences.

Would you be open to a brief call to explore this further?

Best,
{your_name}`,
      variables: ['recipient_name', 'their_company', 'audience_type', 'your_company', 'your_audience', 'their_audience', 'idea_1', 'idea_2', 'idea_3', 'content_type', 'reach_metric', 'your_name']
    },
    {
      id: 'partnership-4',
      title: 'Technology Integration Partnership',
      category: 'Partnership',
      subject: 'Integration partnership between {your_product} and {their_product}',
      body: `Dear {recipient_name},

I hope you're having a great week. I'm {your_name} from {your_company}.

We've built {your_product} which serves {your_users}. I've noticed that many of our customers also use {their_product}, and I believe there's a great opportunity for integration.

An integration would allow users to:
- {integration_benefit_1}
- {integration_benefit_2}
- {integration_benefit_3}

This could drive value for both our user bases while strengthening both platforms. We have {user_count} active users who would benefit from this integration.

Would you be interested in discussing this opportunity? I'd love to explore how we might work together.

Best regards,
{your_name}
{your_title}`,
      variables: ['recipient_name', 'your_product', 'their_product', 'your_name', 'your_company', 'your_users', 'integration_benefit_1', 'integration_benefit_2', 'integration_benefit_3', 'user_count', 'your_title']
    },
    {
      id: 'partnership-5',
      title: 'Referral Partnership',
      category: 'Partnership',
      subject: 'Referral partnership proposal',
      body: `Hello {recipient_name},

I hope this email finds you well. I'm {your_name} from {your_company}.

I've been impressed by {their_company}'s approach to {their_expertise}. We often encounter clients who need exactly the services you provide, but it's outside our core competency.

I'd like to propose a referral partnership where:
• We refer clients needing {their_service} to {their_company}
• You refer clients needing {your_service} to {your_company}
• We both benefit from {mutual_benefit}

We typically see {referral_volume} potential referrals per {time_period}. I believe this could be mutually beneficial while ensuring our clients get the best possible service.

Would you be interested in discussing this further?

Best,
{your_name}`,
      variables: ['recipient_name', 'your_name', 'your_company', 'their_company', 'their_expertise', 'their_service', 'your_service', 'mutual_benefit', 'referral_volume', 'time_period']
    },

    // Apology Templates
    {
      id: 'apology-1',
      title: 'Professional Apology',
      category: 'Apology',
      subject: 'Our sincere apologies regarding {issue_description}',
      body: `Dear {recipient_name},

I want to personally apologize for {specific_issue} that occurred {time_reference}. This does not reflect the standard of service we strive to provide at {company_name}.

Here's what happened:
{detailed_explanation}

Here's what we're doing to make it right:
• {corrective_action_1}
• {corrective_action_2}
• {corrective_action_3}

Additionally, {compensation_offered} as a gesture of goodwill.

We value your {relationship_type} and are committed to ensuring this doesn't happen again. I'll personally follow up with you on {follow_up_date} to ensure everything is resolved to your satisfaction.

If you have any questions or concerns, please don't hesitate to contact me directly at {direct_contact}.

Sincerely,
{sender_name}
{sender_title}
{company_name}`,
      variables: ['recipient_name', 'specific_issue', 'time_reference', 'company_name', 'detailed_explanation', 'corrective_action_1', 'corrective_action_2', 'corrective_action_3', 'compensation_offered', 'relationship_type', 'follow_up_date', 'direct_contact', 'sender_name', 'sender_title']
    },
    {
      id: 'apology-2',
      title: 'Service Delay Apology',
      category: 'Apology',
      subject: 'Apology for delay in {service_type}',
      body: `Dear {recipient_name},

I'm writing to apologize for the delay in {service_type} that was scheduled for {original_date}.

Unfortunately, {reason_for_delay}, which has pushed back our timeline by {delay_duration}.

To minimize the impact on you:
- {mitigation_1}
- {mitigation_2}
- {mitigation_3}

The new expected completion date is {new_date}. As an apology for this inconvenience, we're {compensation_detail}.

I understand this delay may cause inconvenience, and I take full responsibility. Please let me know if there's anything else we can do to make this right.

Thank you for your patience and understanding.

Best regards,
{sender_name}`,
      variables: ['recipient_name', 'service_type', 'original_date', 'reason_for_delay', 'delay_duration', 'mitigation_1', 'mitigation_2', 'mitigation_3', 'new_date', 'compensation_detail', 'sender_name']
    },
    {
      id: 'apology-3',
      title: 'Communication Error Apology',
      category: 'Apology',
      subject: 'Apology for miscommunication regarding {topic}',
      body: `Hello {recipient_name},

I owe you an apology for the confusion regarding {topic} in our recent {communication_type}.

Upon review, I realize that {mistake_description}. This was entirely my error, and I should have {correct_action}.

To clarify:
• {clarification_1}
• {clarification_2}
• {clarification_3}

Moving forward, I will {prevention_measure} to ensure this type of miscommunication doesn't happen again.

I value our {relationship_type} and appreciate your patience as we work through this.

Please let me know if you have any questions or if there's anything else I can clarify.

Sincerely,
{sender_name}`,
      variables: ['recipient_name', 'topic', 'communication_type', 'mistake_description', 'correct_action', 'clarification_1', 'clarification_2', 'clarification_3', 'prevention_measure', 'relationship_type', 'sender_name']
    },
    {
      id: 'apology-4',
      title: 'Quality Issue Apology',
      category: 'Apology',
      subject: 'Addressing quality concerns with {product_service}',
      body: `Dear {recipient_name},

I was disappointed to learn about the quality issues you experienced with {product_service}. This falls short of the standards we set for ourselves at {company_name}.

After investigating, we found that {root_cause}. We've immediately implemented {immediate_fix} and are working on {long_term_solution} to prevent this from recurring.

For your specific situation:
1. {specific_resolution_1}
2. {specific_resolution_2}
3. {specific_resolution_3}

We're also {additional_compensation} to acknowledge the inconvenience this has caused.

Quality is our top priority, and we're committed to earning back your trust. I'll personally monitor your account to ensure you receive the service level you deserve.

Thank you for bringing this to our attention and for giving us the opportunity to make it right.

Best regards,
{sender_name}`,
      variables: ['recipient_name', 'product_service', 'company_name', 'root_cause', 'immediate_fix', 'long_term_solution', 'specific_resolution_1', 'specific_resolution_2', 'specific_resolution_3', 'additional_compensation', 'sender_name']
    },
    {
      id: 'apology-5',
      title: 'Missed Meeting Apology',
      category: 'Apology',
      subject: 'Sincere apologies for missing our {meeting_type}',
      body: `Dear {recipient_name},

I sincerely apologize for missing our {meeting_type} scheduled for {meeting_time}. There is no excuse for not being there or not giving you advance notice.

{brief_explanation}

I understand that your time is valuable, and I should have {proper_action}. This was unprofessional on my part.

To make up for this:
• {makeup_action_1}
• {makeup_action_2}
• {makeup_action_3}

I've also {process_improvement} to ensure this doesn't happen again.

Would you be willing to reschedule? I'm available {availability} and happy to work around your schedule.

Again, I deeply apologize for the inconvenience and disrespect this showed for your time.

Respectfully,
{sender_name}`,
      variables: ['recipient_name', 'meeting_type', 'meeting_time', 'brief_explanation', 'proper_action', 'makeup_action_1', 'makeup_action_2', 'makeup_action_3', 'process_improvement', 'availability', 'sender_name']
    },

    // Offer Templates
    {
      id: 'offer-1',
      title: 'Limited Time Offer',
      category: 'Offer',
      subject: 'Exclusive {offer_type} for {company_name} - {urgency_phrase}',
      body: `Hi {recipient_name},

I hope you're having a great {day_of_week}!

I'm excited to share an exclusive opportunity with {company_name}. Based on our previous conversations about {previous_discussion_topic}, I believe this could be exactly what you're looking for.

🎯 **What we're offering:**
{offer_description}

🔥 **Special terms for {company_name}:**
• {special_term_1}
• {special_term_2}
• {special_term_3}

⏰ **Important:** This exclusive offer is only available until {expiry_date}.

Companies similar to yours have seen {success_metric} after implementing our solution. I'd love to discuss how we can achieve similar results for {company_name}.

Are you available for a quick 15-minute call {suggested_time} to go over the details?

Best regards,
{sender_name}
{sender_title}
{company_name}`,
      variables: ['recipient_name', 'offer_type', 'company_name', 'urgency_phrase', 'day_of_week', 'previous_discussion_topic', 'offer_description', 'special_term_1', 'special_term_2', 'special_term_3', 'expiry_date', 'success_metric', 'suggested_time', 'sender_name', 'sender_title'],
      isPopular: true
    },
    {
      id: 'offer-2',
      title: 'Free Trial Offer',
      category: 'Offer',
      subject: 'Free {trial_duration} trial of {product_name} for {company_name}',
      body: `Hello {recipient_name},

I know {company_name} is focused on {company_goal}, and I have something that might help.

We're offering {company_name} a free {trial_duration} trial of {product_name} - no strings attached, no credit card required.

During the trial, you'll get:
✅ {feature_1}
✅ {feature_2}
✅ {feature_3}
✅ {feature_4}

Plus, I'll personally help with setup and provide {support_offering}.

The trial takes {setup_time} to set up, and you can cancel anytime. Most companies see {typical_result} within the first {timeframe}.

Interested? I can have you up and running by {start_date}.

Best,
{sender_name}`,
      variables: ['recipient_name', 'company_name', 'company_goal', 'trial_duration', 'product_name', 'feature_1', 'feature_2', 'feature_3', 'feature_4', 'support_offering', 'setup_time', 'typical_result', 'timeframe', 'start_date', 'sender_name']
    },
    {
      id: 'offer-3',
      title: 'Seasonal Promotion',
      category: 'Offer',
      subject: '{season} special: {discount_amount} off {service_name}',
      body: `Hi {recipient_name},

Happy {season}! To celebrate, we're offering {company_name} an exclusive {discount_amount} discount on {service_name}.

This promotion is perfect timing because:
• {timing_reason_1}
• {timing_reason_2}
• {timing_reason_3}

**What's included:**
- {included_item_1}
- {included_item_2}
- {included_item_3}

**Bonus:** If you sign up before {deadline}, we'll also include {bonus_item} at no extra cost.

This {season} promotion ends on {expiry_date}, and we can only accept {limited_spots} new clients during this period.

Ready to get started? Reply to this email or call me at {phone_number}.

Best regards,
{sender_name}`,
      variables: ['recipient_name', 'season', 'discount_amount', 'service_name', 'company_name', 'timing_reason_1', 'timing_reason_2', 'timing_reason_3', 'included_item_1', 'included_item_2', 'included_item_3', 'deadline', 'bonus_item', 'expiry_date', 'limited_spots', 'phone_number', 'sender_name']
    },
    {
      id: 'offer-4',
      title: 'Upgrade Offer',
      category: 'Offer',
      subject: 'Special upgrade offer for {company_name}',
      body: `Dear {recipient_name},

I hope you're enjoying {current_service}. Based on your usage patterns, I think you'd benefit significantly from upgrading to {upgrade_service}.

**Why upgrade now?**
Your current usage shows {usage_insight}, which means you could benefit from:
• {upgrade_benefit_1}
• {upgrade_benefit_2}
• {upgrade_benefit_3}

**Special upgrade pricing:**
Instead of the regular {regular_price}, we're offering the upgrade to {company_name} for just {special_price} - that's {savings_amount} in savings.

**This offer includes:**
- {included_1}
- {included_2}
- {included_3}
- {guarantee}

The upgrade takes effect immediately, and you can downgrade anytime if it's not the right fit.

This special pricing is available until {offer_expiry}. Would you like to proceed with the upgrade?

Best,
{sender_name}`,
      variables: ['recipient_name', 'current_service', 'upgrade_service', 'usage_insight', 'upgrade_benefit_1', 'upgrade_benefit_2', 'upgrade_benefit_3', 'company_name', 'regular_price', 'special_price', 'savings_amount', 'included_1', 'included_2', 'included_3', 'guarantee', 'offer_expiry', 'sender_name']
    },
    {
      id: 'offer-5',
      title: 'Bundle Offer',
      category: 'Offer',
      subject: 'Complete {solution_type} bundle for {company_name}',
      body: `Hello {recipient_name},

Instead of purchasing {service_1} and {service_2} separately, I wanted to offer {company_name} our complete {solution_type} bundle.

**The bundle includes:**
1. {service_1} (normally {price_1})
2. {service_2} (normally {price_2})
3. {service_3} (normally {price_3})
4. {bonus_service} (bonus - worth {bonus_value})

**Bundle price:** {bundle_price} (save {total_savings})

**Why this makes sense for {company_name}:**
• {reason_1}
• {reason_2}
• {reason_3}

We can implement everything over {implementation_timeline}, and you'll start seeing results by {results_timeline}.

This bundle pricing is available for {limited_time}. Would you like to discuss the details?

Best regards,
{sender_name}`,
      variables: ['recipient_name', 'solution_type', 'company_name', 'service_1', 'service_2', 'price_1', 'price_2', 'service_3', 'price_3', 'bonus_service', 'bonus_value', 'bundle_price', 'total_savings', 'reason_1', 'reason_2', 'reason_3', 'implementation_timeline', 'results_timeline', 'limited_time', 'sender_name']
    }
  ];

  const categories = ['All', 'Cold Email', 'Follow-up', 'Partnership', 'Apology', 'Offer'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredTemplates = selectedCategory === 'All' 
    ? templates 
    : templates.filter(template => template.category === selectedCategory);

  const handleUseTemplate = (template: EmailTemplate) => {
    onSelectTemplate(template);
    toast({
      title: "Template Applied!",
      description: `"${template.title}" has been loaded. Customize the variables to personalize your email.`,
    });
  };

  const copyTemplate = (template: EmailTemplate) => {
    const templateText = `Subject: ${template.subject}\n\n${template.body}`;
    navigator.clipboard.writeText(templateText);
    toast({
      title: "Template Copied!",
      description: "Template has been copied to your clipboard.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">📧 Email Templates Library</h3>
        <p className="text-sm text-gray-600">Professional email templates for every situation</p>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-6 mb-6">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="text-xs">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="grid gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <CardTitle className="text-base">{template.title}</CardTitle>
                    {template.isPopular && (
                      <Badge className="bg-orange-100 text-orange-800">
                        <Star className="w-3 h-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline">{template.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Subject:</p>
                  <p className="text-sm text-gray-600 italic">{template.subject}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Preview:</p>
                  <p className="text-sm text-gray-600 line-clamp-3">{template.body.substring(0, 200)}...</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Variables to customize:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.variables.slice(0, 6).map((variable) => (
                      <Badge key={variable} variant="secondary" className="text-xs">
                        {variable}
                      </Badge>
                    ))}
                    {template.variables.length > 6 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.variables.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    onClick={() => handleUseTemplate(template)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Use Template
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => copyTemplate(template)}
                    className="px-3"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Tabs>
    </div>
  );
};

export default EmailTemplatesLibrary;
