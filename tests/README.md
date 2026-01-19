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

### Quick Tests (Recommended for Development)

**API Tests Only** - Fast feedback, no rate limiting tests (~10 seconds)
```bash
bun test
# or
bun test:api
# or
bunx vitest run tests/api.test.ts
```

This is the **default** and recommended for:
- ✅ Quick validation during development
- ✅ Pre-commit checks
- ✅ CI/CD pipelines
- ✅ When you only changed API logic

### Full Test Suite

**All Tests Including Rate Limits** - Complete validation (~5+ minutes)
```bash
bun test:full
# or
bunx vitest run
```

Use this when:
- 🔍 You modified rate limiting logic
- 🔍 Running comprehensive pre-deployment checks
- 🔍 You want complete test coverage

### Rate Limit Tests Only

**Rate Limiting Tests** - Isolated rate limit testing (~3-5 minutes)
```bash
bun test:ratelimit
# or
bunx vitest run tests/ratelimit.test.ts
```

Use this when:
- 🎯 Specifically testing rate limit changes
- 🎯 Debugging rate limit behavior
- 🎯 Validating rate limit configuration

### Development Modes

**Watch Mode** - Re-run on file changes (API tests only)
```bash
bun test:watch
# or
bunx vitest
```

**UI Mode** - Interactive browser UI
```bash
bun test:ui
# or
bunx vitest --ui
```

**Coverage Report** - Generate coverage (API tests only by default)
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

For continuous integration, we recommend **running only API tests** for fast feedback:

**Recommended (Fast CI)**:
```yaml
test:
  script:
    - bun install
    - bun test:api --reporter=json
    # Or: bunx vitest run tests/api.test.ts --reporter=json
```

**Optional Full Tests** (slower, run on schedule or manually):
```yaml
test-full:
  script:
    - bun install
    - bun test:full --reporter=json
  when: manual  # Only run when triggered
  # Or schedule: nightly
```

**Best Practices**:
1. **Fast CI**: Use `test:api` for pull requests and commits
2. **Full Tests**: Run `test:full` on schedule (nightly/weekly) or pre-deployment
3. **Separate Environments**: Use staging endpoint for CI tests
4. **Mock Responses**: Consider mocking for even faster unit tests


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
