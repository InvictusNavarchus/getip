/**
 * Environment bindings for the Worker
 */
interface Env {
  IP_RATE_LIMITER: RateLimit;
}

/**
 * Response structure for IP address API
 */
interface IpResponse {
  ip: string | null;
  timestamp: string;
}

/**
 * Error response structure
 */
interface ErrorResponse {
  error: string;
  timestamp: string;
}

/**
 * Extracts the client IP address from the request
 * 
 * In Cloudflare Workers, the client IP is available through:
 * 1. CF-Connecting-IP header (most reliable)
 * 2. X-Real-IP header (fallback)
 * 3. X-Forwarded-For header (last resort)
 * 
 * @param request - The incoming Request object
 * @returns The client IP address or null if not found
 */
function getClientIp(request: Request): string | null {
  // CF-Connecting-IP is the most reliable header set by Cloudflare
  const cfConnectingIp = request.headers.get('CF-Connecting-IP');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback to X-Real-IP
  const xRealIp = request.headers.get('X-Real-IP');
  if (xRealIp) {
    return xRealIp;
  }

  // Last resort: X-Forwarded-For (take the first IP in the list)
  const xForwardedFor = request.headers.get('X-Forwarded-For');
  if (xForwardedFor) {
    const ips = xForwardedFor.split(',').map(ip => ip.trim());
    return ips[0] ?? null;
  }

  return null;
}

/**
 * Creates a JSON response with appropriate headers
 * 
 * @param data - The data to serialize as JSON
 * @param status - HTTP status code
 * @returns Response object
 */
function createJsonResponse(
  data: IpResponse | ErrorResponse,
  status: number = 200
): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}

/**
 * Handles OPTIONS requests for CORS preflight
 */
function handleOptions(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

/**
 * Main fetch handler for the Worker
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    // Only allow GET requests to root path
    if (request.method !== 'GET') {
      const errorResponse: ErrorResponse = {
        error: 'Method not allowed. Only GET requests are supported.',
        timestamp: new Date().toISOString(),
      };
      return createJsonResponse(errorResponse, 405);
    }

    // Only respond to root path
    if (url.pathname !== '/') {
      const errorResponse: ErrorResponse = {
        error: 'Not found. Only root path (/) is available.',
        timestamp: new Date().toISOString(),
      };
      return createJsonResponse(errorResponse, 404);
    }

    // Extract the client IP
    const ip = getClientIp(request);
    
    // Apply rate limiting based on IP address
    // Limit: 60 requests per minute per IP per Cloudflare location
    if (ip) {
      const { success } = await env.IP_RATE_LIMITER.limit({ key: ip });
      if (!success) {
        const errorResponse: ErrorResponse = {
          error: 'Rate limit exceeded. Maximum 60 requests per minute allowed.',
          timestamp: new Date().toISOString(),
        };
        return new Response(JSON.stringify(errorResponse, null, 2), {
          status: 429,
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            'Retry-After': '60',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    // Return the client IP
    const response: IpResponse = {
      ip,
      timestamp: new Date().toISOString(),
    };

    return createJsonResponse(response);
  },
} satisfies ExportedHandler<Env>;
