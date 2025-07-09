
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Zap, 
  Shield, 
  Crown, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  Clock,
  Users
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error("Error checking user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://smartmail-ai.lovable.app/dashboard'
        }
      });
      
      if (error) {
        console.error("Error signing in:", error);
      }
    } catch (error) {
      console.error("Error during sign in:", error);
    }
  };

  const handleGetStarted = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://smartmail-ai.lovable.app/dashboard'
        }
      });
      
      if (error) {
        console.error("Error signing up:", error);
      }
    } catch (error) {
      console.error("Error during sign up:", error);
    }
  };

  const handleUpgradeClick = () => {
    // Always navigate to payment page, regardless of login status
    navigate("/payment");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Mail className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
            <span className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SmartMail AI
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <Button 
                onClick={() => navigate("/dashboard")}
                className="bg-white text-black hover:bg-gray-100 border border-gray-200"
              >
                Go to Dashboard
              </Button>
            ) : (
              <Button variant="outline" onClick={handleSignIn}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-200">
            <Sparkles className="w-4 h-4 mr-1" />
            AI-Powered Email Generation
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Write Perfect Emails in Seconds
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Stop wasting time crafting emails. Our AI creates professional, personalized emails 
            tailored to your business needs. From cold outreach to follow-ups, we've got you covered.
          </p>
          
          <div className="flex justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3"
              onClick={handleGetStarted}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex flex-col items-center justify-center mt-6 text-sm text-gray-500 space-y-1">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              Free forever • No credit card required
            </div>
            <div className="text-xs text-gray-400">
              Created by Vinayak Suryavanshi
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why Choose SmartMail AI?</h2>
          <p className="text-xl text-gray-600">Powerful features designed to make email writing effortless</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2 hover:border-blue-200 transition-colors">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Lightning Fast</CardTitle>
              <CardDescription>
                Generate professional emails in under 10 seconds. No more writer's block.
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-2 hover:border-purple-200 transition-colors">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Smart & Contextual</CardTitle>
              <CardDescription>
                AI understands your business context and creates relevant, personalized content.
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-2 hover:border-green-200 transition-colors">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Multiple Tones</CardTitle>
              <CardDescription>
                Choose from formal, friendly, or persuasive tones to match your communication style.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600">Start free, upgrade when you need more</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="border-2 hover:border-blue-200 transition-colors">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Free Plan</CardTitle>
              <div className="text-4xl font-bold text-blue-600 my-4">₹0</div>
              <CardDescription>Perfect for getting started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span>3 email generations per day</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span>All email types</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span>Multiple tones</span>
              </div>
              <Button 
                className="w-full mt-6" 
                variant="outline"
                onClick={handleGetStarted}
              >
                Get Started Free
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="border-2 border-gradient-to-r from-yellow-400 to-orange-500 relative hover:border-yellow-300 transition-colors">
            <div className="absolute -top-2 -right-2">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500">
                <Crown className="w-3 h-3 mr-1" />
                POPULAR
              </Badge>
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center">
                <Crown className="w-6 h-6 mr-2 text-yellow-500" />
                Pro Plan
              </CardTitle>
              <div className="text-4xl font-bold text-yellow-600 my-4">
                ₹30
                <span className="text-lg font-normal text-gray-500">/month</span>
              </div>
              <div className="text-sm text-gray-500">
                or ₹350/year (Save ₹10!)
              </div>
              <CardDescription>For professionals and businesses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span>Unlimited email generation</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span>Save & organize emails</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span>Email history & templates</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span>Priority support</span>
              </div>
              <Button 
                className="w-full mt-6 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600" 
                onClick={handleUpgradeClick}
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Email Game?</h2>
          <p className="text-xl opacity-90 mb-8">
            Join thousands of professionals who save hours every week with SmartMail AI
          </p>
          <div className="flex justify-center">
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-lg px-8 py-3"
              onClick={handleGetStarted}
            >
              <Clock className="mr-2 h-5 w-5" />
              Start Free Trial
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left text-gray-600">
            <p>&copy; 2025 SmartMail AI. All rights reserved.</p>
          </div>
          <div className="flex space-x-6 text-sm">
            <a 
              href="/contact" 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Contact Us
            </a>
            <a 
              href="/privacy-policy" 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Privacy Policy
            </a>
            <a 
              href="/terms-conditions" 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Terms & Conditions
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
