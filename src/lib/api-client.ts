// Type-safe API client with error handling
import { z } from "zod";
import { env } from "./env";
import { log } from "./log";
import { APIErrorSchema } from "@/schemas";

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: string
  ) {
    super(message);
    this.name = "APIError";
  }
}

interface RequestConfig {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: unknown;
}

class APIClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = env.VITE_API_URL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  setAuthToken(token: string): void {
    this.defaultHeaders.Authorization = `Bearer ${token}`;
  }

  clearAuthToken(): void {
    delete this.defaultHeaders.Authorization;
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {},
    responseSchema?: z.ZodSchema<T>
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const { method = "GET", headers = {}, body } = config;

    const requestHeaders = {
      ...this.defaultHeaders,
      ...headers,
    };

    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && method !== "GET") {
      requestConfig.body = JSON.stringify(body);
    }

    log.debug("API Request", { method, url, headers: requestHeaders });

    try {
      const response = await fetch(url, requestConfig);
      const responseData = await response.json();

      if (!response.ok) {
        // Try to parse error response
        const errorResult = APIErrorSchema.safeParse(responseData);
        const errorMessage = errorResult.success
          ? errorResult.data.error
          : "An unexpected error occurred";
        const errorDetails = errorResult.success
          ? errorResult.data.details
          : undefined;

        throw new APIError(errorMessage, response.status, errorDetails);
      }

      // Validate response if schema provided
      if (responseSchema) {
        const validationResult = responseSchema.safeParse(responseData);
        if (!validationResult.success) {
          log.error("API Response validation failed", {
            endpoint,
            errors: validationResult.error.errors,
          });
          throw new Error("Invalid response format");
        }
        return validationResult.data;
      }

      return responseData;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }

      log.error("API Request failed", { endpoint, error: error.message });
      throw new Error("Network error occurred");
    }
  }

  async get<T>(endpoint: string, responseSchema?: z.ZodSchema<T>): Promise<T> {
    return this.request(endpoint, { method: "GET" }, responseSchema);
  }

  async post<T>(
    endpoint: string,
    body: unknown,
    responseSchema?: z.ZodSchema<T>
  ): Promise<T> {
    return this.request(endpoint, { method: "POST", body }, responseSchema);
  }

  async put<T>(
    endpoint: string,
    body: unknown,
    responseSchema?: z.ZodSchema<T>
  ): Promise<T> {
    return this.request(endpoint, { method: "PUT", body }, responseSchema);
  }

  async patch<T>(
    endpoint: string,
    body: unknown,
    responseSchema?: z.ZodSchema<T>
  ): Promise<T> {
    return this.request(endpoint, { method: "PATCH", body }, responseSchema);
  }

  async delete<T>(endpoint: string, responseSchema?: z.ZodSchema<T>): Promise<T> {
    return this.request(endpoint, { method: "DELETE" }, responseSchema);
  }
}

export const apiClient = new APIClient();