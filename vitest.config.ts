import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',
    
    // Include source files for coverage
    include: ['tests/**/*.test.ts'],
    
    // Exclude patterns
    exclude: ['node_modules', 'dist', '.wrangler'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '.wrangler/**',
        'examples/**',
        '**/*.config.*',
      ],
    },
    
    // Timeout for tests (increase for API tests)
    testTimeout: 30000,
    
    // Setup files
    setupFiles: ['./tests/setup.ts'],
    
    // Globals (allows using describe, it, expect without imports)
    globals: true,
  },
});
