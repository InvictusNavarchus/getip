# Migration from Examples to Tests

This document describes the migration from example scripts to professional TDD tests using Vitest.

## Overview

The `examples/` directory has been refactored into a proper test suite in `tests/` using Vitest. This provides better coverage, maintainability, and CI/CD integration.

## File Mapping

| Old File | New File | Description |
|----------|----------|-------------|
| `examples/usage.ts` | `tests/api.test.ts` | API endpoint validation tests |
| `examples/ratelimit-test.ts` | `tests/ratelimit.test.ts` | Rate limiting behavior tests |
| N/A | `tests/setup.ts` | Test environment setup |
| N/A | `tests/README.md` | Test documentation |
| N/A | `vitest.config.ts` | Vitest configuration |

## What Changed

### Before (Examples)
- **Purpose**: Manual testing scripts
- **Execution**: `bun run examples/usage.ts`
- **Output**: Console logs with manual verification
- **Structure**: Imperative scripts with `if (import.meta.main)`
- **Validation**: None - just displays results
- **CI/CD**: Not suitable for automation

### After (Tests)
- **Purpose**: Automated test suite
- **Execution**: `bun test` or `bunx vitest`
- **Output**: Test results with pass/fail status
- **Structure**: BDD-style with descriptive test cases
- **Validation**: Automated assertions with `expect()`
- **CI/CD**: Ready for automation

## Feature Comparison

### API Endpoint Testing

#### Old (`examples/usage.ts`)
```typescript
async function defaultEndpointExample() {
  const response = await fetch(API_ENDPOINT);
  const data = await response.json();
  console.log('Status:', response.status);
  console.log('Response:', JSON.stringify(data, null, 2));
}
```

#### New (`tests/api.test.ts`)
```typescript
describe('GET / - Default endpoint', () => {
  it('should return 200 status code', async () => {
    const response = await fetch(API_ENDPOINT);
    expect(response.status).toBe(200);
  });

  it('should return valid JSON with required fields', async () => {
    const response = await fetch(API_ENDPOINT);
    const data = await response.json();
    
    expect(data).toHaveProperty('ip');
    expect(data).toHaveProperty('city');
    // ... more assertions
  });
});
```

**Benefits**:
- ✅ Isolated test cases
- ✅ Clear expectations
- ✅ Automated validation
- ✅ Better error reporting

### Rate Limiting Testing

#### Old (`examples/ratelimit-test.ts`)
```typescript
async function sequentialTest(count: number = 65) {
  console.log(`Test 1: Making ${count} sequential requests`);
  let successCount = 0;
  let rateLimitCount = 0;
  
  for (let i = 1; i <= count; i++) {
    const result = await makeRequest(i);
    if (result.status === 200) {
      successCount++;
      console.log(`✓ Request ${i}: Success`);
    }
  }
  
  console.log('Summary:');
  console.log(`  Successful: ${successCount}`);
}
```

#### New (`tests/ratelimit.test.ts`)
```typescript
describe('Sequential Requests', () => {
  it('should allow up to 60 requests within the limit', async () => {
    const { successful, rateLimited, errors } = 
      await makeSequentialRequests(60);
    
    expect(successful).toBeGreaterThanOrEqual(58);
    expect(rateLimited).toBeLessThanOrEqual(2);
    expect(errors).toBe(0);
  });

  it('should rate limit requests beyond threshold', async () => {
    const { successful, rateLimited } = 
      await makeSequentialRequests(65);
    
    expect(rateLimited).toBeGreaterThan(0);
    expect(successful).toBeLessThanOrEqual(62);
  });
});
```

**Benefits**:
- ✅ Specific test cases with clear expectations
- ✅ Reusable helper functions
- ✅ Proper async handling
- ✅ Better failure messages

## Running the Tests

### Old Way (Examples)
```bash
# Run usage examples
bun run examples/usage.ts

# Run rate limit tests
bun run examples/ratelimit-test.ts sequential
bun run examples/ratelimit-test.ts parallel
bun run examples/ratelimit-test.ts burst
bun run examples/ratelimit-test.ts all
```

### New Way (Tests)
```bash
# Run all tests
bun test

# Run specific test file
bunx vitest run tests/api.test.ts
bunx vitest run tests/ratelimit.test.ts

# Run in watch mode
bun test:watch

# Run with UI
bun test:ui

# Run with coverage
bun test:coverage
```

## Test Coverage

### API Endpoint Tests (`api.test.ts`)

✅ **Default Endpoint (`/`)**
- Status code validation
- JSON structure validation
- IP address format validation
- Location data validation
- ASN data validation
- CORS headers

✅ **Simple Endpoint (`/simple`)**
- Plain text response
- IP-only output
- No JSON formatting
- CORS headers

✅ **Debug Endpoint (`/debug`)**
- Headers object structure
- Cloudflare metadata
- Common request headers

✅ **Error Handling**
- 405 Method Not Allowed
- 404 Not Found
- Error response format
- Allow header validation
- Available paths in error messages

✅ **CORS Preflight**
- OPTIONS request handling
- CORS headers validation
- Empty response body

### Rate Limiting Tests (`ratelimit.test.ts`)

✅ **Sequential Requests**
- 60 requests/min limit
- Rate limit enforcement
- 429 status codes
- Error message format

✅ **Parallel Requests**
- Concurrent request handling
- Rate limit under concurrent load
- Consistent error format

✅ **Burst Requests**
- Burst traffic handling
- Rate limit across bursts
- Progressive rate limiting

✅ **Rate Limit Response**
- Error response format
- CORS headers on errors
- JSON content type

## Configuration Updates

### `package.json`
Added test scripts:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

### `knip.json`
Updated to track tests instead of examples:
```json
{
  "entry": ["src/index.ts", "tests/**/*.ts"],
  "project": ["src/**/*.ts", "tests/**/*.ts"]
}
```

### New: `vitest.config.ts`
Created Vitest configuration with:
- Node environment
- 30-second timeout for API tests
- Coverage reporting
- Test setup file

## Benefits of Migration

1. **Automation**: Tests can run in CI/CD pipelines
2. **Validation**: Automatic pass/fail with clear expectations
3. **Coverage**: Measure code coverage
4. **Regression**: Catch regressions early
5. **Documentation**: Tests serve as living documentation
6. **Debugging**: Better error messages and test isolation
7. **Maintainability**: Easier to add/modify test cases
8. **Confidence**: Know exactly what works and what doesn't

## What to Keep from Examples

The old example files can still be useful for:
- **Manual testing**: Quick sanity checks during development
- **Demonstrations**: Showing API usage to others
- **Documentation**: README code samples

However, for **automated testing and CI/CD**, use the new test suite.

## Next Steps

1. ✅ Tests are ready to run
2. ⚠️  Ensure `TEST_ENDPOINT_URL` is set in `.env`
3. ⚠️  Run `bunx wrangler dev --port 8787` before testing
4. ✅ Run `bun test` to verify everything works
5. 🔄 Consider adding to CI/CD pipeline

## Migration Checklist

- [x] Create `vitest.config.ts`
- [x] Create `tests/setup.ts`
- [x] Migrate `examples/usage.ts` → `tests/api.test.ts`
- [x] Migrate `examples/ratelimit-test.ts` → `tests/ratelimit.test.ts`
- [x] Add test scripts to `package.json`
- [x] Update `knip.json`
- [x] Create `tests/README.md`
- [x] Run type checking
- [ ] Run initial test suite
- [ ] Remove old examples (optional)
- [ ] Add tests to CI/CD (optional)

## Questions?

See `tests/README.md` for detailed documentation on running and writing tests.
