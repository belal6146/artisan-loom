// Bank-grade fetch wrapper with SLOs and resilience patterns
interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  baseDelay?: number;
  circuitBreaker?: boolean;
}

interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

class CircuitBreaker {
  private state: CircuitBreakerState = {
    failures: 0,
    lastFailure: 0,
    state: 'CLOSED'
  };
  
  private readonly failureThreshold = 5;
  private readonly recoveryTimeout = 30000; // 30s
  
  canExecute(): boolean {
    if (this.state.state === 'OPEN') {
      if (Date.now() - this.state.lastFailure > this.recoveryTimeout) {
        this.state.state = 'HALF_OPEN';
        return true;
      }
      return false;
    }
    return true;
  }
  
  onSuccess(): void {
    this.state.failures = 0;
    this.state.state = 'CLOSED';
  }
  
  onFailure(): void {
    this.state.failures++;
    this.state.lastFailure = Date.now();
    
    if (this.state.failures >= this.failureThreshold) {
      this.state.state = 'OPEN';
    }
  }
}

const circuitBreakers = new Map<string, CircuitBreaker>();

export async function resilientFetch(
  url: string, 
  options: FetchOptions = {}
): Promise<Response> {
  const {
    timeout = 10000,
    retries = 2,
    baseDelay = 300,
    circuitBreaker = true,
    ...fetchOptions
  } = options;
  
  // Circuit breaker per domain
  const domain = new URL(url).hostname;
  const breaker = circuitBreakers.get(domain) || new CircuitBreaker();
  circuitBreakers.set(domain, breaker);
  
  if (!breaker.canExecute()) {
    throw new Error(`Circuit breaker OPEN for ${domain}`);
  }
  
  let lastError: Error;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        breaker.onSuccess();
        return response;
      }
      
      // Don't retry 4xx errors
      if (response.status >= 400 && response.status < 500) {
        breaker.onSuccess(); // Client errors don't count as circuit breaker failures
        return response;
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
    } catch (error) {
      lastError = error as Error;
      
      if (error instanceof Error && error.name === 'AbortError') {
        lastError = new Error(`Request timeout after ${timeout}ms`);
      }
      
      // Don't retry on last attempt
      if (attempt === retries) {
        breaker.onFailure();
        throw lastError;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + (Math.random() * 0.3 - 0.15) * baseDelay;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  breaker.onFailure();
  throw lastError!;
}

// SLO monitoring
export const fetchMetrics = {
  requests: 0,
  failures: 0,
  timeouts: 0,
  circuitBreakerTrips: 0,
  
  recordRequest() { this.requests++; },
  recordFailure() { this.failures++; },
  recordTimeout() { this.timeouts++; },
  recordCircuitBreakerTrip() { this.circuitBreakerTrips++; },
  
  getSLOs() {
    const total = this.requests || 1;
    return {
      errorRate: (this.failures / total) * 100,
      timeoutRate: (this.timeouts / total) * 100,
      circuitBreakerTripRate: (this.circuitBreakerTrips / total) * 100,
      availability: ((total - this.failures) / total) * 100
    };
  }
};
