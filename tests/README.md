# Tests

This directory contains the test suite for the GetIP API using [Vitest](https://vitest.dev/).

## Test Files

- **`setup.ts`** - Test environment setup, loads environment variables
- **`api.test.ts`** - API endpoint tests (/, /simple, /debug, error handling)
- **`ratelimit.test.ts`** - Rate limiting tests (sequential, parallel, burst)

## Prerequisites

Before running tests, ensure:

1. **Environment Variables**: Create a `.env` file with:
   ```bash
   TEST_ENDPOINT_URL=http://localhost:8787
   ```

2. **Dev Server Running**: The tests require a running instance of the API:
   ```bash
   bunx wrangler dev --port 8787
   ```

## Running Tests

### Run All Tests (Single Run)
```bash
bun test
# or
bunx vitest run
```

### Watch Mode (Re-run on changes)
```bash
bun test:watch
# or
bunx vitest
```

### UI Mode (Interactive browser UI)
```bash
bun test:ui
# or
bunx vitest --ui
```

### Coverage Report
```bash
bun test:coverage
# or
bunx vitest run --coverage
```

## Test Structure

### API Endpoint Tests (`api.test.ts`)

Tests all API endpoints for:
- ✅ Correct HTTP status codes
- ✅ Proper content types
- ✅ CORS headers
- ✅ Response data structure and validation
- ✅ Error handling (405, 404)
- ✅ IP address format validation

### Rate Limiting Tests (`ratelimit.test.ts`)

Tests rate limiting functionality:
- ✅ Sequential requests (up to 60/min limit)
- ✅ Parallel/concurrent requests
- ✅ Burst traffic handling
- ✅ Rate limit error responses (429)
- ✅ Consistent behavior across request patterns

## Important Notes

### Rate Limit Tests
⚠️ **Warning**: Rate limit tests can take a long time to run (up to 60+ seconds each) because they need to:
1. Make many requests to trigger rate limiting
2. Wait for rate limit windows to reset (60 seconds)
3. Verify rate limiting behavior across different patterns

**Tip**: Run rate limit tests separately when needed:
```bash
bunx vitest run tests/ratelimit.test.ts
```

Or run only API tests for faster feedback:
```bash
bunx vitest run tests/api.test.ts
```

### Test Isolation

Tests may fail if:
- The dev server is not running
- Rate limits haven't reset from previous test runs
- Network connectivity issues

**Solution**: Wait ~60 seconds between test runs for rate limit to reset.

## Writing New Tests

Follow these patterns when adding tests:

```typescript
import { describe, it, expect, beforeAll } from 'vitest';

describe('Feature Name', () => {
  beforeAll(() => {
    // Setup before all tests in this suite
  });

  describe('Specific Scenario', () => {
    it('should behave in expected way', async () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = await someFunction(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

## CI/CD Integration

For continuous integration, consider:

1. **Separate test environments** for production vs staging
2. **Conditional rate limit tests** (skip in CI, run manually)
3. **Mock API responses** for faster unit tests
4. **E2E tests** against deployed Workers

Example CI config:
```yaml
test:
  script:
    - bun install
    - bunx vitest run tests/api.test.ts --reporter=json
```

## Troubleshooting

### Tests Timing Out
- Increase timeout in `vitest.config.ts`
- Check if dev server is responding
- Verify network connectivity

### Rate Limit Tests Failing
- Wait 60 seconds for rate limit to reset
- Ensure you're testing against local dev, not production
- Check if other processes are making requests to the same endpoint

### Type Errors
```bash
bunx tsc --noEmit
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vitest API Reference](https://vitest.dev/api/)
- [Testing Best Practices](https://vitest.dev/guide/testing-types.html)
