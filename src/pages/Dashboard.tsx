import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Copy, Save, History, LogOut, Crown, Loader2, ArrowLeft, CreditCard, Sparkles, FileText } from "lucide-react";
import { User } from "@supabase/supabase-js";
import ProUpgradeModal from "@/components/ProUpgradeModal";
import MobileNavigation from "@/components/MobileNavigation";
import EmailTemplatesLibrary from "@/components/EmailTemplatesLibrary";
import AdvancedPersonalization from "@/components/AdvancedPersonalization";

interface Profile {
  id: string;
  user_id: string;
  email: string;
  name: string | null;
  is_pro: boolean;
  daily_generations_count: number;
  daily_generations_reset_date: string;
}

interface GeneratedEmail {
  subject: string;
  body: string;
}

interface SubscriptionInfo {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Form state
  const [emailType, setEmailType] = useState("");
  const [recipientType, setRecipientType] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [context, setContext] = useState("");
  const [tone, setTone] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState<GeneratedEmail | null>(null);

  // Additional state for premium features
  const [activeTab, setActiveTab] = useState("generate");
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [personalizationFields, setPersonalizationFields] = useState<any[]>([]);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
        return;
      }
      
      setUser(user);
      
      // Call the reset function before getting profile
      await supabase.rpc('reset_daily_generations_if_needed');
      
      // Get user profile
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      } else {
        setProfile(profile);
        
        // If user is pro, get subscription details
        if (profile.is_pro) {
          await getSubscriptionInfo();
        }
      }
    } catch (error) {
      console.error("Error checking user:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionInfo = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) {
        console.error("Error fetching subscription info:", error);
      } else {
        setSubscriptionInfo(data);
      }
    } catch (error) {
      console.error("Error getting subscription info:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleUpgradeClick = () => {
    if (profile?.is_pro) {
      setShowUpgradeModal(true);
    } else {
      navigate("/payment");
    }
  };

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setEmailType(template.category.toLowerCase().replace(' ', '_'));
    setActiveTab("generate");
  };

  const clearTemplate = () => {
    setSelectedTemplate(null);
    setEmailType("");
  };

  const generateEmail = async () => {
    if (!emailType || !recipientType || !businessType || !context || !tone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to generate an email.",
        variant: "destructive",
      });
      return;
    }

    if (!profile?.is_pro && profile?.daily_generations_count >= 3) {
      setShowUpgradeModal(true);
      return;
    }

    setGenerating(true);
    
    try {
      // Prepare enhanced context with personalization
      let enhancedContext = context;
      
      if (profile?.is_pro && personalizationFields.length > 0) {
        const personalizationData = personalizationFields
          .filter(field => field.value.trim())
          .map(field => `${field.label}: ${field.value}`)
          .join('\n');
        
        if (personalizationData) {
          enhancedContext = `${context}\n\nPersonalization Details:\n${personalizationData}`;
        }
      }

      // Use template if selected
      let emailTypeToUse = emailType;
      let contextToUse = enhancedContext;
      
      if (selectedTemplate && profile?.is_pro) {
        contextToUse = `Template: ${selectedTemplate.title}\nSubject Template: ${selectedTemplate.subject}\nBody Template: ${selectedTemplate.body}\n\nCustomization Context: ${enhancedContext}`;
        emailTypeToUse = selectedTemplate.category.toLowerCase().replace(' ', '_');
      }

      // Call Edge Function to generate email
      const { data, error } = await supabase.functions.invoke('generate-email', {
        body: {
          type: emailTypeToUse,
          recipientType,
          businessType,
          context: contextToUse,
          tone,
          isTemplate: !!selectedTemplate,
          templateVariables: selectedTemplate?.variables || []
        }
      });

      if (error) {
        throw error;
      }

      setGeneratedEmail(data);
      
      // Update daily generation count
      if (!profile?.is_pro) {
        await supabase
          .from("profiles")
          .update({ 
            daily_generations_count: (profile?.daily_generations_count || 0) + 1 
          })
          .eq("user_id", user?.id);
        
        // Update local state
        setProfile(prev => prev ? {
          ...prev,
          daily_generations_count: prev.daily_generations_count + 1
        } : null);
      }

      toast({
        title: "Email Generated!",
        description: profile?.is_pro ? 
          "Your personalized professional email has been created successfully." :
          "Your professional email has been created successfully.",
      });
    } catch (error) {
      console.error("Error generating email:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Email content copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const saveEmail = async () => {
    if (!generatedEmail || !profile?.is_pro) {
      toast({
        title: "Pro Feature",
        description: "Saving emails is a Pro feature. Please upgrade to save your emails.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    
    try {
      const { error } = await supabase
        .from("emails")
        .insert({
          user_id: user?.id,
          type: emailType,
          recipient_type: recipientType,
          business_type: businessType,
          context,
          tone,
          subject: generatedEmail.subject,
          body: generatedEmail.body,
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Email Saved!",
        description: "Your email has been saved to your history.",
      });
    } catch (error) {
      console.error("Error saving email:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 md:space-x-4">
              <Button variant="ghost" onClick={() => navigate("/")}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-blue-600" />
                <span className="text-xs sm:text-sm md:text-base lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SmartMail AI
                </span>
              </div>
              <div className="hidden lg:flex items-center space-x-2">
                <span className="text-sm text-gray-600">Welcome, {profile?.name || user?.email}</span>
                {profile?.is_pro ? (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500">
                    <Crown className="w-3 h-3 mr-1" />
                    Pro
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    Free ({profile?.daily_generations_count || 0}/3 today)
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4">
              {!profile?.is_pro && (
                <Button 
                  onClick={handleUpgradeClick}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Pro
                </Button>
              )}
              {profile?.is_pro && (
                <>
                  <Button variant="outline" onClick={() => navigate("/history")}>
                    <History className="w-4 h-4 mr-2" />
                    History
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/billing")}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Billing
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>

            {/* Mobile Navigation */}
            <MobileNavigation 
              isPro={profile?.is_pro || false} 
              onSignOut={handleSignOut}
            />
          </div>
          
          {/* Mobile User Info */}
          <div className="lg:hidden mt-2 flex items-center space-x-2">
            <span className="text-sm text-gray-600">Welcome, {profile?.name || user?.email}</span>
            {profile?.is_pro ? (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500">
                <Crown className="w-3 h-3 mr-1" />
                Pro
              </Badge>
            ) : (
              <Badge variant="secondary">
                Free ({profile?.daily_generations_count || 0}/3 today)
              </Badge>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {profile?.is_pro ? (
          // Pro User Layout with Tabs
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="generate" className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Generate</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Templates</span>
              </TabsTrigger>
              <TabsTrigger value="personalize" className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>Personalize</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Email Generation Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-sm sm:text-base md:text-lg lg:text-xl">
                      <Mail className="w-5 h-5 mr-2" />
                      <span className="text-sm sm:text-base md:text-lg lg:text-xl">Generate Professional Email</span>
                    </CardTitle>
                    <CardDescription>
                      {selectedTemplate ? (
                        <div className="flex items-center justify-between">
                          <span>Using template: <strong>{selectedTemplate.title}</strong></span>
                          <Button variant="outline" size="sm" onClick={clearTemplate}>
                            Clear Template
                          </Button>
                        </div>
                      ) : (
                        "Fill in the details below to generate a professional email tailored to your needs."
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email-type">Email Type</Label>
                      <Select value={emailType} onValueChange={setEmailType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select email type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cold_email">Cold Email</SelectItem>
                          <SelectItem value="follow_up">Follow-up</SelectItem>
                          <SelectItem value="offer">Offer</SelectItem>
                          <SelectItem value="apology">Apology</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recipient-type">Recipient Type</Label>
                      <Input
                        id="recipient-type"
                        placeholder="e.g., potential client, existing customer, vendor"
                        value={recipientType}
                        onChange={(e) => setRecipientType(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="business-type">Your Business</Label>
                      <Input
                        id="business-type"
                        placeholder="e.g., digital marketing agency, e-commerce store"
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="context">Context</Label>
                      <Textarea
                        id="context"
                        placeholder="Describe what you want to communicate..."
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tone</Label>
                      <div className="flex space-x-4">
                        {["formal", "friendly", "persuasive"].map((toneOption) => (
                          <label key={toneOption} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="tone"
                              value={toneOption}
                              checked={tone === toneOption}
                              onChange={(e) => setTone(e.target.value)}
                              className="text-blue-600"
                            />
                            <span className="capitalize">{toneOption}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={generateEmail}
                      disabled={generating}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Pro Email
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Generated Email Display */}
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Email</CardTitle>
                    <CardDescription>
                      Your AI-generated professional email will appear here.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {generatedEmail ? (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-semibold">Subject Line</Label>
                          <div className="mt-1 p-3 bg-gray-50 rounded-md">
                            <p className="font-medium">{generatedEmail.subject}</p>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <Label className="text-sm font-semibold">Email Body</Label>
                          <Textarea
                            value={generatedEmail.body}
                            onChange={(e) => setGeneratedEmail({ ...generatedEmail, body: e.target.value })}
                            rows={12}
                            className="mt-1"
                          />
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => copyToClipboard(`Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`)}
                            variant="outline"
                            className="flex-1"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy All
                          </Button>
                          <Button
                            onClick={saveEmail}
                            disabled={saving}
                            variant="outline"
                            className="flex-1"
                          >
                            {saving ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4 mr-2" />
                            )}
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Generate an email to see the results here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="templates">
              <EmailTemplatesLibrary onSelectTemplate={handleTemplateSelect} />
            </TabsContent>

            <TabsContent value="personalize">
              <AdvancedPersonalization 
                onPersonalizationChange={setPersonalizationFields}
                initialFields={personalizationFields}
              />
            </TabsContent>
          </Tabs>
        ) : (
          // Free User Layout (Original)
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Email Generation Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sm sm:text-base md:text-lg lg:text-xl">
                  <Mail className="w-5 h-5 mr-2" />
                  <span className="text-sm sm:text-base md:text-lg lg:text-xl">Generate Professional Email</span>
                </CardTitle>
                <CardDescription>
                  Fill in the details below to generate a professional email tailored to your needs.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email-type">Email Type</Label>
                  <Select value={emailType} onValueChange={setEmailType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select email type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cold_email">Cold Email</SelectItem>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                      <SelectItem value="offer">Offer</SelectItem>
                      <SelectItem value="apology">Apology</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipient-type">Recipient Type</Label>
                  <Input
                    id="recipient-type"
                    placeholder="e.g., potential client, existing customer, vendor"
                    value={recipientType}
                    onChange={(e) => setRecipientType(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business-type">Your Business</Label>
                  <Input
                    id="business-type"
                    placeholder="e.g., digital marketing agency, e-commerce store"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="context">Context</Label>
                  <Textarea
                    id="context"
                    placeholder="Describe what you want to communicate..."
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tone</Label>
                  <div className="flex space-x-4">
                    {["formal", "friendly", "persuasive"].map((toneOption) => (
                      <label key={toneOption} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="tone"
                          value={toneOption}
                          checked={tone === toneOption}
                          onChange={(e) => setTone(e.target.value)}
                          className="text-blue-600"
                        />
                        <span className="capitalize">{toneOption}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={generateEmail}
                  disabled={generating}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Email"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Generated Email Display */}
            <Card>
              <CardHeader>
                <CardTitle>Generated Email</CardTitle>
                <CardDescription>
                  Your AI-generated professional email will appear here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedEmail ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold">Subject Line</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md">
                        <p className="font-medium">{generatedEmail.subject}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <Label className="text-sm font-semibold">Email Body</Label>
                      <Textarea
                        value={generatedEmail.body}
                        onChange={(e) => setGeneratedEmail({ ...generatedEmail, body: e.target.value })}
                        rows={12}
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => copyToClipboard(`Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`)}
                        variant="outline"
                        className="flex-1"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy All
                      </Button>
                      <Button
                        onClick={saveEmail}
                        disabled={saving || !profile?.is_pro}
                        variant="outline"
                        className="flex-1"
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        {profile?.is_pro ? "Save" : "Save (Pro)"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Generate an email to see the results here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <ProUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={() => {
          setShowUpgradeModal(false);
          if (!profile?.is_pro) {
            navigate("/payment");
          }
        }}
        isPro={profile?.is_pro}
        subscriptionEnd={subscriptionInfo?.subscription_end}
      />
    </div>
  );
};

export default Dashboard;
