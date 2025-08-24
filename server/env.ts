import { z } from "zod";

const EnvSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1),
  DATABASE_PROVIDER: z.enum(["postgres", "sqlite"]).default("sqlite"),
  
  // Server
  PORT: z.string().transform(val => parseInt(val)).pipe(z.number().min(1000).max(65535)).default("8080"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  
  // CORS
  ORIGIN: z.string().url().default("http://localhost:5173"),
  
  // Rate limiting
  RATE_LIMIT_MAX: z.string().transform(val => parseInt(val)).pipe(z.number().min(1).max(10000)).default("200"),
  
  // Privacy & GDPR
  GDPR_DPO_EMAIL: z.string().email().default("dpo@artisan.app"),
  PRIVACY_CONTACT: z.string().email().default("privacy@artisan.app"),
  
  // Monitoring
  ENABLE_METRICS: z.string().transform(val => val === "true").default("true"),
  
  // Logging
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
  LOG_REDACT_EMAIL: z.string().transform(val => val === "true").default("true"),
  LOG_REDACT_IP: z.string().transform(val => val === "true").default("true"),
  
  // AI Features (from existing env.ts)
  AI_PROVIDER: z.enum(["openai", "stability", "local"]).default("local"),
  OPENAI_API_KEY: z.string().optional(),
  STABILITY_API_KEY: z.string().optional(),
  VECTOR_STORE: z.enum(["memory", "pgvector"]).default("memory"),
  AI_ENABLE_IMAGE: z.string().transform(val => val === "true").default("true"),
  AI_ENABLE_EMBED: z.string().transform(val => val === "true").default("true"),
});

type Env = z.infer<typeof EnvSchema>;

let env: Env;

export function getEnv(): Env {
  if (!env) {
    const result = EnvSchema.safeParse(process.env);
    
    if (!result.success) {
      console.error("❌ Invalid environment configuration:");
      console.error(result.error.format());
      process.exit(1);
    }
    
    env = result.data;
    
    // Validate database URL format
    if (env.DATABASE_PROVIDER === "sqlite" && !env.DATABASE_URL.startsWith("file:")) {
      console.error("❌ SQLite DATABASE_URL must start with 'file:'");
      process.exit(1);
    }
    
    if (env.DATABASE_PROVIDER === "postgres" && !env.DATABASE_URL.startsWith("postgres")) {
      console.error("❌ PostgreSQL DATABASE_URL must start with 'postgres' or 'postgresql'");
      process.exit(1);
    }
  }
  
  return env;
}

export { type Env };