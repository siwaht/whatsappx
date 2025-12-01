import { NextRequest, NextResponse } from 'next/server';
import { db } from './db';
import { RateLimitError } from './errors';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const defaultConfig: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
};

// In-memory store for development (use Redis in production)
const memoryStore = new Map<string, { count: number; windowStart: number }>();

export async function checkRateLimit(
  request: NextRequest,
  config: Partial<RateLimitConfig> = {}
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const { maxRequests, windowMs } = { ...defaultConfig, ...config };
  
  // Get client identifier (IP address or user ID from token)
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
             request.headers.get('x-real-ip') || 
             'unknown';
  const key = `rate_limit:${ip}`;
  
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Use in-memory store for development, database for production
  if (process.env.NODE_ENV === 'development') {
    return checkMemoryRateLimit(key, maxRequests, windowMs, now);
  }
  
  return checkDatabaseRateLimit(key, maxRequests, windowStart, now);
}

function checkMemoryRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
  now: number
): { allowed: boolean; remaining: number; reset: number } {
  const entry = memoryStore.get(key);
  
  if (!entry || now - entry.windowStart > windowMs) {
    // Start new window
    memoryStore.set(key, { count: 1, windowStart: now });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      reset: Math.ceil((now + windowMs) / 1000),
    };
  }
  
  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      reset: Math.ceil((entry.windowStart + windowMs) / 1000),
    };
  }
  
  entry.count++;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    reset: Math.ceil((entry.windowStart + windowMs) / 1000),
  };
}

async function checkDatabaseRateLimit(
  key: string,
  maxRequests: number,
  windowStart: number,
  now: number
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  try {
    // Find or create rate limit entry
    const entry = await db.rateLimitEntry.findUnique({
      where: { key },
    });
    
    if (!entry || entry.windowStart.getTime() < windowStart) {
      // Start new window
      await db.rateLimitEntry.upsert({
        where: { key },
        update: { count: 1, windowStart: new Date(now) },
        create: { key, count: 1, windowStart: new Date(now) },
      });
      
      return {
        allowed: true,
        remaining: maxRequests - 1,
        reset: Math.ceil((now + (now - windowStart)) / 1000),
      };
    }
    
    if (entry.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        reset: Math.ceil(entry.windowStart.getTime() / 1000) + 60,
      };
    }
    
    // Increment count
    await db.rateLimitEntry.update({
      where: { key },
      data: { count: { increment: 1 } },
    });
    
    return {
      allowed: true,
      remaining: maxRequests - entry.count - 1,
      reset: Math.ceil(entry.windowStart.getTime() / 1000) + 60,
    };
  } catch (error) {
    // On error, allow the request (fail open)
    console.error('Rate limit check failed:', error);
    return {
      allowed: true,
      remaining: maxRequests,
      reset: Math.ceil(now / 1000) + 60,
    };
  }
}

export async function rateLimit(
  request: NextRequest,
  config?: Partial<RateLimitConfig>
): Promise<NextResponse | null> {
  const result = await checkRateLimit(request, config);
  
  if (!result.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Too many requests. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
        },
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': result.reset.toString(),
          'Retry-After': Math.ceil((result.reset * 1000 - Date.now()) / 1000).toString(),
        },
      }
    );
  }
  
  return null;
}

// Stricter rate limit for auth endpoints
export const authRateLimitConfig: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 60 * 1000, // 5 attempts per minute
};

// Standard API rate limit
export const apiRateLimitConfig: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 60 * 1000, // 100 requests per minute
};



