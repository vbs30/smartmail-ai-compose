
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Crown, CreditCard, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const PaymentPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    email: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePayment = async () => {
    if (!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.cardName || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all payment details.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      toast({
        title: "Payment Successful!",
        description: "Welcome to SmartMail AI Pro! Your account has been upgraded.",
      });
      
      // In a real app, you'd update the user's pro status here
      navigate("/dashboard");
      setProcessing(false);
    }, 2000);
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
                <span className="font-semibold">$9.99</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Tax</span>
                <span>$0.00</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total</span>
                <span>$9.99/month</span>
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
                  Your payment information is secure and encrypted
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="card-name">Cardholder Name</Label>
                <Input
                  id="card-name"
                  placeholder="John Doe"
                  value={formData.cardName}
                  onChange={(e) => handleInputChange("cardName", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="card-number">Card Number</Label>
                <Input
                  id="card-number"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={formData.cvv}
                    onChange={(e) => handleInputChange("cvv", e.target.value)}
                  />
                </div>
              </div>

              <Button
                onClick={handlePayment}
                disabled={processing}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
              >
                {processing ? "Processing..." : "Complete Payment"}
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
