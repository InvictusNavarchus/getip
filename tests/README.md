# Tests

This directory contains the test suite for the GetIP API using [Vitest](https://vitest.dev/).

## Test Files

- **`setup.ts`** - Test environment setup, loads environment variables
- **`api.test.ts`** - API endpoint tests (/, /simple, /debug, error handling)

## Prerequisites

Before running tests, ensure:

1. **Environment Variables**: Create a `.env` file with:
   ```bash
   TEST_ENDPOINT_URL=http://localhost:8787
   ```

2. **Dev Server Running**: The tests require a running instance of the API:
   ```bash
   bun run dev
   ```

## Running Tests

```bash
bun run test
```
