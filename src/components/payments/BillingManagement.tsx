import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, AlertCircle } from 'lucide-react';
import { openBillingPortal } from '@/lib/payments';
import { useToast } from '@/hooks/use-toast';

interface BillingManagementProps {
  subscriptionStatus?: string | null;
  subscriptionPriceId?: string | null;
  hasStripeCustomer?: boolean;
}

export const BillingManagement = ({ 
  subscriptionStatus, 
  subscriptionPriceId,
  hasStripeCustomer = false 
}: BillingManagementProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleManageBilling = async () => {
    if (!hasStripeCustomer) {
      toast({
        title: 'No billing information',
        description: 'Please subscribe to a plan first to access billing management.',
        variant: 'default',
      });
      return;
    }

    try {
      setIsLoading(true);
      
      await openBillingPortal();
      
      toast({
        title: 'Opening billing portal',
        description: 'Redirecting to Stripe billing portal in a new tab...',
      });
      
    } catch (error) {
      toast({
        title: 'Unable to open billing portal',
        description: 'Please try again later or contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status?: string | null) => {
    if (!status) return null;
    
    const statusConfig = {
      active: { label: 'Active', variant: 'default' as const },
      trialing: { label: 'Trial', variant: 'secondary' as const },
      past_due: { label: 'Past Due', variant: 'destructive' as const },
      canceled: { label: 'Canceled', variant: 'secondary' as const },
      incomplete: { label: 'Incomplete', variant: 'destructive' as const },
      incomplete_expired: { label: 'Expired', variant: 'destructive' as const },
      unpaid: { label: 'Unpaid', variant: 'destructive' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return config ? (
      <Badge variant={config.variant}>{config.label}</Badge>
    ) : (
      <Badge variant="secondary">{status}</Badge>
    );
  };

  const getPlanName = (priceId?: string | null) => {
    if (!priceId) return 'No active plan';
    
    // Map price IDs to plan names (would be actual IDs in production)
    const planNames = {
      'STRIPE_PRICE_SUB_PLUS_MONTHLY': 'Plus Monthly',
      'STRIPE_PRICE_SUB_PLUS_YEARLY': 'Plus Yearly',
      'STRIPE_PRICE_SUB_PRO_MONTHLY': 'Pro Monthly',
      'STRIPE_PRICE_SUB_PRO_YEARLY': 'Pro Yearly',
    };
    
    return planNames[priceId as keyof typeof planNames] || 'Unknown Plan';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Billing & Subscription
        </CardTitle>
        <CardDescription>
          Manage your subscription, payment method, and billing history
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {subscriptionStatus ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Current Plan:</span>
              <span>{getPlanName(subscriptionPriceId)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Status:</span>
              {getStatusBadge(subscriptionStatus)}
            </div>
            
            {subscriptionStatus === 'past_due' && (
              <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                <div className="text-sm text-orange-700">
                  <p className="font-medium">Payment Required</p>
                  <p>Please update your payment method to continue your subscription.</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No active subscription</p>
            <p className="text-sm">Subscribe to a plan to access premium features</p>
          </div>
        )}

        <Button 
          className="w-full" 
          variant="outline"
          onClick={handleManageBilling}
          disabled={isLoading || !hasStripeCustomer}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Opening...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Manage Billing
            </>
          )}
        </Button>
        
        {!hasStripeCustomer && (
          <p className="text-xs text-muted-foreground text-center">
            Subscribe to a plan first to access billing management
          </p>
        )}
      </CardContent>
    </Card>
  );
};