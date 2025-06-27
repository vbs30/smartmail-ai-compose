
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Mail, Zap, Shield, Users, Star, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningUp(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            full_name: name,
          }
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: "Please check your email to confirm your account.",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Mail className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SmartMail AI
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleSignIn}>
              Sign In
            </Button>
            <Button onClick={handleSignIn} className="bg-gradient-to-r from-blue-600 to-purple-600">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-4 bg-blue-100 text-blue-800">
            <Zap className="w-3 h-3 mr-1" />
            AI-Powered Email Generation
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Generate Professional Business Emails in Seconds
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Stop spending hours crafting emails. Let AI write compelling, professional emails for your business needs. Perfect for SMBs, freelancers, and marketers.
          </p>
          
          {/* Quick Signup Form */}
          <Card className="max-w-md mx-auto mb-8 shadow-lg">
            <CardHeader>
              <CardTitle>Start Creating Better Emails</CardTitle>
              <CardDescription>Join thousands of professionals using SmartMail AI</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp} className="space-y-4">
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                  disabled={isSigningUp}
                >
                  {isSigningUp ? "Creating Account..." : "Start Free Trial"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
              <div className="mt-4 text-center">
                <Button variant="outline" onClick={handleSignIn} className="w-full">
                  Continue with Google
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose SmartMail AI?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to make your email communication more effective and professional.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>AI-Powered Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Advanced GPT-4 technology crafts professional emails tailored to your specific business needs and tone.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Multiple Email Types</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  From cold emails to follow-ups, offers to apologies - we've got every business scenario covered.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Save & Organize</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Keep track of all your generated emails with our smart history feature. Never lose a great email again.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">
              Choose the plan that works best for your business needs.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-2xl">Free Plan</CardTitle>
                <CardDescription>Perfect for trying out SmartMail AI</CardDescription>
                <div className="text-3xl font-bold">$0<span className="text-sm font-normal">/month</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    3 email generations per day
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    All email types
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    Multiple tone options
                  </li>
                  <li className="flex items-center text-gray-500">
                    <Check className="h-5 w-5 text-gray-400 mr-2" />
                    No email history
                  </li>
                </ul>
                <Button className="w-full mt-6" variant="outline" onClick={handleSignIn}>
                  Get Started Free
                </Button>
              </CardContent>
            </Card>
            
            <Card className="relative border-2 border-blue-500">
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                Most Popular
              </Badge>
              <CardHeader>
                <CardTitle className="text-2xl">Pro Plan</CardTitle>
                <CardDescription>For serious professionals and businesses</CardDescription>
                <div className="text-3xl font-bold">$9<span className="text-sm font-normal">/month</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    Unlimited email generations
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    All email types
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    Multiple tone options
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    Complete email history
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    Priority support
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600" onClick={handleSignIn}>
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600">
              Join thousands of professionals who trust SmartMail AI.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Sarah Johnson",
                role: "Marketing Director",
                company: "TechStart Inc.",
                content: "SmartMail AI has transformed how we handle client communications. The emails are always professional and perfectly tailored.",
                rating: 5
              },
              {
                name: "Mike Chen",
                role: "Freelance Consultant",
                company: "Independent",
                content: "As a freelancer, I need to send lots of different types of emails. This tool saves me hours every week.",
                rating: 5
              },
              {
                name: "Lisa Davis",
                role: "Sales Manager",
                company: "Growth Solutions",
                content: "The cold email templates generated by SmartMail AI have significantly improved our response rates.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="text-left hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Mail className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold">SmartMail AI</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Support</a>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-400">
            <p>&copy; 2024 SmartMail AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
