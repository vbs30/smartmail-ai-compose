
import { useEffect, useState, useCallback } from "react";
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const testimonials = [
    {
      text: "This app has completely transformed my daily workflow. I used to spend hours crafting emails, but now I generate professional content in seconds. The AI understands context perfectly and saves me at least 2 hours every day. Absolutely game-changing for my productivity!",
      name: "Manoj Kumar",
      title: "Assistant Manager"
    },
    {
      text: "SmartMail AI is incredible! The quality of emails it generates is outstanding. My response rates have improved by 40% since I started using it. The different tone options help me communicate effectively with various clients. Worth every penny!",
      name: "Priya Sharma",
      title: "Sales Executive"
    },
    {
      text: "I was skeptical about AI writing tools, but SmartMail AI proved me wrong. It creates emails that sound exactly like my writing style. The personalization features are spot-on, and my team productivity has increased significantly.",
      name: "Rahul Mehta",
      title: "Marketing Director"
    },
    {
      text: "As a busy entrepreneur, time is everything. SmartMail AI has become my secret weapon for client communications. The emails are professional, engaging, and perfectly tailored. I can't imagine working without it now!",
      name: "Sneha Patel",
      title: "CEO, TechStart"
    },
    {
      text: "The Pro version is absolutely worth it! Unlimited email generation has streamlined our entire customer support process. Our team response time has improved by 60%, and customer satisfaction scores are at an all-time high.",
      name: "Amit Singh",
      title: "Customer Success Manager"
    },
    {
      text: "SmartMail AI understands business context better than any tool I've used. From follow-ups to cold outreach, every email feels personal and professional. It's like having a professional copywriter on demand 24/7.",
      name: "Kavya Reddy",
      title: "Business Development Head"
    },
    {
      text: "This tool has revolutionized how I handle client communications in my consulting business. The AI generates emails that perfectly match my professional tone and have significantly improved my client relationships. Highly recommended!",
      name: "James Wilson",
      title: "Business Consultant, USA"
    },
    {
      text: "Working in international sales, I need emails that work across different cultures. SmartMail AI creates culturally appropriate content that resonates with clients worldwide. My conversion rates have never been better!",
      name: "Arjun Krishnan",
      title: "International Sales Director"
    },
    {
      text: "The efficiency gains are remarkable! What used to take me 30 minutes per email now takes 30 seconds. The quality is consistently professional, and my team has adopted this as our standard tool for all client communications.",
      name: "Sarah Chen",
      title: "Operations Manager, Singapore"
    },
    {
      text: "SmartMail AI has become indispensable for my digital marketing agency. We handle multiple clients with different brand voices, and this tool adapts perfectly to each one. Our productivity has increased by 300% since implementation!",
      name: "Vikram Gupta",
      title: "Founder, Digital Marketing Agency"
    }
  ];

  // Auto-scroll functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 20000); // Change slide every 20 seconds (very slow for reading)

    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

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

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-xl text-gray-600">Join thousands of satisfied professionals</p>
        </div>
        
        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden rounded-lg">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ 
                transform: `translateX(-${currentSlide * 100}%)`,
                width: `${testimonials.length * 100}%`
              }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <Card className="border-2 hover:border-blue-200 hover:shadow-lg transition-all duration-300 bg-white max-w-2xl mx-auto">
                    <CardContent className="p-8">
                      <blockquote className="italic text-gray-700 mb-6 leading-relaxed text-lg">
                        "{testimonial.text}"
                      </blockquote>
                      <div className="border-t pt-6 text-center">
                        <p className="font-semibold text-gray-900 text-lg">{testimonial.name}</p>
                        <p className="text-sm text-gray-600 mt-1">{testimonial.title}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-center mt-8 space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="hover:bg-blue-50 hover:border-blue-300"
              onClick={prevSlide}
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="hover:bg-blue-50 hover:border-blue-300"
              onClick={nextSlide}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
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
