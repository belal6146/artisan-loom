// Link safety checking utilities
import { z } from 'zod';

export interface SafetyResult {
  ok: boolean;
  verdict: 'ok' | 'suspicious' | 'blocked';
  domain: string;
  reasons: string[];
}

const cache = new Map<string, { result: SafetyResult; timestamp: number }>();
const CACHE_TTL = parseInt(process.env.EXPERIENCE_CACHE_TTL_MS || '900000'); // 15 min

export async function safetyCheck(url: string, allowedDomains?: string[]): Promise<SafetyResult> {
  // Check cache first
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }

  const result = await performSafetyCheck(url, allowedDomains);
  
  // Cache result
  cache.set(url, { result, timestamp: Date.now() });
  
  return result;
}

async function performSafetyCheck(url: string, allowedDomains?: string[]): Promise<SafetyResult> {
  const reasons: string[] = [];
  
  try {
    // Basic URL validation
    const parsed = new URL(url);
    const domain = parsed.hostname.toLowerCase();
    
    // Must be HTTPS
    if (parsed.protocol !== 'https:') {
      reasons.push('Non-HTTPS protocol');
      return { ok: false, verdict: 'blocked', domain, reasons };
    }
    
    // Block dangerous protocols
    if (url.startsWith('data:') || url.startsWith('javascript:')) {
      reasons.push('Dangerous protocol');
      return { ok: false, verdict: 'blocked', domain, reasons };
    }
    
    // Block IP literals
    if (/^\d+\.\d+\.\d+\.\d+$/.test(domain) || domain.includes(':')) {
      reasons.push('IP literal not allowed');
      return { ok: false, verdict: 'blocked', domain, reasons };
    }
    
    // Check domain allowlist for marketplace
    if (allowedDomains && !allowedDomains.includes(domain)) {
      reasons.push('Domain not in allowlist');
      return { ok: false, verdict: 'blocked', domain, reasons };
    }
    
    // Basic connectivity check (HEAD request with timeout)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'Artisan-Safety-Check/1.0',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (response.status >= 200 && response.status < 400) {
        return { ok: true, verdict: 'ok', domain, reasons: [] };
      } else {
        reasons.push(`HTTP ${response.status}`);
        return { ok: false, verdict: 'suspicious', domain, reasons };
      }
      
    } catch (error) {
      reasons.push('Connection failed');
      return { ok: false, verdict: 'suspicious', domain, reasons };
    }
    
  } catch (error) {
    reasons.push('Invalid URL format');
    return { ok: false, verdict: 'blocked', domain: '', reasons };
  }
}

// Clear expired cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
}, CACHE_TTL);

export function clearSafetyCache(): void {
  cache.clear();
}