import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, Crown, Zap } from 'lucide-react';
import { startSubscriptionCheckout, hasSubscriptionPrices } from '@/lib/payments';
import { useToast } from '@/hooks/use-toast';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface SubscriptionPlanProps {
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  priceIds: {
    monthly: string;
    yearly: string;
  };
  features: PlanFeature[];
  popular?: boolean;
  currentPlan?: boolean;
}

export const SubscriptionPlan = ({ 
  name, 
  price, 
  priceIds, 
  features, 
  popular = false,
  currentPlan = false 
}: SubscriptionPlanProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const { toast } = useToast();

  const subscriptionsAvailable = hasSubscriptionPrices();
  const currentPrice = billingPeriod === 'monthly' ? price.monthly : price.yearly;
  const currentPriceId = billingPeriod === 'monthly' ? priceIds.monthly : priceIds.yearly;

  const handleSubscribe = async () => {
    if (!subscriptionsAvailable) {
      toast({
        title: 'Coming soon',
        description: 'Subscription plans will be available soon!',
      });
      return;
    }

    try {
      setIsLoading(true);
      
      await startSubscriptionCheckout(currentPriceId);
      
      toast({
        title: 'Redirecting to checkout',
        description: 'Opening Stripe checkout in a new tab...',
      });
      
    } catch (error) {
      toast({
        title: 'Subscription failed', 
        description: 'Unable to start subscription. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card className={`relative ${popular ? 'border-primary shadow-lg' : ''}`}>
      {popular && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
          Most Popular
        </Badge>
      )}
      
      <CardHeader className="text-center pb-8">
        <CardTitle className="flex items-center justify-center gap-2">
          {name === 'Plus' ? <Zap className="h-5 w-5" /> : <Crown className="h-5 w-5" />}
          {name}
        </CardTitle>
        
        <div className="space-y-2">
          <div className="text-3xl font-bold">
            {formatPrice(currentPrice)}
            <span className="text-base font-normal text-muted-foreground">
              /{billingPeriod === 'monthly' ? 'month' : 'year'}
            </span>
          </div>
          
          {billingPeriod === 'yearly' && (
            <Badge variant="secondary">Save 17%</Badge>
          )}
        </div>

        <div className="flex bg-muted rounded-lg p-1">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`flex-1 py-2 text-sm rounded-md transition-colors ${
              billingPeriod === 'monthly' 
                ? 'bg-background shadow-sm' 
                : 'hover:bg-background/50'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`flex-1 py-2 text-sm rounded-md transition-colors ${
              billingPeriod === 'yearly' 
                ? 'bg-background shadow-sm' 
                : 'hover:bg-background/50'
            }`}
          >
            Yearly
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                feature.included ? 'bg-green-500' : 'bg-gray-300'
              }`} />
              <span className={feature.included ? '' : 'text-muted-foreground line-through'}>
                {feature.name}
              </span>
            </div>
          ))}
        </div>

        {currentPlan ? (
          <Button className="w-full" disabled>
            Current Plan
          </Button>
        ) : subscriptionsAvailable ? (
          <Button 
            className="w-full" 
            onClick={handleSubscribe}
            disabled={isLoading}
            variant={popular ? 'default' : 'outline'}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Subscribe to ${name}`
            )}
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="w-full" disabled variant="outline">
                Coming Soon
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Subscription plans are being set up and will be available soon!</p>
            </TooltipContent>
          </Tooltip>
        )}
      </CardContent>
    </Card>
  );
};