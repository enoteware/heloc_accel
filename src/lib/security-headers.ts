/**
 * Security headers middleware and utilities
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Security headers configuration
 */
export interface SecurityHeadersConfig {
  contentSecurityPolicy?: string;
  strictTransportSecurity?: string;
  xFrameOptions?: string;
  xContentTypeOptions?: string;
  referrerPolicy?: string;
  permissionsPolicy?: string;
  crossOriginEmbedderPolicy?: string;
  crossOriginOpenerPolicy?: string;
  crossOriginResourcePolicy?: string;
}

/**
 * Default security headers
 */
export const defaultSecurityHeaders: SecurityHeadersConfig = {
  // Content Security Policy - prevents XSS attacks
  contentSecurityPolicy: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.vercel.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),

  // Strict Transport Security - enforces HTTPS
  strictTransportSecurity: "max-age=31536000; includeSubDomains; preload",

  // X-Frame-Options - prevents clickjacking
  xFrameOptions: "DENY",

  // X-Content-Type-Options - prevents MIME sniffing
  xContentTypeOptions: "nosniff",

  // Referrer Policy - controls referrer information
  referrerPolicy: "strict-origin-when-cross-origin",

  // Permissions Policy - controls browser features
  permissionsPolicy: [
    "camera=()",
    "microphone=()",
    "geolocation=()",
    "interest-cohort=()",
  ].join(", "),

  // Cross-Origin Embedder Policy
  crossOriginEmbedderPolicy: "require-corp",

  // Cross-Origin Opener Policy
  crossOriginOpenerPolicy: "same-origin",

  // Cross-Origin Resource Policy
  crossOriginResourcePolicy: "same-origin",
};

/**
 * Development-friendly security headers (less restrictive)
 */
export const developmentSecurityHeaders: SecurityHeadersConfig = {
  contentSecurityPolicy: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "img-src 'self' data: https:",
    "connect-src 'self' ws: wss:",
    "frame-ancestors 'none'",
  ].join("; "),

  xFrameOptions: "DENY",
  xContentTypeOptions: "nosniff",
  referrerPolicy: "strict-origin-when-cross-origin",
};

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(
  response: NextResponse,
  config: SecurityHeadersConfig = defaultSecurityHeaders,
): NextResponse {
  // Only apply HSTS in production with HTTPS
  if (process.env.NODE_ENV === "production" && config.strictTransportSecurity) {
    response.headers.set(
      "Strict-Transport-Security",
      config.strictTransportSecurity,
    );
  }

  if (config.contentSecurityPolicy) {
    response.headers.set(
      "Content-Security-Policy",
      config.contentSecurityPolicy,
    );
  }

  if (config.xFrameOptions) {
    response.headers.set("X-Frame-Options", config.xFrameOptions);
  }

  if (config.xContentTypeOptions) {
    response.headers.set("X-Content-Type-Options", config.xContentTypeOptions);
  }

  if (config.referrerPolicy) {
    response.headers.set("Referrer-Policy", config.referrerPolicy);
  }

  if (config.permissionsPolicy) {
    response.headers.set("Permissions-Policy", config.permissionsPolicy);
  }

  if (config.crossOriginEmbedderPolicy) {
    response.headers.set(
      "Cross-Origin-Embedder-Policy",
      config.crossOriginEmbedderPolicy,
    );
  }

  if (config.crossOriginOpenerPolicy) {
    response.headers.set(
      "Cross-Origin-Opener-Policy",
      config.crossOriginOpenerPolicy,
    );
  }

  if (config.crossOriginResourcePolicy) {
    response.headers.set(
      "Cross-Origin-Resource-Policy",
      config.crossOriginResourcePolicy,
    );
  }

  // Additional security headers
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set("X-Download-Options", "noopen");
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");

  return response;
}

/**
 * CSRF protection utilities
 */
export class CSRFProtection {
  private static readonly CSRF_HEADER = "x-csrf-token";
  private static readonly CSRF_COOKIE = "csrf-token";

  /**
   * Generate CSRF token
   */
  static generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  }

  /**
   * Validate CSRF token
   */
  static validateToken(request: NextRequest, expectedToken: string): boolean {
    const headerToken = request.headers.get(this.CSRF_HEADER);
    const cookieToken = request.cookies.get(this.CSRF_COOKIE)?.value;

    if (!headerToken || !cookieToken) {
      return false;
    }

    return headerToken === expectedToken && cookieToken === expectedToken;
  }

  /**
   * Set CSRF token in response
   */
  static setToken(response: NextResponse, token: string): NextResponse {
    response.cookies.set(this.CSRF_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  }
}

/**
 * CORS configuration
 */
export interface CORSConfig {
  origin?: string | string[] | boolean;
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

/**
 * Apply CORS headers
 */
export function applyCORSHeaders(
  request: NextRequest,
  response: NextResponse,
  config: CORSConfig = {},
): NextResponse {
  const origin = request.headers.get("origin");

  // Handle origin
  if (config.origin === true) {
    response.headers.set("Access-Control-Allow-Origin", "*");
  } else if (typeof config.origin === "string") {
    response.headers.set("Access-Control-Allow-Origin", config.origin);
  } else if (
    Array.isArray(config.origin) &&
    origin &&
    config.origin.includes(origin)
  ) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  } else if (origin && process.env.NODE_ENV === "development") {
    // Allow localhost in development
    if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    }
  }

  // Handle methods
  if (config.methods) {
    response.headers.set(
      "Access-Control-Allow-Methods",
      config.methods.join(", "),
    );
  }

  // Handle headers
  if (config.allowedHeaders) {
    response.headers.set(
      "Access-Control-Allow-Headers",
      config.allowedHeaders.join(", "),
    );
  }

  // Handle credentials
  if (config.credentials) {
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  // Handle max age
  if (config.maxAge) {
    response.headers.set("Access-Control-Max-Age", config.maxAge.toString());
  }

  return response;
}

/**
 * Security middleware for API routes
 */
export function securityMiddleware(
  request: NextRequest,
  options: {
    requireCSRF?: boolean;
    corsConfig?: CORSConfig;
    securityHeaders?: SecurityHeadersConfig;
  } = {},
): NextResponse | null {
  // Handle preflight requests
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 200 });

    if (options.corsConfig) {
      applyCORSHeaders(request, response, options.corsConfig);
    }

    return response;
  }

  // CSRF protection for state-changing methods
  if (
    options.requireCSRF &&
    ["POST", "PUT", "DELETE", "PATCH"].includes(request.method)
  ) {
    const csrfToken = request.cookies.get(CSRFProtection["CSRF_COOKIE"])?.value;

    if (!csrfToken || !CSRFProtection.validateToken(request, csrfToken)) {
      return new NextResponse(
        JSON.stringify({ success: false, error: "Invalid CSRF token" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }

  return null; // Continue processing
}

/**
 * Content Security Policy nonce generator
 */
export function generateCSPNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, Array.from(array)));
}

/**
 * Secure cookie options
 */
export function getSecureCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
  };
}

/**
 * Validate request origin
 */
export function validateOrigin(
  request: NextRequest,
  allowedOrigins: string[],
): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  if (!origin && !referer) {
    return false;
  }

  const requestOrigin = origin || new URL(referer!).origin;

  return (
    allowedOrigins.includes(requestOrigin) ||
    (process.env.NODE_ENV === "development" &&
      requestOrigin.includes("localhost"))
  );
}

/**
 * IP whitelist validation
 */
export function validateIPWhitelist(
  request: NextRequest,
  whitelist: string[],
): boolean {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0] || realIp || "unknown";

  return whitelist.includes(ip);
}
