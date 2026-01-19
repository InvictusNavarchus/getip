/**
 * API Endpoint Tests
 * 
 * Tests all API endpoints for correct behavior, response formats,
 * and error handling.
 */
import { describe, it, expect, beforeAll } from 'vitest';

const API_ENDPOINT = process.env.TEST_ENDPOINT_URL!;

describe('GetIP API Endpoints', () => {
  beforeAll(() => {
    // Ensure we have the endpoint configured
    expect(API_ENDPOINT).toBeDefined();
    expect(API_ENDPOINT).toBeTruthy();
  });

  describe('GET / - Default endpoint (IP + Location data)', () => {
    it('should return 200 status code', async () => {
      const response = await fetch(API_ENDPOINT);
      expect(response.status).toBe(200);
    });

    it('should return JSON content type', async () => {
      const response = await fetch(API_ENDPOINT);
      const contentType = response.headers.get('content-type');
      expect(contentType).toContain('application/json');
    });

    it('should include CORS headers', async () => {
      const response = await fetch(API_ENDPOINT);
      expect(response.headers.get('access-control-allow-origin')).toBe('*');
    });

    it('should return valid JSON response with required fields', async () => {
      const response = await fetch(API_ENDPOINT);
      const data = await response.json();
      
      // Verify structure
      expect(data).toHaveProperty('ip');
      expect(data).toHaveProperty('city');
      expect(data).toHaveProperty('region');
      expect(data).toHaveProperty('country');
      expect(data).toHaveProperty('timezone');
      expect(data).toHaveProperty('asn');
      expect(data).toHaveProperty('asOrganization');
    });

    it('should return valid IP address format', async () => {
      const response = await fetch(API_ENDPOINT);
      const data = await response.json();
      
      // Check if IP is a valid IPv4 or IPv6
      const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
      const ipv6Regex = /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i;
      
      const isValidIp = ipv4Regex.test(data.ip) || ipv6Regex.test(data.ip);
      expect(isValidIp).toBe(true);
    });

    it('should return location data as strings', async () => {
      const response = await fetch(API_ENDPOINT);
      const data = await response.json();
      
      expect(typeof data.city).toBe('string');
      expect(typeof data.region).toBe('string');
      expect(typeof data.country).toBe('string');
      expect(typeof data.timezone).toBe('string');
    });

    it('should return ASN data in correct format', async () => {
      const response = await fetch(API_ENDPOINT);
      const data = await response.json();
      
      // ASN should be a number
      expect(typeof data.asn).toBe('number');
      expect(data.asn).toBeGreaterThan(0);
      
      // AS Organization should be a string
      expect(typeof data.asOrganization).toBe('string');
    });
  });

  describe('GET /simple - Simple endpoint (IP only)', () => {
    it('should return 200 status code', async () => {
      const response = await fetch(`${API_ENDPOINT}/simple`);
      expect(response.status).toBe(200);
    });

    it('should return plain text content type', async () => {
      const response = await fetch(`${API_ENDPOINT}/simple`);
      const contentType = response.headers.get('content-type');
      expect(contentType).toContain('text/plain');
    });

    it('should include CORS headers', async () => {
      const response = await fetch(`${API_ENDPOINT}/simple`);
      expect(response.headers.get('access-control-allow-origin')).toBe('*');
    });

    it('should return only the IP address', async () => {
      const response = await fetch(`${API_ENDPOINT}/simple`);
      const text = await response.text();
      
      // Should be just the IP, nothing else
      const trimmed = text.trim();
      
      // Check if it's a valid IP format
      const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
      const ipv6Regex = /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i;
      
      const isValidIp = ipv4Regex.test(trimmed) || ipv6Regex.test(trimmed);
      expect(isValidIp).toBe(true);
    });

    it('should not contain JSON or extra formatting', async () => {
      const response = await fetch(`${API_ENDPOINT}/simple`);
      const text = await response.text();
      
      // Should not be JSON
      expect(() => JSON.parse(text)).toThrow();
      
      // Should not have brackets, quotes, etc.
      expect(text).not.toContain('{');
      expect(text).not.toContain('}');
      expect(text).not.toContain('"');
    });
  });

  describe('GET /debug - Debug endpoint (Full request data)', () => {
    it('should return 200 status code', async () => {
      const response = await fetch(`${API_ENDPOINT}/debug`);
      expect(response.status).toBe(200);
    });

    it('should return JSON content type', async () => {
      const response = await fetch(`${API_ENDPOINT}/debug`);
      const contentType = response.headers.get('content-type');
      expect(contentType).toContain('application/json');
    });

    it('should include CORS headers', async () => {
      const response = await fetch(`${API_ENDPOINT}/debug`);
      expect(response.headers.get('access-control-allow-origin')).toBe('*');
    });

    it('should return headers object', async () => {
      const response = await fetch(`${API_ENDPOINT}/debug`);
      const data = await response.json();
      
      expect(data).toHaveProperty('headers');
      expect(typeof data.headers).toBe('object');
      expect(Object.keys(data.headers).length).toBeGreaterThan(0);
    });

    it('should include common request headers', async () => {
      const response = await fetch(`${API_ENDPOINT}/debug`);
      const data = await response.json();
      
      // Should contain at least some common headers
      const headerKeys = Object.keys(data.headers).map(k => k.toLowerCase());
      
      // Most requests should have user-agent or host
      const hasCommonHeaders = 
        headerKeys.some(k => k.includes('user-agent')) ||
        headerKeys.some(k => k.includes('host'));
      
      expect(hasCommonHeaders).toBe(true);
    });

    it('should include Cloudflare metadata if available', async () => {
      const response = await fetch(`${API_ENDPOINT}/debug`);
      const data = await response.json();
      
      // cf might be present or not depending on environment
      if (data.cf) {
        expect(typeof data.cf).toBe('object');
      }
    });
  });

  describe('Error Handling', () => {
    describe('POST / - Method not allowed', () => {
      it('should return 405 status code', async () => {
        const response = await fetch(API_ENDPOINT, {
          method: 'POST',
        });
        expect(response.status).toBe(405);
      });

      it('should return JSON error response', async () => {
        const response = await fetch(API_ENDPOINT, {
          method: 'POST',
        });
        const data = await response.json();
        
        expect(data).toHaveProperty('error');
        expect(typeof data.error).toBe('string');
      });

      it('should include Allow header with GET and OPTIONS', async () => {
        const response = await fetch(API_ENDPOINT, {
          method: 'POST',
        });
        const allow = response.headers.get('allow');
        
        expect(allow).toBeTruthy();
        expect(allow).toContain('GET');
        expect(allow).toContain('OPTIONS');
      });
    });

    describe('GET /invalid-path - Path not found', () => {
      it('should return 404 status code', async () => {
        const response = await fetch(`${API_ENDPOINT}/invalid-path`);
        expect(response.status).toBe(404);
      });

      it('should return JSON error response', async () => {
        const response = await fetch(`${API_ENDPOINT}/invalid-path`);
        const data = await response.json();
        
        expect(data).toHaveProperty('error');
        expect(typeof data.error).toBe('string');
      });

      it('should list available paths in error message', async () => {
        const response = await fetch(`${API_ENDPOINT}/api/ip`);
        const data = await response.json();
        
        // Error message should mention available paths
        expect(data.error.toLowerCase()).toMatch(/available|valid|try/);
        expect(data.error).toMatch(/\//); // Should contain path references
      });
    });

    describe('OPTIONS / - CORS preflight', () => {
      it('should return 204 status code', async () => {
        const response = await fetch(API_ENDPOINT, {
          method: 'OPTIONS',
        });
        expect(response.status).toBe(204);
      });

      it('should include CORS headers', async () => {
        const response = await fetch(API_ENDPOINT, {
          method: 'OPTIONS',
        });
        
        expect(response.headers.get('access-control-allow-origin')).toBe('*');
        expect(response.headers.get('access-control-allow-methods')).toBeTruthy();
        expect(response.headers.get('access-control-max-age')).toBeTruthy();
      });

      it('should have no response body', async () => {
        const response = await fetch(API_ENDPOINT, {
          method: 'OPTIONS',
        });
        const text = await response.text();
        expect(text).toBe('');
      });
    });
  });
});
