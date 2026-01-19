import { getClientIp, getLocationData } from "./http/getClientInfo";
import { getAllHeaders } from "./http/getHeaders";
import { 
  handleOptions, 
  createRateLimitResponse, 
  createIpSuccessResponse,
  createMethodNotAllowedResponse,
  createNotFoundResponse,
  createDebugResponse,
  createSimpleResponse
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

    // return only the client IP address in plain text
    if (url.pathname === '/simple') {
      return createSimpleResponse(getClientIp(request));
    }

    // Only respond to root path for IP lookup
    if (url.pathname !== '/') {
      return createNotFoundResponse();
    }

    // Extract the client IP and location information from request.cf
    const ip = getClientIp(request);
    const locationData = getLocationData(request.cf);
    
    // Apply rate limiting based on IP address
    // Limit: 60 requests per minute per IP per Cloudflare location
    if (ip) {
      const { success } = await env.IP_RATE_LIMITER.limit({ key: ip });
      if (!success) {
        return createRateLimitResponse(60);
      }
    }

    // Return the client IP and location data
    return createIpSuccessResponse(ip, locationData);
  },
} satisfies ExportedHandler<Env>;
