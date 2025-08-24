// Privacy-aware UX interaction tracking
import { log } from "./log";

type EventName =
  | "page_view" | "tab_change" | "ai_generate" | "ai_publish_draft"
  | "follow_toggle" | "like_toggle" | "comment_add"
  | "buy_click" | "tool_visit" | "event_visit"
  | "profile_view" | "artwork_view" | "search" | "sort_change"
  | "dev_seed_completed";

interface TrackingProps {
  [key: string]: unknown;
}

// Simple consent check - assumes consent object exists in localStorage
function getConsent() {
  try {
    const consent = localStorage.getItem("consent");
    return consent ? JSON.parse(consent) : null;
  } catch {
    return null;
  }
}

export function track(name: EventName, props: TrackingProps = {}) {
  // Check consent and Global Privacy Control
  const consent = getConsent();
  const gpc = (navigator as any).globalPrivacyControl === true;
  
  if (!consent?.analytics || gpc) {
    return; // No tracking without consent or if GPC enabled
  }

  // Keep payload minimal and anonymous
  const payload = {
    event: name,
    timestamp: Date.now(),
    url: window.location.pathname,
    ...props
  };

  // For now, log at info level (can be extended to send to analytics service)
  log.info("User interaction", { tracking: payload });

  // Future: send to analytics endpoint
  // fetch("/api/analytics", {
  //   method: "POST",
  //   headers: { "content-type": "application/json" },
  //   body: JSON.stringify(payload)
  // }).catch(() => {});
}

// Helper for page views
export function trackPageView(path: string, props?: TrackingProps) {
  track("page_view", { path, ...props });
}

// Helper for tab changes
export function trackTabChange(tab: string, context?: string) {
  track("tab_change", { tab, context });
}
