import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  
  // Evolution API
  EVOLUTION_API_URL: z.string().url().default('http://localhost:8080'),
  EVOLUTION_API_KEY: z.string().min(1, 'EVOLUTION_API_KEY is required'),
  
  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  
  // Rate limiting
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000), // 1 minute
  
  // Session
  SESSION_MAX_AGE: z.coerce.number().default(604800), // 7 days in seconds
});

type EnvConfig = z.infer<typeof envSchema>;

function validateEnv(): EnvConfig {
  const parsed = envSchema.safeParse(process.env);
  
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    
    // In development, show warnings but don't crash
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Running with default/missing environment variables');
      return {
        DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/whatsapp_dashboard',
        JWT_SECRET: process.env.JWT_SECRET || 'development-secret-key-change-in-production-32chars',
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
        EVOLUTION_API_URL: process.env.EVOLUTION_API_URL || 'http://localhost:8080',
        EVOLUTION_API_KEY: process.env.EVOLUTION_API_KEY || 'B6D711FCDE4D4FD5936544120E713976',
        NODE_ENV: 'development',
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        RATE_LIMIT_MAX: 100,
        RATE_LIMIT_WINDOW_MS: 60000,
        SESSION_MAX_AGE: 604800,
      };
    }
    
    throw new Error('Invalid environment variables');
  }
  
  return parsed.data;
}

export const config = validateEnv();

// Type-safe config access
export const env = {
  isDev: config.NODE_ENV === 'development',
  isProd: config.NODE_ENV === 'production',
  isTest: config.NODE_ENV === 'test',
  
  database: {
    url: config.DATABASE_URL,
  },
  
  jwt: {
    secret: config.JWT_SECRET,
    expiresIn: config.JWT_EXPIRES_IN,
  },
  
  evolution: {
    url: config.EVOLUTION_API_URL,
    apiKey: config.EVOLUTION_API_KEY,
  },
  
  rateLimit: {
    max: config.RATE_LIMIT_MAX,
    windowMs: config.RATE_LIMIT_WINDOW_MS,
  },
  
  session: {
    maxAge: config.SESSION_MAX_AGE,
  },
  
  app: {
    url: config.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
};



