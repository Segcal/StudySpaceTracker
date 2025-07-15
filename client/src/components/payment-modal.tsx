import { useState } from "react";
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  paymentType: 'income_tax' | 'property_tax' | 'utility_bill';
  title: string;
  clientSecret: string;
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  amount, 
  paymentType, 
  title,
  clientSecret 
}: PaymentModalProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const recordPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      await apiRequest("POST", "/api/payments", paymentData);
    },
    onSuccess: () => {
      toast({
        title: "Payment recorded!",
        description: "Your payment has been successfully processed.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to record payment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Record the payment in our database
        recordPaymentMutation.mutate({
          amount,
          paymentType,
          stripePaymentIntentId: paymentIntent.id,
          status: 'completed',
        });
      }
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Pay {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount Due:</span>
              <span className="text-2xl font-bold text-gray-900">${amount.toLocaleString()}</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Payment Type: {paymentType.replace('_', ' ').toUpperCase()}
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary-800 hover:bg-primary-700"
                disabled={isProcessing || !stripe || !elements}
              >
                {isProcessing ? "Processing..." : `Pay $${amount.toLocaleString()}`}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}