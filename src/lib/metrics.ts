import { env } from './env';
import { log } from './log';

// Lightweight metrics collection for production monitoring
class MetricsCollector {
  private counters = new Map<string, number>();
  private enabled = env.VITE_ENABLE_METRICS;

  increment(metric: string, value = 1) {
    if (!this.enabled) return;
    
    const current = this.counters.get(metric) || 0;
    this.counters.set(metric, current + value);
    
    log.debug('Metric incremented', { metric, value, total: current + value });
  }

  getCounters() {
    return Object.fromEntries(this.counters);
  }

  reset() {
    this.counters.clear();
  }

  // Export in Prometheus format
  exportPrometheus(): string {
    if (!this.enabled) return '';
    
    const lines: string[] = [];
    for (const [metric, value] of this.counters) {
      lines.push(`# TYPE artisan_${metric}_total counter`);
      lines.push(`artisan_${metric}_total ${value}`);
    }
    return lines.join('\n');
  }
}

export const metrics = new MetricsCollector();

// Pre-defined metrics for common actions
export const METRICS = {
  POSTS_CREATE: 'posts_create',
  COMMENTS_CREATE: 'comments_create', 
  FOLLOWS_TOGGLE: 'follows_toggle',
  ARTWORKS_UPLOAD: 'artworks_upload',
  PURCHASES_CREATE: 'purchases_create',
  DSAR_EXPORT: 'dsar_export',
  AUTH_SUCCESS: 'auth_success',
  AUTH_FAILURE: 'auth_failure',
  PAYMENTS_CHECKOUT_ARTWORK_CREATED: 'payments_checkout_artwork_created',
  PAYMENTS_CHECKOUT_SUBSCRIPTION_CREATED: 'payments_checkout_subscription_created',
  PAYMENTS_WEBHOOK_COMPLETED: 'payments_webhook_completed',
  PAYMENTS_WEBHOOK_FAILED: 'payments_webhook_failed',
} as const;