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
  
  console.log(`\n🧪 Running tests against: ${process.env.TEST_ENDPOINT_URL}\n`);
});
