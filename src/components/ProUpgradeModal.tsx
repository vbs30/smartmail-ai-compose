
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, X, Calendar } from "lucide-react";

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  isPro?: boolean;
  subscriptionEnd?: string | null;
}

const ProUpgradeModal = ({ isOpen, onClose, onUpgrade, isPro = false, subscriptionEnd }: ProUpgradeModalProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isPro) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Crown className="w-6 h-6 mr-2 text-yellow-500" />
              You're Already Pro!
            </DialogTitle>
            <DialogDescription>
              You have an active Pro subscription with unlimited access to all features.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 text-center">
            <Crown className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            <div className="text-lg font-semibold mb-2">Enjoying Pro Benefits</div>
            
            {subscriptionEnd && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Subscription Valid Until</span>
                </div>
                <div className="text-lg font-bold text-blue-900">{formatDate(subscriptionEnd)}</div>
              </div>
            )}
            
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Unlimited email generation</li>
              <li>✓ Save & organize emails</li>
              <li>✓ Email history access</li>
              <li>✓ Priority support</li>
            </ul>
          </div>

          <div className="flex justify-center pt-4">
            <Button onClick={onClose}>
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Crown className="w-6 h-6 mr-2 text-yellow-500" />
            Upgrade to SmartMail AI Pro
          </DialogTitle>
          <DialogDescription>
            You've reached your daily limit of 3 email generations. Upgrade to Pro for unlimited access!
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6 py-4">
          {/* Free Plan */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg">Free Plan</CardTitle>
              <CardDescription>Current Plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm">3 emails per day</span>
              </div>
              <div className="flex items-center">
                <X className="w-4 h-4 text-red-500 mr-2" />
                <span className="text-sm">No email history</span>
              </div>
              <div className="flex items-center">
                <X className="w-4 h-4 text-red-500 mr-2" />
                <span className="text-sm">Limited features</span>
              </div>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="border-2 border-gradient-to-r from-yellow-400 to-orange-500 relative">
            <div className="absolute -top-2 -right-2">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                RECOMMENDED
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                Pro Plan
              </CardTitle>
              <CardDescription>₹30/month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm">Unlimited email generation</span>
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm">Save & organize emails</span>
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm">Priority support</span>
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm">Advanced email templates</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Maybe Later
          </Button>
          <Button 
            onClick={onUpgrade}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Pro
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProUpgradeModal;
