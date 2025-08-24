import { log } from "./log";

export async function apiFetch(path: string, init?: RequestInit) {
  const requestId = Math.random().toString(36).slice(2, 10);
  const started = performance.now();
  
  try {
    const res = await fetch(path, {
      ...init,
      headers: { 
        ...(init?.headers || {}), 
        "x-request-id": requestId 
      },
    });
    
    const durationMs = Math.round(performance.now() - started);
    
    if (!res.ok) {
      log.error("request_failed", { requestId, route: path, status: res.status, durationMs });
      throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    }
    
    log.info("request_ok", { requestId, route: path, status: res.status, durationMs });
    return res;
  } catch (error) {
    const durationMs = Math.round(performance.now() - started);
    log.error("request_error", { requestId, route: path, durationMs, error: (error as Error).message });
    throw error;
  }
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  return res.json();
}