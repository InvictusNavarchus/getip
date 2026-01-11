/**
 * Example: Testing Rate Limiting
 * 
 * This script tests the rate limiting functionality by making multiple
 * rapid requests to the API. The API limits to 60 requests per minute per IP.
 * 
 * You can run this with: bun run examples/ratelimit-test.ts [test-type]
 * Test types: sequential, parallel, burst, all (default)
 */

import { API_CONFIG } from '../src/config.ts';
const API_ENDPOINT = API_CONFIG.PROD;

/**
 * Makes a single request to the API and returns the result
 */
async function makeRequest(requestNumber: number): Promise<{
  number: number;
  status: number;
  success: boolean;
  data: any;
  timestamp: string;
}> {
  try {
    const response = await fetch(API_ENDPOINT);
    const data = await response.json();
    
    return {
      number: requestNumber,
      status: response.status,
      success: response.ok,
      data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      number: requestNumber,
      status: 0,
      success: false,
      data: { error: String(error) },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Test 1: Sequential requests to observe rate limiting
 */
async function sequentialTest(count: number = 65) {
  console.log(`Test 1: Making ${count} sequential requests`);
  console.log('='.repeat(50));
  console.log('Expected: First 60 should succeed, remaining should fail with 429\n');

  let successCount = 0;
  let rateLimitCount = 0;
  let errorCount = 0;

  for (let i = 1; i <= count; i++) {
    const result = await makeRequest(i);
    
    if (result.status === 200) {
      successCount++;
      console.log(`✓ Request ${i}: Success (IP: ${result.data.ip})`);
    } else if (result.status === 429) {
      rateLimitCount++;
      console.log(`✗ Request ${i}: Rate limited (${result.data.error})`);
    } else {
      errorCount++;
      console.log(`✗ Request ${i}: Error (Status: ${result.status})`);
    }
    
    // Small delay to avoid overwhelming the local dev server
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  console.log('\n' + '-'.repeat(50));
  console.log('Summary:');
  console.log(`  Successful: ${successCount}`);
  console.log(`  Rate limited: ${rateLimitCount}`);
  console.log(`  Errors: ${errorCount}`);
  console.log('-'.repeat(50) + '\n');
}

/**
 * Test 2: Parallel requests to test concurrent rate limiting
 */
async function parallelTest(count: number = 70) {
  console.log(`Test 2: Making ${count} parallel requests`);
  console.log('='.repeat(50));
  console.log('Expected: ~60 should succeed, remaining should fail with 429\n');

  const promises = Array.from({ length: count }, (_, i) => makeRequest(i + 1));
  const results = await Promise.all(promises);

  let successCount = 0;
  let rateLimitCount = 0;
  let errorCount = 0;

  results.forEach(result => {
    if (result.status === 200) {
      successCount++;
    } else if (result.status === 429) {
      rateLimitCount++;
    } else {
      errorCount++;
    }
  });

  console.log('Results:');
  console.log(`  Successful: ${successCount}`);
  console.log(`  Rate limited: ${rateLimitCount}`);
  console.log(`  Errors: ${errorCount}`);
  
  // Show first few successes and first few rate limits
  console.log('\nFirst 5 successful requests:');
  results
    .filter(r => r.status === 200)
    .slice(0, 5)
    .forEach(r => console.log(`  Request ${r.number}: ${r.data.ip}`));
  
  console.log('\nFirst 5 rate-limited requests:');
  results
    .filter(r => r.status === 429)
    .slice(0, 5)
    .forEach(r => console.log(`  Request ${r.number}: ${r.data.error}`));
  
  console.log('\n' + '-'.repeat(50) + '\n');
}

/**
 * Test 3: Burst test - rapid fire requests
 */
async function burstTest(burstSize: number = 10, burstCount: number = 7) {
  console.log(`Test 3: Burst test - ${burstCount} bursts of ${burstSize} requests`);
  console.log('='.repeat(50));
  console.log('Expected: Early bursts succeed, later bursts get rate limited\n');

  let totalSuccess = 0;
  let totalRateLimited = 0;

  for (let burst = 1; burst <= burstCount; burst++) {
    console.log(`Burst ${burst}/${burstCount}:`);
    
    const promises = Array.from({ length: burstSize }, (_, i) => 
      makeRequest((burst - 1) * burstSize + i + 1)
    );
    const results = await Promise.all(promises);
    
    const successInBurst = results.filter(r => r.status === 200).length;
    const rateLimitedInBurst = results.filter(r => r.status === 429).length;
    
    totalSuccess += successInBurst;
    totalRateLimited += rateLimitedInBurst;
    
    console.log(`  ✓ Success: ${successInBurst}, ✗ Rate limited: ${rateLimitedInBurst}`);
    
    // Small delay between bursts
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '-'.repeat(50));
  console.log('Total Summary:');
  console.log(`  Total successful: ${totalSuccess}`);
  console.log(`  Total rate limited: ${totalRateLimited}`);
  console.log('-'.repeat(50) + '\n');
}

/**
 * Main function to run all tests
 */
async function runTests() {
  console.log('\n🚀 GetIP API Rate Limit Testing\n');
  console.log(`Endpoint: ${API_ENDPOINT}`);
  console.log(`Rate limit: 60 requests per minute per IP\n`);
  console.log('Make sure the dev server is running: bunx wrangler dev --port 8787\n');
  console.log('='.repeat(50) + '\n');

  const args = process.argv.slice(2);
  const testType = args[0] || 'all';

  switch (testType) {
    case 'sequential':
      await sequentialTest();
      break;
    case 'parallel':
      await parallelTest();
      break;
    case 'burst':
      await burstTest();
      break;
    case 'all':
    default:
      await sequentialTest();
      console.log('\n' + '='.repeat(50) + '\n');
      await parallelTest();
      console.log('\n' + '='.repeat(50) + '\n');
      await burstTest();
      break;
  }

  console.log('\n✅ All tests completed!\n');
  console.log('Note: Wait ~60 seconds for rate limit to reset before running again.\n');
}

// Execute if run directly
if (import.meta.main) {
  runTests().catch(console.error);
}
