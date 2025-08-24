import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Processing webhook");

    // Initialize Supabase with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Initialize Stripe
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY not configured');
    if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET not configured');

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    // Get raw body and signature
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    if (!signature) throw new Error('No Stripe signature header');

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Webhook signature verified", { eventType: event.type, eventId: event.id });
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err.message });
      return new Response('Webhook signature verification failed', { status: 400 });
    }

    // Process different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Processing checkout.session.completed", { sessionId: session.id, mode: session.mode });

        if (session.mode === 'payment') {
          // Handle artwork purchase
          const { artworkId, userId } = session.metadata || {};
          if (artworkId && userId) {
            await supabase
              .from('purchases')
              .update({
                stripe_payment_intent_id: session.payment_intent as string,
                status: 'completed',
              })
              .eq('stripe_checkout_session_id', session.id);

            logStep("Artwork purchase completed", { artworkId, userId, sessionId: session.id });
          }
        } else if (session.mode === 'subscription') {
          // Handle subscription
          const { userId } = session.metadata || {};
          if (userId && session.subscription) {
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
            const priceId = subscription.items.data[0]?.price.id;

            await supabase
              .from('profiles')
              .update({
                subscription_status: subscription.status,
                subscription_price_id: priceId,
              })
              .eq('id', userId);

            logStep("Subscription activated", { userId, subscriptionId: subscription.id, priceId });
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        
        if (customer && !customer.deleted && customer.metadata?.userId) {
          const priceId = subscription.items.data[0]?.price.id;
          
          await supabase
            .from('profiles')
            .update({
              subscription_status: subscription.status,
              subscription_price_id: priceId,
            })
            .eq('id', customer.metadata.userId);

          logStep("Subscription updated", { 
            userId: customer.metadata.userId, 
            subscriptionId: subscription.id,
            status: subscription.status,
            priceId 
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        
        if (customer && !customer.deleted && customer.metadata?.userId) {
          await supabase
            .from('profiles')
            .update({
              subscription_status: 'canceled',
              subscription_price_id: null,
            })
            .eq('id', customer.metadata.userId);

          logStep("Subscription canceled", { 
            userId: customer.metadata.userId, 
            subscriptionId: subscription.id 
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const customer = await stripe.customers.retrieve(subscription.customer as string);
          
          if (customer && !customer.deleted && customer.metadata?.userId) {
            await supabase
              .from('profiles')
              .update({
                subscription_status: 'past_due',
              })
              .eq('id', customer.metadata.userId);

            logStep("Payment failed, subscription past due", { 
              userId: customer.metadata.userId, 
              subscriptionId: subscription.id 
            });
          }
        }
        break;
      }

      default:
        logStep("Unhandled event type", { eventType: event.type });
    }

    return new Response('Webhook processed', { status: 200, headers: corsHeaders });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ error: 'WEBHOOK_ERROR', message: errorMessage }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});