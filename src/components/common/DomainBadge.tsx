import { Badge } from "@/components/ui/badge";
import { Shield, ExternalLink } from "lucide-react";

interface DomainBadgeProps {
  url: string;
  verified?: boolean;
  showIcon?: boolean;
  className?: string;
}

export const DomainBadge = ({ url, verified = false, showIcon = true, className }: DomainBadgeProps) => {
  const getDomain = (urlString: string): string => {
    try {
      const urlObj = new URL(urlString);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return urlString;
    }
  };

  const domain = getDomain(url);

  return (
    <Badge variant="secondary" className={`text-xs flex items-center gap-1 ${className}`}>
      {showIcon && <ExternalLink className="h-3 w-3" />}
      <span>{domain}</span>
      {verified && (
        <>
          <Shield className="h-3 w-3 text-green-600" />
          <span className="sr-only">Verified</span>
        </>
      )}
    </Badge>
  );
};