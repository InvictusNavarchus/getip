# GetIP - IP Address & Location API


![Version](https://img.shields.io/badge/version-1.0.0-green)
[![License](https://img.shields.io/badge/license-MIT-blue)](https://github.com/farhandigital/getip/blob/master/LICENSE)

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/FarhanDigital/getip)

A simple, robust API that returns the IP address and location information for anyone who sends a GET request. Built with TypeScript and deployed on Cloudflare Workers.


## Features

- ✅ **Simple & Robust**: No third-party dependencies
- ✅ **Strongly Typed**: Written in TypeScript with strict type checking
- ✅ **Fast**: Runs on Cloudflare's edge network
- ✅ **CORS Enabled**: Can be called from any origin
- ✅ **Rate Limited**: Prevents abuse with configurable requests per minute per IP (default: 60)
- ✅ **Location Data**: Includes city, region, country, timezone, and ASN information
- ✅ **Multiple Formats**: JSON (default) or plain text (`/simple`)
- ✅ **Debug Endpoint**: Full request headers and Cloudflare metadata (`/debug`)

## Endpoints

### `GET /` - IP + Location Data (JSON)

Returns the client IP address with location information derived from Cloudflare's geolocation data.

**Success Response (200 OK)**
```json
{
  "ip": "203.0.113.42",
  "asn": 13335,
  "asOrganization": "CLOUDFLARENET",
  "city": "San Francisco",
  "region": "California",
  "country": "US",
  "timezone": "America/Los_Angeles",
  "timestamp": "2026-01-19T03:08:32.000Z"
}
```

### `GET /simple` - IP Only (Plain Text)

Returns only the IP address as plain text. Useful for shell scripts and simple integrations.

**Success Response (200 OK)**
```
203.0.113.42
```

### `GET /debug` - Full Request Data (JSON)

Returns all request headers and Cloudflare metadata. Useful for debugging and understanding what data Cloudflare provides.

**Success Response (200 OK)**
```json
{
  "headers": {
    "cf-connecting-ip": "203.0.113.42",
    "cf-ipcity": "San Francisco",
    "cf-ipcountry": "US",
    ...
  },
  "cf": {
    "asn": 13335,
    "city": "San Francisco",
    "country": "US",
    ...
  },
  "timestamp": "2026-01-19T03:08:32.000Z"
}
```

## Error Responses

### 405 Method Not Allowed

```json
{
  "error": "Method not allowed. Only GET requests are supported.",
  "timestamp": "2026-01-19T03:08:32.000Z"
}
```

### 404 Not Found

```json
{
  "error": "Not found. Available paths: / (IP + location lookup), /simple (IP only), and /debug (full headers + CF metadata dump).",
  "timestamp": "2026-01-19T03:08:32.000Z"
}
```

### 429 Too Many Requests

```json
{
  "error": "Rate limit exceeded. Maximum 60 requests per minute allowed.",
  "timestamp": "2026-01-19T03:08:32.000Z"
}
```

**Headers**: Includes `Retry-After: 60` header indicating when to retry.

## How It Works

### IP

The API extracts the client IP address from the request headers in the following priority order:

1. **CF-Connecting-IP** - Cloudflare's reliable client IP header (primary)
2. **X-Real-IP** - Common proxy header (fallback)
3. **X-Forwarded-For** - Standard proxy header (last resort)

### Location Data

The API extracts the location data (city, country, asn, asOrganization) from Cloudflare's CF object provided by Workers

### Rate Limiting

The API implements rate limiting to prevent abuse:

- **Limit**: 60 requests per minute per IP address (configurable)
- **Scope**: Per Cloudflare datacenter location (not global)
- **Implementation**: Uses Cloudflare Workers Rate Limiting binding
- **Response**: Returns HTTP 429 with `Retry-After` header when exceeded

## Development

### Prerequisites

- [Bun](https://bun.sh) installed
- Cloudflare account (for deployment)

### Installation

```bash
bun install
```

### Type Checking

```bash
bunx tsc --noEmit
```

### Testing

**Quick API Tests** (Recommended - ~10 seconds)
```bash
bun run test
```

See `tests/README.md` for detailed testing documentation.

### Local Development

```bash
bun run dev
```

This will start a local development server. Note that during local development, the IP address might be `127.0.0.1` or a local network IP.

**Note**: Rate limiting is not enforced in local development mode. To test rate limiting, deploy to Cloudflare Workers.

### Deployment

#### 🚀 One-Click Deployment

If you want to self-host this project, you can deploy it to your Cloudflare account with a single click:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/FarhanDigital/getip)

#### Manual Deployment

```bash
bun run deploy
```

## Project Structure

```
getip/
├── src/
│   ├── http/
│   │   ├── createResponse.ts   # Response creation functions
│   │   ├── getClientInfo.ts    # IP and location extraction
│   │   └── getHeaders.ts       # Request header utilities
│   ├── types/
│   │   ├── env.ts              # Environment bindings
│   │   └── response.ts         # Response type definitions
│   └── index.ts                # Main Worker orchestrator
├── tests/
│   ├── api.test.ts             # API endpoint tests
│   ├── ratelimit.test.ts       # Rate limiting tests
│   ├── setup.ts                # Test environment setup
│   └── README.md               # Test documentation
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── vitest.config.ts            # Vitest test configuration
├── wrangler.jsonc              # Cloudflare Workers configuration
└── README.md                   # This file
```

## Technical Details

- **Runtime**: Cloudflare Workers (V8 isolates)
- **Language**: TypeScript with strict type checking
- **Package Manager**: Bun
- **Deployment**: Cloudflare Workers
- **No third-party libraries**: Uses only Web Standards APIs

## License

MIT
