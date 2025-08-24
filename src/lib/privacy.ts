// Client-side privacy utilities and GPC detection
import { apiClient } from "@/lib/api-client";
import { log } from "@/lib/log";

export interface ConsentState {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  aiFeatures: boolean;
  gpcDetected: boolean;
  timestamp: string;
}

const CONSENT_COOKIE_NAME = "artisan_consent";
const CONSENT_VERSION = "1.0";

// Global Privacy Control (GPC) Detection
export function detectGPC(): boolean {
  // Check HTTP header (server-side detection)
  // Check DOM API (client-side detection)
  if (typeof window !== "undefined") {
    // @ts-expect-error - GPC is not in TypeScript types yet
    const gpcSignal = navigator.globalPrivacyControl;
    if (typeof gpcSignal === "boolean") {
      return gpcSignal;
    }
    
    // Check Sec-GPC header via document (some browsers expose it)
    const gpcHeader = document.querySelector('meta[http-equiv="Sec-GPC"]');
    if (gpcHeader) {
      return gpcHeader.getAttribute("content") === "1";
    }
  }
  
  return false;
}

// CNIL-style analytics mode detection
export function getAnalyticsMode(): "essential" | "full" | "disabled" {
  const consent = getStoredConsent();
  const gpcActive = detectGPC();
  
  if (gpcActive || (consent && !consent.analytics)) {
    return "essential"; // CNIL-exempt mode: no cross-site tracking, IP truncation
  }
  
  if (consent?.analytics) {
    return "full"; // Full analytics with consent
  }
  
  return "disabled"; // No analytics at all
}

// Consent Management
export function getStoredConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  
  try {
    const cookie = document.cookie
      .split("; ")
      .find(row => row.startsWith(`${CONSENT_COOKIE_NAME}=`));
    
    if (!cookie) return null;
    
    const value = cookie.split("=")[1];
    if (!value) return null;
    
    const decoded = decodeURIComponent(value);
    const consent = JSON.parse(decoded) as ConsentState;
    
    // Validate consent structure
    if (typeof consent.essential !== "boolean") return null;
    
    return consent;
  } catch (error) {
    log.warn("Failed to parse consent cookie", { error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

export function setStoredConsent(consent: Partial<ConsentState>): void {
  const currentConsent = getStoredConsent();
  const gpcDetected = detectGPC();
  
  const newConsent: ConsentState = {
    essential: true, // Always required
    analytics: gpcDetected ? false : (consent.analytics ?? false),
    marketing: gpcDetected ? false : (consent.marketing ?? false),
    aiFeatures: consent.aiFeatures ?? currentConsent?.aiFeatures ?? false,
    gpcDetected,
    timestamp: new Date().toISOString(),
  };
  
  // Set cookie (1 year expiry)
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  
  const cookieValue = encodeURIComponent(JSON.stringify(newConsent));
  document.cookie = `${CONSENT_COOKIE_NAME}=${cookieValue}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`;
  
  // Skip server call in test environment to avoid network errors
  if (process.env.NODE_ENV !== 'test') {
    try {
      apiClient.post("/api/privacy/consent", newConsent);
    } catch (error) {
      log.error("Failed to store consent server-side", { error: error instanceof Error ? error.message : String(error) });
    }
  }
  
  log.info("Consent updated", { 
    analytics: newConsent.analytics, 
    marketing: newConsent.marketing,
    gpcDetected: newConsent.gpcDetected 
  });
}

export function hasConsent(type: keyof ConsentState): boolean {
  const consent = getStoredConsent();
  if (!consent) return false;
  
  // Essential is always true
  if (type === "essential") return true;
  
  // GPC overrides consent for tracking purposes
  if (consent.gpcDetected && (type === "analytics" || type === "marketing")) {
    return false;
  }
  
  const value = consent[type];
  return typeof value === "boolean" ? value : false;
}

export function needsConsentBanner(): boolean {
  const consent = getStoredConsent();
  if (!consent) return true;
  
  // Check if consent is recent (within 1 year)
  const consentDate = new Date(consent.timestamp);
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  return consentDate < oneYearAgo;
}

// Analytics Integration Points
export function shouldLoadAnalytics(): boolean {
  const mode = getAnalyticsMode();
  return mode === "essential" || mode === "full";
}

export function getAnalyticsConfig() {
  const mode = getAnalyticsMode();
  
  if (mode === "essential") {
    // CNIL-exempt configuration
    return {
      anonymizeIP: true,
      allowAdFeatures: false,
      allowAdersonalizationSignals: false,
      cookieExpires: 60 * 60 * 24 * 30, // 30 days max
      siteSpeedSampleRate: 1,
    };
  }
  
  if (mode === "full") {
    return {
      anonymizeIP: false,
      allowAdFeatures: true,
      allowAdPersonalizationSignals: true,
      cookieExpires: 60 * 60 * 24 * 365 * 2, // 2 years
      siteSpeedSampleRate: 1,
    };
  }
  
  return null; // No analytics
}

// DSAR Helper Functions
export async function requestDataExport(): Promise<{ jobId: string }> {
  return apiClient.post("/api/privacy/export", {});
}

export async function requestDataDeletion(reason?: string): Promise<void> {
  return apiClient.post("/api/privacy/delete", { reason });
}

export async function updateUserData(data: Record<string, unknown>): Promise<void> {
  return apiClient.post("/api/privacy/rectify", data);
}

export async function restrictProcessing(): Promise<void> {
  return apiClient.post("/api/privacy/restrict", {});
}