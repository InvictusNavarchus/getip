/**
 * Vitest setup file
 * Loads environment variables and configures test environment
 */
import 'dotenv/config';
import { beforeAll } from 'vitest';

beforeAll(() => {
  // Verify required environment variables
  if (!process.env.TEST_ENDPOINT_URL) {
    throw new Error(
      'TEST_ENDPOINT_URL is not defined. Please set it in .env file.'
    );
  }
  
  // Normalize URL by removing trailing slash to prevent double-slash issues
  // when concatenating paths like /simple, /debug
  const originalUrl = process.env.TEST_ENDPOINT_URL;
  const normalizedUrl = originalUrl.replace(/\/$/, '');
  
  // Update the env var with normalized URL
  process.env.TEST_ENDPOINT_URL = normalizedUrl;
  
  console.log(`\n🧪 Running tests against: ${normalizedUrl}\n`);
});
