import { getClientIp, getCountry, getCity, getRegion } from "./http/getHeaders";
import { 
  handleOptions, 
  createRateLimitResponse, 
  createIpSuccessResponse,
  createMethodNotAllowedResponse,
  createNotFoundResponse
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

    // Only allow GET requests to root path
    if (request.method !== 'GET') {
      return createMethodNotAllowedResponse();
    }

    // Only respond to root path
    if (url.pathname !== '/') {
      return createNotFoundResponse();
    }

    // Extract the client IP and country
    const ip = getClientIp(request);
    const country = getCountry(request);
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
