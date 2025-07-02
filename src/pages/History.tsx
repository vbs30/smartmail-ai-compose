
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Copy, Trash2, ArrowLeft, Loader2, Calendar } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface SavedEmail {
  id: string;
  type: string;
  recipient_type: string;
  business_type: string;
  context: string;
  tone: string;
  subject: string;
  body: string;
  created_at: string;
}

interface Profile {
  is_pro: boolean;
}

const History = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [emails, setEmails] = useState<SavedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkUserAndLoadEmails();
  }, []);

  const checkUserAndLoadEmails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
        return;
      }
      
      setUser(user);
      
      // Get user profile to check Pro status
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_pro")
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
          description: "Email history is only available for Pro users.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }
      
      // Load saved emails
      const { data: emails, error: emailsError } = await supabase
        .from("emails")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (emailsError) {
        console.error("Error fetching emails:", emailsError);
        toast({
          title: "Error",
          description: "Failed to load email history",
          variant: "destructive",
        });
      } else {
        setEmails(emails || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
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

  const deleteEmail = async (emailId: string) => {
    setDeleting(emailId);
    
    try {
      const { error } = await supabase
        .from("emails")
        .delete()
        .eq("id", emailId);

      if (error) {
        throw error;
      }

      setEmails(emails.filter(email => email.id !== emailId));
      toast({
        title: "Deleted",
        description: "Email deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting email:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEmailTypeLabel = (type: string) => {
    return type.split("_").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case "formal": return "bg-blue-100 text-blue-800";
      case "friendly": return "bg-green-100 text-green-800";
      case "persuasive": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
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
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Back to Dashboard</span>
              </Button>
              <div className="flex items-center space-x-2">
                <Mail className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold">Email History</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Your Saved Emails</h1>
          <p className="text-gray-600">
            All your generated and saved emails in one place. Total: {emails.length} emails
          </p>
        </div>

        {emails.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">No saved emails yet</h3>
              <p className="text-gray-600 mb-4">
                Start generating emails and save them to build your email history.
              </p>
              <Button onClick={() => navigate("/dashboard")}>
                Generate Your First Email
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {emails.map((email) => (
              <Card key={email.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{email.subject}</CardTitle>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="secondary">
                          {getEmailTypeLabel(email.type)}
                        </Badge>
                        <Badge className={getToneColor(email.tone)}>
                          {email.tone.charAt(0).toUpperCase() + email.tone.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(email.created_at)}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(`Subject: ${email.subject}\n\n${email.body}`)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteEmail(email.id)}
                        disabled={deleting === email.id}
                      >
                        {deleting === email.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Recipient:</span> {email.recipient_type}
                      </div>
                      <div>
                        <span className="font-medium">Business:</span> {email.business_type}
                      </div>
                      <div>
                        <span className="font-medium">Tone:</span> {email.tone}
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-sm">Context:</span>
                      <p className="text-sm text-gray-600 mt-1">{email.context}</p>
                    </div>
                    
                    <div className="border-t pt-3">
                      <span className="font-medium text-sm">Email Body:</span>
                      <div className="mt-2 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm whitespace-pre-wrap">{email.body}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
