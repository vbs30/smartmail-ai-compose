
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
