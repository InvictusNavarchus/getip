import { LocationData } from "../types/response";

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
export function getClientIp(request: Request): string | null {
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
 * Extracts location and network information from request.cf object
 * 
 * The request.cf object is automatically populated by Cloudflare Workers
 * and contains rich geolocation and network information about the request.
 * This is more reliable and feature-rich than extracting from headers.
 * 
 * @param cf - The request.cf object from Cloudflare Workers
 * @returns An object containing all available location and network data
 */
export function getLocationData(cf: Request['cf']): LocationData {
  return {
    country: (cf?.country as string | undefined) ?? null,
    city: (cf?.city as string | undefined) ?? null,
    region: (cf?.region as string | undefined) ?? null,
    regionCode: (cf?.regionCode as string | undefined) ?? null,
    latitude: (cf?.latitude as string | undefined) ?? null,
    longitude: (cf?.longitude as string | undefined) ?? null,
    postalCode: (cf?.postalCode as string | undefined) ?? null,
    timezone: (cf?.timezone as string | undefined) ?? null,
    continent: (cf?.continent as string | undefined) ?? null,
    asn: (cf?.asn as number | undefined) ?? null,
    asOrganization: (cf?.asOrganization as string | undefined) ?? null,
  };
}
