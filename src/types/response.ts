/**
 * Response structure for IP address API
 */
export interface IpResponse {
  ip: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
  timestamp: string;
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  error: string;
  timestamp: string;
}
