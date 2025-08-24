-- Add Stripe integration fields to users table
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS subscription_status TEXT;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS subscription_price_id TEXT;

-- Create public profiles table with Stripe fields if not exists
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  stripe_customer_id TEXT,
  subscription_status TEXT CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid')),
  subscription_price_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY IF NOT EXISTS "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create purchases table for artwork transactions
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artwork_id UUID NOT NULL,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT NOT NULL DEFAULT 'usd',
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on purchases
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for purchases (buyers can see their own purchases)
CREATE POLICY IF NOT EXISTS "Users can view their own purchases" 
ON public.purchases FOR SELECT 
USING (auth.uid() = buyer_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own purchases" 
ON public.purchases FOR INSERT 
WITH CHECK (auth.uid() = buyer_id);

-- Edge functions can update purchases via service role
CREATE POLICY IF NOT EXISTS "Service role can update purchases" 
ON public.purchases FOR UPDATE 
USING (true);

-- Create indices for performance
CREATE INDEX IF NOT EXISTS profiles_stripe_customer_id_idx ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS purchases_buyer_id_idx ON public.purchases(buyer_id);
CREATE INDEX IF NOT EXISTS purchases_stripe_session_id_idx ON public.purchases(stripe_checkout_session_id);

-- Create trigger to update updated_at on profiles
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_purchases_updated_at 
  BEFORE UPDATE ON public.purchases 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();