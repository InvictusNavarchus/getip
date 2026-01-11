/**
 * Example: How to use the GetIP API
 * 
 * This file demonstrates various ways to call the API.
 * You can run this with: bun run examples/usage.ts
 */

import { API_CONFIG } from '../src/config.ts';
const API_ENDPOINT = API_CONFIG.PROD;

// Example 1: Simple fetch
async function simpleExample() {
  console.log('Example 1: Simple fetch');
  console.log('========================\n');

  try {
    const response = await fetch(API_ENDPOINT);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
  console.log('\n');
}

// Example 2: Error handling - Wrong method
async function errorMethodExample() {
  console.log('Example 2: POST request (should fail)');
  console.log('======================================\n');

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
  console.log('\n');
}

// Example 3: Error handling - Wrong path
async function errorPathExample() {
  console.log('Example 3: Wrong path (should fail)');
  console.log('====================================\n');

  try {
    const response = await fetch(`${API_ENDPOINT}/api/ip`);
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
  console.log('\n');
}

// Example 4: Using custom headers
async function customHeadersExample() {
  console.log('Example 4: Custom headers (simulating proxy)');
  console.log('=============================================\n');

  try {
    const response = await fetch(API_ENDPOINT, {
      headers: {
        'X-Forwarded-For': '203.0.113.42, 198.51.100.17',
      },
    });
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
  console.log('\n');
}

// Run all examples
async function runExamples() {
  console.log('GetIP API Usage Examples');
  console.log('========================\n');
  console.log('Make sure the dev server is running: bunx wrangler dev\n');
  console.log(`Using endpoint: ${API_ENDPOINT}`);
  console.log(`To use production: Replace API_CONFIG.DEFAULT with API_CONFIG.PROD or getApiEndpoint('prod')\n`);
  console.log('----------------------------------------\n\n');

  await simpleExample();
  await errorMethodExample();
  await errorPathExample();
  await customHeadersExample();

  console.log('All examples completed!');
}

// Execute if run directly
if (import.meta.main) {
  runExamples().catch(console.error);
}
