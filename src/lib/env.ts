// Environment configuration with Zod validation
import { z } from "zod";

const envSchema = z.object({
  VITE_API_URL: z.string().url().default("http://localhost:3000"),
  VITE_APP_NAME: z.string().default("Artisan"),
  VITE_APP_ENV: z.enum(["development", "staging", "production"]).default("development"),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse({
      VITE_API_URL: import.meta.env.VITE_API_URL,
      VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
      VITE_APP_ENV: import.meta.env.VITE_APP_ENV || import.meta.env.MODE,
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