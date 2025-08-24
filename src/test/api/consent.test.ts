import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  detectGPC, 
  getAnalyticsMode, 
  hasConsent, 
  setStoredConsent 
} from '@/lib/privacy';

// Mock navigator and document
Object.defineProperty(window, 'navigator', {
  value: {
    globalPrivacyControl: false,
  },
  writable: true,
});

Object.defineProperty(document, 'cookie', {
  value: '',
  writable: true,
});

describe('GDPR Consent & GPC Tests', () => {
  beforeEach(() => {
    // Reset cookies
    document.cookie = '';
    // Reset GPC signal
    (window.navigator as { globalPrivacyControl: boolean }).globalPrivacyControl = false;
  });

  it('should detect GPC signal when present', () => {
    (window.navigator as { globalPrivacyControl: boolean }).globalPrivacyControl = true;
    
    const gpcDetected = detectGPC();
    expect(gpcDetected).toBe(true);
  });

  it('should respect GPC signal and deny analytics', () => {
    (window.navigator as { globalPrivacyControl: boolean }).globalPrivacyControl = true;
    
    const analyticsMode = getAnalyticsMode();
    expect(analyticsMode).toBe('essential');
  });

  it('should block analytics when consent is false', () => {
    setStoredConsent({ analytics: false });
    
    const hasAnalyticsConsent = hasConsent('analytics');
    expect(hasAnalyticsConsent).toBe(false);
  });

  it('should allow analytics when consent is true and no GPC', () => {
    (window.navigator as { globalPrivacyControl: boolean }).globalPrivacyControl = false;
    setStoredConsent({ analytics: true });
    
    const hasAnalyticsConsent = hasConsent('analytics');
    expect(hasAnalyticsConsent).toBe(true);
  });

  it('should override consent when GPC is detected', () => {
    (window.navigator as { globalPrivacyControl: boolean }).globalPrivacyControl = true;
    setStoredConsent({ analytics: true, marketing: true });
    
    // Even with consent=true, GPC should override
    expect(hasConsent('analytics')).toBe(false);
    expect(hasConsent('marketing')).toBe(false);
    expect(hasConsent('essential')).toBe(true); // Essential always allowed
  });

  it('should handle analytics mode correctly', () => {
    // No consent, no GPC = disabled
    expect(getAnalyticsMode()).toBe('disabled');
    
    // With consent, no GPC = full
    setStoredConsent({ analytics: true });
    (window.navigator as { globalPrivacyControl: boolean }).globalPrivacyControl = false;
    expect(getAnalyticsMode()).toBe('full');
    
    // With GPC = essential only
    (window.navigator as { globalPrivacyControl: boolean }).globalPrivacyControl = true;
    expect(getAnalyticsMode()).toBe('essential');
  });
});