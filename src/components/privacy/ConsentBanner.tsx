import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, Settings, X, ExternalLink } from "lucide-react";
import { getStoredConsent, setStoredConsent, needsConsentBanner, detectGPC } from "@/lib/privacy";
import type { ConsentState } from "@/lib/privacy";

export const ConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<Partial<ConsentState>>({
    analytics: false,
    marketing: false,
    aiFeatures: false,
  });
  const [gpcDetected, setGpcDetected] = useState(false);

  useEffect(() => {
    const needsBanner = needsConsentBanner();
    const gpc = detectGPC();
    
    setIsVisible(needsBanner);
    setGpcDetected(gpc);
    
    if (gpc) {
      // GPC signal detected - auto-deny tracking
      setConsent({
        analytics: false,
        marketing: false,
        aiFeatures: false,
      });
    }
  }, []);

  const handleAcceptAll = () => {
    if (gpcDetected) {
      // GPC users can only accept essential + AI features
      const finalConsent = {
        analytics: false,
        marketing: false,
        aiFeatures: true,
      };
      setStoredConsent(finalConsent);
    } else {
      setStoredConsent({
        analytics: true,
        marketing: true,
        aiFeatures: true,
      });
    }
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    setStoredConsent(consent);
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    setStoredConsent({
      analytics: false,
      marketing: false,
      aiFeatures: false,
    });
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4"
        role="dialog"
        aria-labelledby="consent-title"
        aria-describedby="consent-description"
      >
        <Card className="max-w-4xl mx-auto bg-card/95 backdrop-blur-sm border shadow-premium">
          <div className="p-6">
            {!showDetails ? (
              // Simple banner view
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Shield className="h-6 w-6 text-accent-warm flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 id="consent-title" className="text-heading text-foreground">
                        Privacy & Cookies
                      </h3>
                      {gpcDetected && (
                        <Badge variant="outline" className="mt-2 border-accent-warm text-accent-warm">
                          <Shield className="h-3 w-3 mr-1" />
                          GPC Signal Detected
                        </Badge>
                      )}
                    </div>
                    <p id="consent-description" className="text-body text-muted-foreground">
                      We use cookies and similar technologies to provide essential features, 
                      improve your experience, and analyze usage. 
                      {gpcDetected && (
                        <span className="text-accent-warm font-medium">
                          {" "}Your Global Privacy Control signal has been respected - tracking is disabled.
                        </span>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsVisible(false)}
                    className="flex-shrink-0"
                    aria-label="Close consent banner"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-3 items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDetails(true)}
                      className="gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Customize
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open("/privacy", "_blank")}
                      className="gap-2"
                    >
                      Privacy Policy
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleRejectAll}>
                      {gpcDetected ? "Essential Only" : "Reject All"}
                    </Button>
                    <Button onClick={handleAcceptAll} className="bg-gradient-brand text-white">
                      {gpcDetected ? "Accept (Privacy-Safe)" : "Accept All"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              // Detailed preferences view
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-heading">Privacy Preferences</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetails(false)}
                    aria-label="Back to simple view"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Essential Cookies */}
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium">Essential Cookies</Label>
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Necessary for authentication, security, and core functionality.
                      </p>
                    </div>
                    <Switch checked={true} disabled aria-label="Essential cookies (required)" />
                  </div>

                  {/* Analytics */}
                  <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium">Analytics & Performance</Label>
                        {gpcDetected && <Badge variant="outline" className="text-xs">Blocked by GPC</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Help us improve the platform with anonymous usage analytics.
                      </p>
                    </div>
                    <Switch
                      checked={consent.analytics ?? false}
                      disabled={gpcDetected}
                      onCheckedChange={(checked) => setConsent(prev => ({ ...prev, analytics: checked }))}
                      aria-label="Analytics cookies"
                    />
                  </div>

                  {/* Marketing */}
                  <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium">Marketing & Personalization</Label>
                        {gpcDetected && <Badge variant="outline" className="text-xs">Blocked by GPC</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Personalized content recommendations and relevant marketing.
                      </p>
                    </div>
                    <Switch
                      checked={consent.marketing ?? false}
                      disabled={gpcDetected}
                      onCheckedChange={(checked) => setConsent(prev => ({ ...prev, marketing: checked }))}
                      aria-label="Marketing cookies"
                    />
                  </div>

                  {/* AI Features */}
                  <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
                    <div className="flex-1">
                      <Label className="text-sm font-medium">AI Features</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        AI-powered content generation, tagging, and recommendations.
                      </p>
                    </div>
                    <Switch
                      checked={consent.aiFeatures ?? false}
                      onCheckedChange={(checked) => setConsent(prev => ({ ...prev, aiFeatures: checked }))}
                      aria-label="AI features"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button variant="outline" onClick={handleRejectAll}>
                    Reject All
                  </Button>
                  <Button onClick={handleSavePreferences} className="bg-gradient-brand text-white">
                    Save Preferences
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};