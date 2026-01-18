import { IpResponse, ErrorResponse } from "../types/response";

/**
 * Creates a JSON response with appropriate headers
 * 
 * @param data - The data to serialize as JSON
 * @param status - HTTP status code
 * @returns Response object
 */
export function createJsonResponse(
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
export function handleOptions(): Response {
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
 * Creates a rate limit error response with Retry-After header
 * 
 * @param retryAfterSeconds - Number of seconds to wait before retrying
 * @returns Response object with 429 status
 */
export function createRateLimitResponse(retryAfterSeconds: number = 60): Response {
  const errorResponse: ErrorResponse = {
    error: 'Rate limit exceeded. Maximum 60 requests per minute allowed.',
    timestamp: new Date().toISOString(),
  };

  return new Response(JSON.stringify(errorResponse, null, 2), {
    status: 429,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'Retry-After': retryAfterSeconds.toString(),
      'Access-Control-Allow-Origin': '*',
    },
  });
}

/**
 * Creates a successful IP response with client information
 * 
 * @param ip - The client IP address
 * @param country - The client country code
 * @returns Response object with 200 status
 */
export function createIpSuccessResponse(
  ip: string | null,
  country: string | null
): Response {
  const response: IpResponse = {
    ip,
    country,
    timestamp: new Date().toISOString(),
  };

  return createJsonResponse(response);
}

/**
 * Creates a 405 Method Not Allowed error response
 * 
 * @returns Response object with 405 status
 */
export function createMethodNotAllowedResponse(): Response {
  const errorResponse: ErrorResponse = {
    error: 'Method not allowed. Only GET requests are supported.',
    timestamp: new Date().toISOString(),
  };

  return createJsonResponse(errorResponse, 405);
}

/**
 * Creates a 404 Not Found error response
 * 
 * @returns Response object with 404 status
 */
export function createNotFoundResponse(): Response {
  const errorResponse: ErrorResponse = {
    error: 'Not found. Only root path (/) is available.',
    timestamp: new Date().toISOString(),
  };

  return createJsonResponse(errorResponse, 404);
}