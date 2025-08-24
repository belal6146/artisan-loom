import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SubscriptionPlan } from "@/components/payments/SubscriptionPlan";
import { BillingManagement } from "@/components/payments/BillingManagement";
import { User, CreditCard, Bell, Shield } from "lucide-react";

// Mock user data
const mockUser = {
  id: "user-123",
  name: "John Doe", 
  email: "john@example.com",
  subscriptionStatus: null,
  subscriptionPriceId: null,
  hasStripeCustomer: false,
};

// Subscription plans configuration
const subscriptionPlans = [
  {
    name: "Plus",
    price: { monthly: 7.99, yearly: 79.99 },
    priceIds: {
      monthly: "STRIPE_PRICE_SUB_PLUS_MONTHLY",
      yearly: "STRIPE_PRICE_SUB_PLUS_YEARLY",
    },
    features: [
      { name: "Upload up to 50 artworks", included: true },
      { name: "Basic analytics", included: true },
      { name: "Community access", included: true },
      { name: "Priority support", included: false },
      { name: "Advanced marketplace tools", included: false },
    ],
    popular: true,
  },
  {
    name: "Pro",
    price: { monthly: 19.99, yearly: 199.99 },
    priceIds: {
      monthly: "STRIPE_PRICE_SUB_PRO_MONTHLY", 
      yearly: "STRIPE_PRICE_SUB_PRO_YEARLY",
    },
    features: [
      { name: "Unlimited artwork uploads", included: true },
      { name: "Advanced analytics & insights", included: true },
      { name: "Premium community access", included: true },
      { name: "Priority support", included: true },
      { name: "Advanced marketplace tools", included: true },
    ],
  },
];

export default function Account() {
  return (
    <AppLayout>
      <div className="container py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-display">Account Settings</h1>
            <p className="text-body-lg text-muted-foreground">
              Manage your account, subscription, and preferences
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Billing
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Privacy
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and profile settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        defaultValue={mockUser.name}
                        placeholder="Your full name" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email"
                        defaultValue={mockUser.email}
                        placeholder="Your email address" 
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-end">
                    <Button>Save Changes</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-6">
              {/* Current Billing Status */}
              <BillingManagement 
                subscriptionStatus={mockUser.subscriptionStatus}
                subscriptionPriceId={mockUser.subscriptionPriceId}
                hasStripeCustomer={mockUser.hasStripeCustomer}
              />

              {/* Subscription Plans */}
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Plans</CardTitle>
                  <CardDescription>
                    Choose the plan that best fits your needs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {subscriptionPlans.map((plan) => (
                      <SubscriptionPlan
                        key={plan.name}
                        name={plan.name}
                        price={plan.price}
                        priceIds={plan.priceIds}
                        features={plan.features}
                        popular={plan.popular}
                        currentPlan={false}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how you want to be notified about activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Notification settings coming soon...
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>
                    Control your privacy and data preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Privacy controls coming soon...
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}