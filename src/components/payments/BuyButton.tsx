import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingCart } from 'lucide-react';
import { startArtworkCheckout } from '@/lib/payments';
import { useToast } from '@/hooks/use-toast';
import { log } from '@/lib/log';

interface BuyButtonProps {
  artworkId: string;
  forSale: boolean;
  price?: {
    amount: number;
    currency: string;
  };
  className?: string;
}

export const BuyButton = ({ artworkId, forSale, price, className }: BuyButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Critical business rule: never show buy button if not for sale
  if (!forSale || !price) {
    return null;
  }

  const handlePurchase = async () => {
    try {
      setIsLoading(true);
      
      await startArtworkCheckout(artworkId);
      
      toast({
        title: 'Redirecting to checkout',
        description: 'Opening Stripe checkout in a new tab...',
      });
      
    } catch (error) {
      log.error('Purchase initiation failed', { 
        artworkId, 
        error: error instanceof Error ? error.message : String(error) 
      });
      
      toast({
        title: 'Purchase failed',
        description: 'Unable to start checkout. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  return (
    <Button
      onClick={handlePurchase}
      disabled={isLoading}
      className={className}
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Buy for {formatPrice(price.amount, price.currency)}
        </>
      )}
    </Button>
  );
};