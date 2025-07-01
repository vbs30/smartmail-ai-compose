import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Calendar, CreditCard, Download, RefreshCw, CheckCircle } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface PaymentRecord {
  id: string;
  amount: number;
  status: string;
  date: string;
  plan: string;
  payment_method: string;
  transaction_id?: string;
}

interface PaymentHistoryProps {
  user: User | null;
}

const PaymentHistory = ({ user }: PaymentHistoryProps) => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadPaymentHistory();
    }
  }, [user]);

  const loadPaymentHistory = async () => {
    if (!user) return;

    try {
      // For now, we'll simulate payment history since we don't have a payments table
      // In a real app, you'd fetch from your payments table
      const simulatedPayments: PaymentRecord[] = [
        {
          id: '1',
          amount: 30,
          status: 'completed',
          date: new Date().toISOString(),
          plan: 'Pro Monthly',
          payment_method: 'Razorpay',
          transaction_id: 'pay_' + Math.random().toString(36).substr(2, 9)
        }
      ];

      setPayments(simulatedPayments);
    } catch (error) {
      console.error("Error loading payment history:", error);
      toast({
        title: "Error",
        description: "Failed to load payment history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshPayments = async () => {
    setRefreshing(true);
    await loadPaymentHistory();
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Payment history has been updated",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const downloadReceipt = (payment: PaymentRecord) => {
    // Create a simple receipt content
    const receiptContent = `
SMARTMAIL AI - PAYMENT RECEIPT
===============================

Receipt ID: ${payment.transaction_id}
Date: ${formatDate(payment.date)}
Plan: ${payment.plan}
Amount: ${formatCurrency(payment.amount)}
Status: ${payment.status}
Payment Method: ${payment.payment_method}

Thank you for your purchase!

Contact: support@smartmail-ai.com
Website: https://smartmail-ai.com
    `.trim();

    // Create and download the receipt
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SmartMail-AI-Receipt-${payment.transaction_id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Receipt Downloaded",
      description: `Receipt for ${payment.transaction_id} has been downloaded`,
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment History
            </CardTitle>
            <CardDescription>
              View and manage your payment history and receipts
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshPayments}
            disabled={refreshing}
          >
            {refreshing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">No Payment History</h3>
            <p className="text-gray-600">
              Your payment history will appear here once you make your first payment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Total Payments: {payments.length}
              </p>
              <p className="text-sm font-medium">
                Total Spent: {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
              </p>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {formatDate(payment.date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{payment.plan}</div>
                      {payment.transaction_id && (
                        <div className="text-sm text-gray-500">
                          ID: {payment.transaction_id}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(payment.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                        {payment.payment_method}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadReceipt(payment)}
                        className="flex items-center"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Receipt
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentHistory;
