import { log } from "./log";
import { resilientFetch, fetchMetrics } from "./fetchGuard";

export async function apiFetch(path: string, init?: RequestInit) {
  const requestId = Math.random().toString(36).slice(2, 10);
  const started = performance.now();
  
  fetchMetrics.recordRequest();
  
  try {
    const res = await resilientFetch(path, {
      ...init,
      headers: { 
        ...(init?.headers || {}), 
        "x-request-id": requestId 
      },
    });
    
    const durationMs = Math.round(performance.now() - started);
    
    if (!res.ok) {
      fetchMetrics.recordFailure();
      log.error("request_failed", { requestId, route: path, status: res.status, durationMs });
      throw new Error(await res.text());
    }
    
    log.info("request_ok", { requestId, route: path, status: res.status, durationMs });
    return res;
  } catch (error) {
    const durationMs = Math.round(performance.now() - started);
    
    if (error instanceof Error && error.message.includes('timeout')) {
      fetchMetrics.recordTimeout();
    } else if (error instanceof Error && error.message.includes('Circuit breaker')) {
      fetchMetrics.recordCircuitBreakerTrip();
    } else {
      fetchMetrics.recordFailure();
    }
    
    log.error("request_error", { requestId, route: path, durationMs, error: (error as Error).message });
    throw error;
  }
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, init);
  return res.json();
}

// Export metrics for monitoring
export { fetchMetrics };