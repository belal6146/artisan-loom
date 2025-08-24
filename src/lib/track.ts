// Privacy-aware UX interaction tracking
import { log } from "./log";

export function track(event: string, props: Record<string, unknown> = {}) {
  // Check consent and GPC
  const hasConsent = getAnalyticsConsent();
  const gpcDenied = (navigator as any)?.globalPrivacyControl === true;
  
  if (!hasConsent || gpcDenied) return;
  
  // Sample to 30% to avoid overwhelming
  if (Math.random() > 0.3) return;
  
  // Log the event
  log.info("user_action", { event, ...props });
  
  // In dev, also console.log for debugging
  if (import.meta.env.DEV) {
    console.log(`🔍 Track: ${event}`, props);
  }
}

function getAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const consent = localStorage.getItem('consent');
    const consentData = consent ? JSON.parse(consent) : null;
    return consentData?.analytics === true;
  } catch {
    return false;
  }
}

// Common tracking helpers
export const trackAction = {
  like: (contentId: string, contentType: string) => 
    track('content_like', { contentId, contentType }),
  
  follow: (targetUserId: string) => 
    track('user_follow', { targetUserId }),
  
  purchase: (artworkId: string, amount: number, currency: string) => 
    track('artwork_purchase', { artworkId, amount, currency }),
  
  generate: (provider: string, style: string, promptLength: number) => 
    track('ai_generate', { provider, style, promptLength }),
  
  view: (contentId: string, contentType: string) => 
    track('content_view', { contentId, contentType }),
  
  search: (query: string, resultCount: number) => 
    track('search', { query: query.slice(0, 100), resultCount }),
};

// Helper for page views
export function trackPageView(path: string, props?: Record<string, unknown>) {
  track('page_view', { path, ...props });
}

// Helper for tab changes
export function trackTabChange(tab: string, context?: string) {
  track('tab_change', { tab, context });
}