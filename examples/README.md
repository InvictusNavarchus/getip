# GetIP API Examples

This directory contains example scripts demonstrating how to use and test the GetIP API.

## Available Examples

### 1. Basic Usage (`usage.ts`)

Demonstrates various ways to call the API, including:
- Simple GET requests
- Error handling (wrong methods, wrong paths)
- Custom headers (simulating proxy scenarios)

**Run it:**
```bash
bun run examples/usage.ts
```

### 2. Rate Limit Testing (`ratelimit-test.ts`)

Tests the rate limiting functionality (60 requests per minute per IP) with three different test patterns:

- **Sequential Test**: Makes requests one after another to observe when rate limiting kicks in
- **Parallel Test**: Makes concurrent requests to test parallel rate limiting
- **Burst Test**: Makes multiple bursts of requests to simulate real-world traffic patterns

**Run all tests:**
```bash
bun run examples/ratelimit-test.ts
```

**Run specific test:**
```bash
bun run examples/ratelimit-test.ts sequential
bun run examples/ratelimit-test.ts parallel
bun run examples/ratelimit-test.ts burst
```

## Prerequisites

Make sure the development server is running before executing these examples:

```bash
bunx wrangler dev --port 8787
```

Or if testing against production:

Update `src/config.ts` to use the production endpoint, or modify the examples to call `getApiEndpoint('prod')`.

## Notes

- The rate limit resets after 60 seconds
- When testing rate limits, wait at least 60 seconds between test runs
- The local dev server uses the same rate limiting as production
- All examples use the endpoint defined in `src/config.ts`
