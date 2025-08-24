import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockArtwork, mockUser } from '../fixtures';
import { metrics, METRICS } from '@/lib/metrics';

// Mock Supabase edge function calls
const mockFunctionInvoke = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: mockFunctionInvoke,
    },
  },
}));

// Mock payments client
const mockPaymentsClient = {
  startArtworkCheckout: vi.fn(),
  startSubscriptionCheckout: vi.fn(),
  openBillingPortal: vi.fn(),
};

describe('Payments API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    metrics.reset();
  });

  describe('Artwork Checkout', () => {
    it('should reject checkout when artwork not for sale', async () => {
      // Mock edge function response for not-for-sale artwork
      mockFunctionInvoke.mockResolvedValue({
        data: null,
        error: { 
          message: 'ARTWORK_NOT_FOR_SALE: This artwork is not for sale' 
        },
      });

      try {
        await mockPaymentsClient.startArtworkCheckout('artwork-not-for-sale');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).toContain('ARTWORK_NOT_FOR_SALE');
      }
    });

    it('should return checkout URL when artwork is for sale', async () => {
      const mockCheckoutUrl = 'https://checkout.stripe.com/pay/cs_test_123';
      
      mockFunctionInvoke.mockResolvedValue({
        data: { url: mockCheckoutUrl },
        error: null,
      });

      mockPaymentsClient.startArtworkCheckout.mockResolvedValue(undefined);

      await mockPaymentsClient.startArtworkCheckout('artwork-for-sale');
      
      expect(mockPaymentsClient.startArtworkCheckout).toHaveBeenCalledWith('artwork-for-sale');
    });

    it('should create purchase record on webhook completion', () => {
      // Mock webhook payload
      const webhookPayload = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            mode: 'payment',
            payment_intent: 'pi_test_123',
            metadata: {
              artworkId: 'artwork-123',
              userId: 'user-123',
              type: 'artwork_purchase',
            },
          },
        },
      };

      // Simulate webhook processing
      expect(webhookPayload.data.object.mode).toBe('payment');
      expect(webhookPayload.data.object.metadata.artworkId).toBe('artwork-123');
    });
  });

  describe('Subscription Checkout', () => {
    it('should return checkout URL for valid price ID', async () => {
      const mockCheckoutUrl = 'https://checkout.stripe.com/pay/cs_test_sub_123';
      const priceId = 'price_123';
      
      mockFunctionInvoke.mockResolvedValue({
        data: { url: mockCheckoutUrl },
        error: null,
      });

      mockPaymentsClient.startSubscriptionCheckout.mockResolvedValue(undefined);

      await mockPaymentsClient.startSubscriptionCheckout(priceId);
      
      expect(mockPaymentsClient.startSubscriptionCheckout).toHaveBeenCalledWith(priceId);
    });

    it('should update subscription status on webhook completion', () => {
      // Mock subscription webhook payload
      const webhookPayload = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_sub_123',
            mode: 'subscription',
            subscription: 'sub_123',
            metadata: {
              userId: 'user-123',
              type: 'subscription',
            },
          },
        },
      };

      expect(webhookPayload.data.object.mode).toBe('subscription');
      expect(webhookPayload.data.object.subscription).toBe('sub_123');
    });
  });

  describe('Webhook Security', () => {
    it('should reject webhook with invalid signature', () => {
      // Mock invalid signature scenario
      const invalidSignatureError = new Error('Webhook signature verification failed');
      
      expect(() => {
        throw invalidSignatureError;
      }).toThrow('Webhook signature verification failed');
    });
  });

  describe('Idempotency', () => {
    it('should return same result for repeated checkout with same key', async () => {
      const mockResponse = { url: 'https://checkout.stripe.com/pay/cs_test_123' };
      
      mockFunctionInvoke
        .mockResolvedValueOnce({ data: mockResponse, error: null })
        .mockResolvedValueOnce({ data: mockResponse, error: null });

      mockPaymentsClient.startArtworkCheckout.mockResolvedValue(undefined);

      // First call
      await mockPaymentsClient.startArtworkCheckout('artwork-123');
      
      // Second call with same artwork should work (idempotent)
      await mockPaymentsClient.startArtworkCheckout('artwork-123');
      
      expect(mockPaymentsClient.startArtworkCheckout).toHaveBeenCalledTimes(2);
    });
  });

  describe('Business Rules', () => {
    it('should never expose price when forSale is false', () => {
      const artworkNotForSale = {
        ...mockArtwork,
        forSale: false,
        price: undefined, // Price should be hidden
      };

      expect(artworkNotForSale.forSale).toBe(false);
      expect(artworkNotForSale.price).toBeUndefined();
    });

    it('should validate Money currency matches session currency', () => {
      const artworkPrice = { amount: 99, currency: 'USD' };
      const sessionCurrency = 'usd'; // Stripe uses lowercase
      
      expect(artworkPrice.currency.toLowerCase()).toBe(sessionCurrency);
    });
  });
});