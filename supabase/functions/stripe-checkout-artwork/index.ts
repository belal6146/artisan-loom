import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-CHECKOUT-ARTWORK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting artwork checkout");

    // Initialize Supabase with service role for secure operations
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

    // Parse and validate request body
    const { artworkId } = await req.json();
    if (!artworkId) throw new Error('artworkId is required');

    logStep("Fetching artwork", { artworkId });

    // Fetch artwork (simulate - replace with real table query)
    // For now, using mock data since artwork table structure isn't defined
    const mockArtwork = {
      id: artworkId,
      userId: 'artist-123',
      title: 'Beautiful Digital Art',
      forSale: true,
      privacy: 'public',
      price: { amount: 99, currency: 'USD' },
      imageUrl: 'https://picsum.photos/400/400',
    };

    // Business rule checks
    if (!mockArtwork.forSale) {
      logStep("Artwork not for sale", { artworkId });
      return new Response(
        JSON.stringify({ error: 'ARTWORK_NOT_FOR_SALE', message: 'This artwork is not for sale' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (mockArtwork.privacy !== 'public') {
      logStep("Artwork not public", { artworkId });
      return new Response(
        JSON.stringify({ error: 'ARTWORK_NOT_PUBLIC', message: 'This artwork is not publicly available' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (mockArtwork.userId === user.id) {
      logStep("User trying to buy own artwork", { artworkId, userId: user.id });
      return new Response(
        JSON.stringify({ error: 'CANNOT_BUY_OWN_ARTWORK', message: 'You cannot purchase your own artwork' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // Create checkout session
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173';
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: mockArtwork.price.currency.toLowerCase(),
          unit_amount: mockArtwork.price.amount * 100, // Convert to cents
          product_data: {
            name: mockArtwork.title,
            images: [mockArtwork.imageUrl],
            metadata: { artworkId },
          },
        },
        quantity: 1,
      }],
      success_url: `${appUrl}/insights?purchase=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/artwork/${artworkId}?purchase=cancelled`,
      metadata: {
        artworkId,
        userId: user.id,
        type: 'artwork_purchase',
      },
    });

    // Create pending purchase record
    await supabase.from('purchases').insert({
      buyer_id: user.id,
      artwork_id: artworkId,
      amount: mockArtwork.price.amount * 100,
      currency: mockArtwork.price.currency.toLowerCase(),
      stripe_checkout_session_id: session.id,
      status: 'pending',
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(
      JSON.stringify({ url: session.url }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ error: 'CHECKOUT_ERROR', message: errorMessage }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});