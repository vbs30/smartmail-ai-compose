
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Crown, CreditCard, Lock, QrCode, Smartphone, Wallet, CreditCard as CardIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
  });

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    // Get user info
    const getUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setFormData({
          email: user.email || "",
          name: user.user_metadata?.full_name || user.user_metadata?.name || "",
        });
      }
    };

    getUserInfo();

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePayment = async () => {
    if (!formData.email || !formData.name) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and email.",
        variant: "destructive",
      });
      return;
    }

    if (!razorpayLoaded) {
      toast({
        title: "Payment System Loading",
        description: "Please wait for the payment system to load.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }

      // Create Razorpay order
      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        'create-razorpay-order',
        {
          body: { amount: 30, currency: 'INR' },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (orderError) {
        throw orderError;
      }

      // Configure Razorpay options
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'SmartMail AI',
        description: 'Pro Monthly Subscription',
        order_id: orderData.orderId,
        prefill: {
          name: formData.name,
          email: formData.email,
        },
        theme: {
          color: '#3B82F6'
        },
        handler: async function (response: any) {
          try {
            // Verify payment
            const { error: verifyError } = await supabase.functions.invoke(
              'verify-razorpay-payment',
              {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                },
                headers: {
                  Authorization: `Bearer ${session.access_token}`,
                },
              }
            );

            if (verifyError) {
              throw verifyError;
            }

            toast({
              title: "Payment Successful!",
              description: "Welcome to SmartMail AI Pro! Your account has been upgraded.",
            });

            navigate("/dashboard");
          } catch (error) {
            console.error('Payment verification error:', error);
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support if money was deducted.",
              variant: "destructive",
            });
          }
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: "Unable to process payment. Please try again.",
        variant: "destructive",
      });
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>SmartMail AI Pro (Monthly)</span>
                <span className="font-semibold">₹30</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Tax</span>
                <span>₹0</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total</span>
                <span>₹30/month</span>
              </div>
              
              <div className="mt-6 space-y-3">
                <h4 className="font-semibold">What you'll get:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Crown className="w-4 h-4 mr-2 text-yellow-500" />
                    Unlimited email generation
                  </li>
                  <li className="flex items-center">
                    <Crown className="w-4 h-4 mr-2 text-yellow-500" />
                    Save & organize emails
                  </li>
                  <li className="flex items-center">
                    <Crown className="w-4 h-4 mr-2 text-yellow-500" />
                    Priority support
                  </li>
                  <li className="flex items-center">
                    <Crown className="w-4 h-4 mr-2 text-yellow-500" />
                    Advanced features
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment Details
              </CardTitle>
              <CardDescription>
                <div className="flex items-center">
                  <Lock className="w-4 h-4 mr-1" />
                  Secure payment powered by Razorpay
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              {/* Payment Methods Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3 text-blue-800">Supported Payment Methods</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <CardIcon className="w-4 h-4 mr-2 text-blue-600" />
                    <span>Credit/Debit Cards</span>
                  </div>
                  <div className="flex items-center">
                    <Smartphone className="w-4 h-4 mr-2 text-blue-600" />
                    <span>UPI (GPay, PhonePe)</span>
                  </div>
                  <div className="flex items-center">
                    <Wallet className="w-4 h-4 mr-2 text-blue-600" />
                    <span>Net Banking</span>
                  </div>
                  <div className="flex items-center">
                    <QrCode className="w-4 h-4 mr-2 text-blue-600" />
                    <span>Wallets & QR</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handlePayment}
                disabled={processing || !razorpayLoaded}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
              >
                {processing ? "Processing..." : "Pay ₹30"}
              </Button>

              <div className="text-xs text-gray-500 text-center">
                By completing your purchase, you agree to our Terms of Service and Privacy Policy.
                You can cancel anytime from your account settings.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
