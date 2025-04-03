import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Agent } from "@shared/schema";
import { useStripe, CardElement, Elements, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

interface AgentSubscriptionProps {
  agent: Agent;
  isSubscribed: boolean;
  onSubscriptionComplete?: () => void;
}

function CheckoutForm({ agent, onSuccess, onError }: { agent: Agent, onSuccess: () => void, onError: (message: string) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState<number | null>(null);

  // Create payment intent mutation
  const createPaymentIntentMutation = useMutation({
    mutationFn: async (agentId: number) => {
      const res = await apiRequest("POST", `/api/agents/${agentId}/create-payment-intent`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create payment intent");
      }
      return await res.json();
    },
    onSuccess: async (data) => {
      if (!stripe || !elements) {
        onError("Stripe hasn't loaded yet. Please try again.");
        return;
      }

      setSubscriptionId(data.subscriptionId);
      
      // Confirm the payment
      setIsProcessing(true);
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        onError("Card element not found");
        setIsProcessing(false);
        return;
      }
      
      const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Processimo User', // Ideally would use actual user name
          },
        }
      });

      if (error) {
        onError(error.message || "Payment failed");
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Complete the subscription
        completeSubscriptionMutation.mutate({
          subscriptionId: data.subscriptionId,
          paymentIntentId: paymentIntent.id
        });
      }
    },
    onError: (error: Error) => {
      onError(error.message);
      setIsProcessing(false);
    }
  });

  // Complete subscription mutation
  const completeSubscriptionMutation = useMutation({
    mutationFn: async (data: { subscriptionId: number, paymentIntentId: string }) => {
      const res = await apiRequest("POST", `/api/subscriptions/${data.subscriptionId}/complete`, {
        paymentIntentId: data.paymentIntentId
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to complete subscription");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/agents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/subscriptions"] });
      onSuccess();
      setIsProcessing(false);
    },
    onError: (error: Error) => {
      onError(error.message);
      setIsProcessing(false);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      onError("Stripe hasn't loaded yet. Please try again.");
      return;
    }
    
    createPaymentIntentMutation.mutate(agent.id);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Card Information</h3>
        <div className="border rounded-md p-3">
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#32325d',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }} />
        </div>
      </div>
      
      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Agent subscription</span>
          <span className="font-medium">${(agent.price / 100).toFixed(2)}/month</span>
        </div>
        <div className="flex justify-between font-medium">
          <span>Total</span>
          <span>${(agent.price / 100).toFixed(2)}</span>
        </div>
      </div>
      
      <DialogFooter className="mt-6">
        <DialogClose asChild>
          <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <Button 
          type="submit" 
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay $${(agent.price / 100).toFixed(2)}`
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function AgentSubscription({ agent, isSubscribed, onSubscriptionComplete }: AgentSubscriptionProps) {
  const { toast } = useToast();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const handlePaymentSuccess = () => {
    toast({
      title: "Subscription successful",
      description: `You have successfully subscribed to ${agent.name}.`,
    });
    setShowPaymentDialog(false);
    if (onSubscriptionComplete) {
      onSubscriptionComplete();
    }
  };

  const handlePaymentError = (message: string) => {
    toast({
      title: "Payment failed",
      description: message,
      variant: "destructive",
    });
  };

  return (
    <>
      <Button 
        className="w-full"
        disabled={isSubscribed}
        onClick={() => setShowPaymentDialog(true)}
      >
        {isSubscribed ? 'Already Subscribed' : 'Subscribe'}
      </Button>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Subscribe to {agent.name}</DialogTitle>
            <DialogDescription>
              Complete your payment information to subscribe to this AI agent.
            </DialogDescription>
          </DialogHeader>
          
          <Elements stripe={stripePromise}>
            <CheckoutForm 
              agent={agent} 
              onSuccess={handlePaymentSuccess} 
              onError={handlePaymentError}
            />
          </Elements>
        </DialogContent>
      </Dialog>
    </>
  );
}