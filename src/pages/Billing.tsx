
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Crown, 
  CreditCard, 
  Calendar, 
  Settings,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { User } from "@supabase/supabase-js";
import PaymentHistory from "@/components/PaymentHistory";

interface Profile {
  is_pro: boolean;
  name: string | null;
  email: string;
  created_at: string;
  updated_at: string;
}

const Billing = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkUserAndLoadProfile();
  }, []);

  const checkUserAndLoadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
        return;
      }
      
      setUser(user);
      
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
        return;
      }
      
      setProfile(profile);
      
      if (!profile.is_pro) {
        toast({
          title: "Pro Feature",
          description: "Billing information is only available for Pro users.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleUpgradeMore = () => {
    navigate("/payment");
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
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Back to Dashboard</span>
              </Button>
              <div className="flex items-center space-x-2">
                <CreditCard className="h-6 w-6 text-blue-600" />
                <span className="text-lg md:text-xl font-bold">Billing & Subscription</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Subscription Overview */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                  Current Plan
                </CardTitle>
                <CardDescription>
                  Your subscription details and status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Plan</span>
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500">
                    <Crown className="w-3 h-3 mr-1" />
                    Pro Plan
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status</span>
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Active
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-medium">Price</span>
                  <span className="font-bold">₹30/month</span>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Pro Features</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-center">
                      <CheckCircle className="w-3 h-3 mr-2 text-green-500 flex-shrink-0" />
                      <span>Unlimited email generation</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-3 h-3 mr-2 text-green-500 flex-shrink-0" />
                      <span>Save email history</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-3 h-3 mr-2 text-green-500 flex-shrink-0" />
                      <span>Advanced email templates</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-3 h-3 mr-2 text-green-500 flex-shrink-0" />
                      <span>Priority support</span>
                    </li>
                  </ul>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleUpgradeMore}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Subscription
                </Button>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Information</CardTitle>
                <CardDescription>
                  Your account details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Name</span>
                  <p className="font-medium break-words">{profile?.name || 'Not set'}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Email</span>
                  <p className="font-medium break-words">{profile?.email}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Member Since</span>
                  <p className="font-medium flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="break-words">{formatDate(profile?.created_at || '')}</span>
                  </p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Last Updated</span>
                  <p className="font-medium break-words">{formatDate(profile?.updated_at || '')}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment History */}
          <div className="lg:col-span-2">
            <PaymentHistory user={user} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
