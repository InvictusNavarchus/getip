/**
 * Location and network data from Cloudflare's request.cf object
 * This is the single source of truth for location-related fields
 */
interface LocationData {
  country: string | null;
  city: string | null;
  region: string | null;
  regionCode: string | null;
  latitude: string | null;
  longitude: string | null;
  postalCode: string | null;
  timezone: string | null;
  continent: string | null;
  asn: number | null;
  asOrganization: string | null;
}

/**
 * Subset of LocationData that are usually accurate and reliable.
 * We'll use this as the response
 */
export type ReliableLocationData = Pick<LocationData, 'asn' | 'asOrganization' | 'city' | 'region' | 'country' | 'timezone'>;

/**
 * Response structure for IP address API
 */
export interface IpResponse extends ReliableLocationData {
  ip: string | null;
  timestamp: string;
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  error: string;
  timestamp: string;
}
