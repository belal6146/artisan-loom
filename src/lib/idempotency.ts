// Bank-grade idempotency system for critical operations
interface IdempotencyKey {
  userId: string;
  operation: string;
  payloadHash: string;
  timestamp: number;
}

interface IdempotencyStore {
  get(key: string): Promise<IdempotencyKey | null>;
  set(key: string, value: IdempotencyKey, ttl: number): Promise<void>;
  delete(key: string): Promise<void>;
}

// In-memory store for development (replace with Redis/DB in production)
class MemoryIdempotencyStore implements IdempotencyStore {
  private store = new Map<string, { value: IdempotencyKey; expires: number }>();
  
  async get(key: string): Promise<IdempotencyKey | null> {
    const item = this.store.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.store.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  async set(key: string, value: IdempotencyKey, ttl: number): Promise<void> {
    this.store.set(key, {
      value,
      expires: Date.now() + ttl
    });
  }
  
  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
  
  // Cleanup expired keys
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.store.entries()) {
      if (now > item.expires) {
        this.store.delete(key);
      }
    }
  }
}

// Hash function for payload consistency
function hashPayload(payload: unknown): string {
  const str = JSON.stringify(payload, Object.keys(payload as Record<string, unknown>).sort());
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

// Generate idempotency key
export function generateIdempotencyKey(
  userId: string, 
  operation: string, 
  payload: unknown
): string {
  const payloadHash = hashPayload(payload);
  return `${userId}:${operation}:${payloadHash}`;
}

// Idempotency store instance
const idempotencyStore = new MemoryIdempotencyStore();

// Cleanup expired keys every 5 minutes
setInterval(() => idempotencyStore.cleanup(), 5 * 60 * 1000);

// Idempotency decorator for functions
export function withIdempotency<T extends unknown[], R>(
  operation: string,
  ttl: number = 15 * 60 * 1000 // 15 minutes default
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: T): Promise<R> {
      const userId = this.userId || args[0]?.userId || 'anonymous';
      const payload = args[0] || {};
      
      const key = generateIdempotencyKey(userId, operation, payload);
      
      // Check for existing operation
      const existing = await idempotencyStore.get(key);
      if (existing) {
        // Return cached result or throw duplicate error
        throw new Error(`Duplicate operation detected. Operation '${operation}' was already performed.`);
      }
      
      // Store idempotency key
      const idempotencyKey: IdempotencyKey = {
        userId,
        operation,
        payloadHash: hashPayload(payload),
        timestamp: Date.now()
      };
      
      await idempotencyStore.set(key, idempotencyKey, ttl);
      
      try {
        // Execute the operation
        const result = await originalMethod.apply(this, args);
        
        // Store result for future duplicate requests (optional)
        // await idempotencyStore.set(`${key}:result`, result, ttl);
        
        return result;
      } catch (error) {
        // Remove idempotency key on failure to allow retry
        await idempotencyStore.delete(key);
        throw error;
      }
    };
    
    return descriptor;
  };
}

// Higher-order function for async operations
export function idempotent<T extends unknown[], R>(
  operation: string,
  fn: (...args: T) => Promise<R>,
  ttl: number = 15 * 60 * 1000
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    const userId = args[0]?.userId || 'anonymous';
    const payload = args[0] || {};
    
    const key = generateIdempotencyKey(userId, operation, payload);
    
    // Check for existing operation
    const existing = await idempotencyStore.get(key);
    if (existing) {
      throw new Error(`Duplicate operation detected. Operation '${operation}' was already performed.`);
    }
    
    // Store idempotency key
    const idempotencyKey: IdempotencyKey = {
      userId,
      operation,
      payloadHash: hashPayload(payload),
      timestamp: Date.now()
    };
    
    await idempotencyStore.set(key, idempotencyKey, ttl);
    
    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      // Remove idempotency key on failure to allow retry
      await idempotencyStore.delete(key);
      throw error;
    }
  };
}

// Export store for testing and monitoring
export { idempotencyStore, type IdempotencyStore, type IdempotencyKey };
