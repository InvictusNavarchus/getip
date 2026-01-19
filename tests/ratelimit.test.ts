/**
 * Rate Limiting Tests
 * 
 * Tests the rate limiting functionality to ensure the API correctly
 * enforces the 60 requests per minute limit per IP.
 */
import { describe, it, expect, beforeAll } from 'vitest';

const API_ENDPOINT = process.env.TEST_ENDPOINT_URL!;
const RATE_LIMIT = 60; // 60 requests per minute

/**
 * Helper function to make a single request
 */
async function makeRequest(): Promise<{
  status: number;
  success: boolean;
  data: any;
}> {
  try {
    const response = await fetch(API_ENDPOINT);
    const data = await response.json();
    
    return {
      status: response.status,
      success: response.ok,
      data,
    };
  } catch (error) {
    return {
      status: 0,
      success: false,
      data: { error: String(error) },
    };
  }
}

/**
 * Helper function to make multiple requests with a small delay
 */
async function makeSequentialRequests(count: number): Promise<{
  successful: number;
  rateLimited: number;
  errors: number;
  results: Array<{ status: number; success: boolean; data: any }>;
}> {
  const results = [];
  let successful = 0;
  let rateLimited = 0;
  let errors = 0;

  for (let i = 0; i < count; i++) {
    const result = await makeRequest();
    results.push(result);
    
    if (result.status === 200) {
      successful++;
    } else if (result.status === 429) {
      rateLimited++;
    } else {
      errors++;
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  return { successful, rateLimited, errors, results };
}

/**
 * Helper function to make parallel requests
 */
async function makeParallelRequests(count: number): Promise<{
  successful: number;
  rateLimited: number;
  errors: number;
  results: Array<{ status: number; success: boolean; data: any }>;
}> {
  const promises = Array.from({ length: count }, () => makeRequest());
  const results = await Promise.all(promises);
  
  let successful = 0;
  let rateLimited = 0;
  let errors = 0;

  results.forEach(result => {
    if (result.status === 200) {
      successful++;
    } else if (result.status === 429) {
      rateLimited++;
    } else {
      errors++;
    }
  });

  return { successful, rateLimited, errors, results };
}

describe('Rate Limiting', () => {
  beforeAll(() => {
    expect(API_ENDPOINT).toBeDefined();
    expect(API_ENDPOINT).toBeTruthy();
  });

  describe('Sequential Requests', () => {
    it('should allow up to 60 requests within the limit', async () => {
      // Wait to ensure rate limit is reset
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { successful, rateLimited, errors } = await makeSequentialRequests(60);
      
      // All 60 should succeed (or close to it, accounting for timing)
      expect(successful).toBeGreaterThanOrEqual(58); // Allow some margin
      expect(rateLimited).toBeLessThanOrEqual(2);
      expect(errors).toBe(0);
    }, 60000); // Increase timeout for this test

    it('should rate limit requests beyond the 60/minute threshold', async () => {
      const { successful, rateLimited } = await makeSequentialRequests(65);
      
      // Should have some rate limited requests
      expect(rateLimited).toBeGreaterThan(0);
      
      // Total successful should not exceed the limit by much
      expect(successful).toBeLessThanOrEqual(RATE_LIMIT + 2); // Small margin for timing
    }, 60000);

    it('should return 429 status for rate-limited requests', async () => {
      // Make enough requests to trigger rate limit
      const { results } = await makeSequentialRequests(65);
      
      // Find at least one rate-limited request
      const rateLimitedRequest = results.find(r => r.status === 429);
      expect(rateLimitedRequest).toBeDefined();
      
      if (rateLimitedRequest) {
        expect(rateLimitedRequest.data).toHaveProperty('error');
        expect(rateLimitedRequest.data.error).toMatch(/rate limit/i);
      }
    }, 60000);
  });

  describe('Parallel Requests', () => {
    it('should handle concurrent requests within rate limit', async () => {
      // Wait to ensure rate limit is reset
      await new Promise(resolve => setTimeout(resolve, 65000));
      
      const { successful, errors } = await makeParallelRequests(50);
      
      // Most should succeed when under the limit
      expect(successful).toBeGreaterThanOrEqual(45);
      expect(errors).toBe(0);
    }, 70000);

    it('should rate limit concurrent requests that exceed threshold', async () => {
      const { successful, rateLimited } = await makeParallelRequests(70);
      
      // Should have rate limited some requests
      expect(rateLimited).toBeGreaterThan(0);
      
      // Total successful + rate limited should equal total requests
      expect(successful + rateLimited).toBe(70);
      
      // Successful should be around the rate limit
      expect(successful).toBeLessThanOrEqual(RATE_LIMIT + 5); // Margin for concurrent timing
    }, 30000);

    it('should return consistent error format for all rate-limited requests', async () => {
      const { results } = await makeParallelRequests(70);
      
      const rateLimitedResults = results.filter(r => r.status === 429);
      
      // All rate-limited responses should have the same structure
      rateLimitedResults.forEach(result => {
        expect(result.data).toHaveProperty('error');
        expect(typeof result.data.error).toBe('string');
        expect(result.data.error).toMatch(/rate limit/i);
      });
    }, 30000);
  });

  describe('Burst Requests', () => {
    it('should handle burst traffic appropriately', async () => {
      // Wait to ensure rate limit is reset
      await new Promise(resolve => setTimeout(resolve, 65000));
      
      const burstSize = 10;
      const burstCount = 7; // Total 70 requests
      let totalSuccessful = 0;
      let totalRateLimited = 0;

      for (let i = 0; i < burstCount; i++) {
        const { successful, rateLimited } = await makeParallelRequests(burstSize);
        totalSuccessful += successful;
        totalRateLimited += rateLimited;
        
        // Small delay between bursts
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Should rate limit after reaching threshold
      expect(totalRateLimited).toBeGreaterThan(0);
      
      // Total successful should be around rate limit
      expect(totalSuccessful).toBeLessThanOrEqual(RATE_LIMIT + 5);
      
      // Total requests should be accounted for
      expect(totalSuccessful + totalRateLimited).toBe(burstSize * burstCount);
    }, 90000);

    it('should rate limit consistently across bursts', async () => {
      const burstSize = 15;
      const burstCount = 5;
      const burstResults: Array<{ successful: number; rateLimited: number }> = [];

      for (let i = 0; i < burstCount; i++) {
        const { successful, rateLimited } = await makeParallelRequests(burstSize);
        burstResults.push({ successful, rateLimited });
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Later bursts should have more rate limiting
      const firstBurst = burstResults[0];
      const lastBurst = burstResults[burstResults.length - 1];
      
      // First burst should have more successes
      expect(firstBurst.successful).toBeGreaterThan(lastBurst.successful);
      
      // Last burst should have more rate limits
      expect(lastBurst.rateLimited).toBeGreaterThan(firstBurst.rateLimited);
    }, 60000);
  });

  describe('Rate Limit Response Format', () => {
    it('should include rate limit information in error response', async () => {
      // Trigger rate limit
      await makeSequentialRequests(65);
      
      const result = await makeRequest();
      
      if (result.status === 429) {
        expect(result.data).toHaveProperty('error');
        expect(result.data.error).toContain('60');
        expect(result.data.error).toMatch(/minute|min/i);
      }
    }, 60000);

    it('should maintain CORS headers even when rate limited', async () => {
      // Trigger rate limit
      await makeSequentialRequests(65);
      
      const response = await fetch(API_ENDPOINT);
      
      if (response.status === 429) {
        expect(response.headers.get('access-control-allow-origin')).toBe('*');
      }
    }, 60000);

    it('should return JSON content type for rate limit errors', async () => {
      // Trigger rate limit
      await makeSequentialRequests(65);
      
      const response = await fetch(API_ENDPOINT);
      
      if (response.status === 429) {
        const contentType = response.headers.get('content-type');
        expect(contentType).toContain('application/json');
      }
    }, 60000);
  });
});
