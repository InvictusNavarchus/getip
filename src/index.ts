import { getClientIp, getCountry, getCity, getRegion, getAllHeaders } from "./http/getHeaders";
import { 
  handleOptions, 
  createRateLimitResponse, 
  createIpSuccessResponse,
  createMethodNotAllowedResponse,
  createNotFoundResponse,
  createDebugResponse
} from "./http/createResponse";
import { Env } from "./types/env";

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

    // Only allow GET requests
    if (request.method !== 'GET') {
      return createMethodNotAllowedResponse();
    }

    // Handle /debug endpoint - returns all headers and CF metadata
    if (url.pathname === '/debug') {
      const allHeaders = getAllHeaders(request);
      return createDebugResponse(allHeaders, request.cf);
    }

    // Only respond to root path for IP lookup
    if (url.pathname !== '/') {
      return createNotFoundResponse();
    }

    // Extract the client IP and location information
    const ip = getClientIp(request);
    const country = getCountry(request);
    // city and region requires enabling `Add visitor location headers` in Cloudflare Managed Transforms
    const city = getCity(request);
    const region = getRegion(request);
    
    // Apply rate limiting based on IP address
    // Limit: 60 requests per minute per IP per Cloudflare location
    if (ip) {
      const { success } = await env.IP_RATE_LIMITER.limit({ key: ip });
      if (!success) {
        return createRateLimitResponse(60);
      }
    }

    // Return the client IP
    return createIpSuccessResponse(ip, country, city, region);
  },
} satisfies ExportedHandler<Env>;
