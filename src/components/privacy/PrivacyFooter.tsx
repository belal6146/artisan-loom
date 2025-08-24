import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, ExternalLink } from "lucide-react";
import { detectGPC } from "@/lib/privacy";
import { useState, useEffect } from "react";

export const PrivacyFooter = () => {
  const [gpcDetected, setGpcDetected] = useState(false);

  useEffect(() => {
    setGpcDetected(detectGPC());
  }, []);

  return (
    <div className="bg-muted/30 border-t py-6">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-accent-warm" />
                <span className="text-sm font-medium">Privacy First</span>
              </div>
              {gpcDetected && (
                <Badge variant="outline" className="border-accent-warm text-accent-warm text-xs">
                  GPC Respected
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.open("/privacy", "_blank")}
                className="h-8 px-3"
              >
                Privacy Center
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.open("/privacy-policy", "_blank")}
                className="h-8 px-3"
              >
                Privacy Policy
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.open("/vendors", "_blank")}
                className="h-8 px-3"
              >
                Data Partners
              </Button>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">GDPR Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};