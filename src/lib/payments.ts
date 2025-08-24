import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { log, generateRequestId } from './log';
import { metrics, METRICS } from './metrics';

// Zod schemas for API validation
const CheckoutResponseSchema = z.object({
  url: z.string().url(),
});

const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
});

// Payment API client with strict typing
export class PaymentsClient {
  private async callFunction<T>(
    functionName: string, 
    body: Record<string, unknown>,
    schema: z.ZodSchema<T>
  ): Promise<T> {
    const requestId = generateRequestId();
    
    try {
      log.info('Payment function call started', { 
        requestId, 
        function: functionName,
        bodyKeys: Object.keys(body)
      });

      const { data, error } = await supabase.functions.invoke(functionName, {
        body,
      });

      if (error) {
        log.error('Payment function error', { requestId, function: functionName, error: error.message });
        throw new Error(error.message);
      }

      const validatedData = schema.parse(data);
      log.info('Payment function call completed', { requestId, function: functionName });
      
      return validatedData;
    } catch (error) {
      log.error('Payment function call failed', { 
        requestId, 
        function: functionName, 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  async startArtworkCheckout(artworkId: string): Promise<void> {
    const requestId = generateRequestId();
    
    try {
      const response = await this.callFunction(
        'stripe-checkout-artwork',
        { artworkId },
        CheckoutResponseSchema
      );

      metrics.increment(METRICS.ARTWORKS_UPLOAD); // Reusing existing metric
      log.info('Redirecting to artwork checkout', { requestId, artworkId });
      
      // Open in new tab to preserve app state
      window.open(response.url, '_blank');
    } catch (error) {
      log.error('Artwork checkout failed', { 
        requestId, 
        artworkId, 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  async startSubscriptionCheckout(priceId: string): Promise<void> {
    const requestId = generateRequestId();
    
    try {
      const response = await this.callFunction(
        'stripe-checkout-subscription',
        { priceId },
        CheckoutResponseSchema
      );

      metrics.increment('subscription_checkout_started');
      log.info('Redirecting to subscription checkout', { requestId, priceId });
      
      // Open in new tab to preserve app state
      window.open(response.url, '_blank');
    } catch (error) {
      log.error('Subscription checkout failed', { 
        requestId, 
        priceId, 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  async openBillingPortal(): Promise<void> {
    const requestId = generateRequestId();
    
    try {
      const response = await this.callFunction(
        'stripe-portal',
        {},
        CheckoutResponseSchema
      );

      log.info('Redirecting to billing portal', { requestId });
      
      // Open in new tab to preserve app state
      window.open(response.url, '_blank');
    } catch (error) {
      log.error('Billing portal failed', { 
        requestId, 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }
}

// Export singleton instance
export const paymentsClient = new PaymentsClient();

// Convenience functions for direct use
export const startArtworkCheckout = (artworkId: string) => 
  paymentsClient.startArtworkCheckout(artworkId);

export const startSubscriptionCheckout = (priceId: string) => 
  paymentsClient.startSubscriptionCheckout(priceId);

export const openBillingPortal = () => 
  paymentsClient.openBillingPortal();

// Subscription price IDs from environment
export const SUBSCRIPTION_PRICES = {
  PLUS_MONTHLY: 'STRIPE_PRICE_SUB_PLUS_MONTHLY',
  PLUS_YEARLY: 'STRIPE_PRICE_SUB_PLUS_YEARLY', 
  PRO_MONTHLY: 'STRIPE_PRICE_SUB_PRO_MONTHLY',
  PRO_YEARLY: 'STRIPE_PRICE_SUB_PRO_YEARLY',
} as const;

// Helper to check if subscription features are available
export const hasSubscriptionPrices = (): boolean => {
  // In production, these would be actual price IDs from Stripe
  // For now, return false to show disabled state
  return false;
};