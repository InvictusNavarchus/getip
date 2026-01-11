/**
 * API Configuration
 * Single source of truth for API endpoints
 */

export const API_CONFIG = {
  /**
   * Local development endpoint
   * Used when running `bunx wrangler dev --port 8787`
   */
  LOCAL: 'http://localhost:8787',

  /**
   * Production endpoint
   * Deployed on Cloudflare Workers
   */
  PROD: 'https://getip.my.id',

  /**
   * Default endpoint (production)
   * Change this to switch between environments
   */
  get DEFAULT() {
    return this.PROD;
  },
} as const;

