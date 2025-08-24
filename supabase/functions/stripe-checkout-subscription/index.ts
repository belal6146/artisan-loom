import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-CHECKOUT-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting subscription checkout");

    // Initialize Supabase with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get auth user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');
    
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) throw new Error('User not authenticated');

    const user = userData.user;
    logStep("User authenticated", { userId: user.id });

    // Parse request body
    const { priceId } = await req.json();
    if (!priceId) throw new Error('priceId is required');

    logStep("Processing subscription", { priceId });

    // Initialize Stripe
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY not configured');

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    // Find or create Stripe customer
    let customerId: string;
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id;
      logStep("Found existing customer", { customerId });
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;

      // Update profile with customer ID
      await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          email: user.email,
          stripe_customer_id: customerId 
        });

      logStep("Created new customer", { customerId });
    }

    // Create subscription checkout session
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173';
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: `${appUrl}/account?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/account?subscription=cancelled`,
      metadata: {
        userId: user.id,
        type: 'subscription',
      },
    });

    logStep("Subscription checkout session created", { sessionId: session.id, url: session.url });

    return new Response(
      JSON.stringify({ url: session.url }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ error: 'SUBSCRIPTION_CHECKOUT_ERROR', message: errorMessage }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});