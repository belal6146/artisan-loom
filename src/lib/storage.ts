// localStorage adapter with error handling
import { log } from "./log";

export interface StorageAdapter {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}

class LocalStorageAdapter implements StorageAdapter {
  private isAvailable(): boolean {
    try {
      const testKey = "__storage_test__";
      localStorage.setItem(testKey, "test");
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  get<T>(key: string): T | null {
    if (!this.isAvailable()) {
      log.warn("localStorage not available");
      return null;
    }

    try {
      const item = localStorage.getItem(key);
      if (item === null) return null;
      return JSON.parse(item) as T;
    } catch (error) {
      log.error("Failed to get item from localStorage", { key, error: error.message });
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    if (!this.isAvailable()) {
      log.warn("localStorage not available, cannot set item", { key });
      return;
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      log.error("Failed to set item in localStorage", { key, error: error.message });
    }
  }

  remove(key: string): void {
    if (!this.isAvailable()) {
      log.warn("localStorage not available, cannot remove item", { key });
      return;
    }

    try {
      localStorage.removeItem(key);
    } catch (error) {
      log.error("Failed to remove item from localStorage", { key, error: error.message });
    }
  }

  clear(): void {
    if (!this.isAvailable()) {
      log.warn("localStorage not available, cannot clear");
      return;
    }

    try {
      localStorage.clear();
    } catch (error) {
      log.error("Failed to clear localStorage", { error: error.message });
    }
  }
}

// In-memory fallback for SSR or when localStorage is unavailable
class MemoryStorageAdapter implements StorageAdapter {
  private storage = new Map<string, unknown>();

  get<T>(key: string): T | null {
    const value = this.storage.get(key);
    return value !== undefined ? (value as T) : null;
  }

  set<T>(key: string, value: T): void {
    this.storage.set(key, value);
  }

  remove(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }
}

// Create storage instance
const createStorage = (): StorageAdapter => {
  if (typeof window !== "undefined") {
    return new LocalStorageAdapter();
  }
  return new MemoryStorageAdapter();
};

export const storage = createStorage();

// Convenience methods with type safety
export const getStoredItem = <T>(key: string, defaultValue?: T): T | null => {
  const value = storage.get<T>(key);
  return value !== null ? value : defaultValue ?? null;
};

export const setStoredItem = <T>(key: string, value: T): void => {
  storage.set(key, value);
};

export const removeStoredItem = (key: string): void => {
  storage.remove(key);
};

export const clearStorage = (): void => {
  storage.clear();
};

// Storage keys constants
export const STORAGE_KEYS = {
  AUTH_TOKEN: "artisan_auth_token",
  USER_PREFERENCES: "artisan_user_preferences",
  THEME: "artisan_theme",
} as const;