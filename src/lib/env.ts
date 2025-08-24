// Environment configuration with Zod validation
import { z } from "zod";

const envSchema = z.object({
  VITE_API_URL: z.string().url().default("http://localhost:3000"),
  VITE_APP_NAME: z.string().default("Artisan"),
  VITE_APP_ENV: z.enum(["development", "staging", "production", "test"]).default("development"),
  VITE_AI_PROVIDER: z.enum(["openai", "stability", "local"]).default("local"),
  VITE_AI_ENABLE_IMAGE: z.string().transform(val => val === "true").default("true"),
  VITE_AI_ENABLE_EMBED: z.string().transform(val => val === "true").default("true"),
  VITE_DATA_BACKEND: z.enum(['supabase', 'api']).default('supabase'),
  VITE_ENABLE_E2E: z.string().transform(val => val === "true").default("false"),
  VITE_ENABLE_METRICS: z.string().transform(val => val !== "false").default("true"),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse({
      VITE_API_URL: import.meta.env.VITE_API_URL,
      VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
      VITE_APP_ENV: import.meta.env.VITE_APP_ENV || import.meta.env.MODE,
      VITE_AI_PROVIDER: import.meta.env.VITE_AI_PROVIDER,
      VITE_AI_ENABLE_IMAGE: import.meta.env.VITE_AI_ENABLE_IMAGE,
      VITE_AI_ENABLE_EMBED: import.meta.env.VITE_AI_ENABLE_EMBED,
      VITE_DATA_BACKEND: import.meta.env.VITE_DATA_BACKEND,
      VITE_ENABLE_E2E: import.meta.env.VITE_ENABLE_E2E,
      VITE_ENABLE_METRICS: import.meta.env.VITE_ENABLE_METRICS,
    });
  } catch (error) {
    console.error("❌ Invalid environment configuration:", error);
    throw new Error("Invalid environment configuration");
  }
};

export const env = parseEnv();

export const isDevelopment = env.VITE_APP_ENV === "development";
export const isProduction = env.VITE_APP_ENV === "production";
export const isStaging = env.VITE_APP_ENV === "staging";
export const isTest = env.VITE_APP_ENV === "test" || import.meta.env.MODE === "test";