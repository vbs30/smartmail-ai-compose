
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, FileText } from "lucide-react";

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Mail className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SmartMail AI
            </span>
          </div>
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            Back to Home
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Terms & Conditions
          </h1>
          <p className="text-lg text-gray-600">
            Last updated: December 29, 2024
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                By accessing and using SmartMail AI, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                SmartMail AI is an AI-powered email generation service that helps users create professional emails quickly. We offer both free and premium subscription plans.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Account Creation</h4>
                <p className="text-gray-600">You must provide accurate and complete information when creating your account.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Account Security</h4>
                <p className="text-gray-600">You are responsible for maintaining the confidentiality of your account credentials.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Account Termination</h4>
                <p className="text-gray-600">We reserve the right to terminate accounts that violate these terms or engage in prohibited activities.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription Plans</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Free Plan</h4>
                <p className="text-gray-600">Limited to 3 email generations per day. No payment required.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Pro Plan</h4>
                <p className="text-gray-600">₹30/month or ₹350/year for unlimited email generation and additional features.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Billing</h4>
                <p className="text-gray-600">Payments are processed securely through Razorpay. Subscriptions auto-renew unless cancelled.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acceptable Use</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">You agree not to use our service for:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Generating spam or unsolicited emails</li>
                <li>Creating content that is illegal, harmful, or offensive</li>
                <li>Impersonating others or misrepresenting your identity</li>
                <li>Violating any applicable laws or regulations</li>
                <li>Attempting to hack or compromise our systems</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                SmartMail AI and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Refund Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We offer a 7-day refund policy for Pro subscriptions. Contact us within 7 days of purchase for a full refund.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We reserve the right to modify these terms at any time. Users will be notified of significant changes via email or through our service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                For questions about these Terms & Conditions, please contact us at{" "}
                <a href="mailto:vbs02002@gmail.com" className="text-blue-600 hover:underline">
                  vbs02002@gmail.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
