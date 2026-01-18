
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

export function getCountry(request: Request): string | null {
  const country = request.headers.get('CF-IPCountry');
  if (country) {
    return country;
  }

  return null;
}
