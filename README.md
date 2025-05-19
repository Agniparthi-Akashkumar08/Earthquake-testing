# Earthquake API Service

A backend service that wraps the USGS Earthquake API with caching and rate limiting features.

## Features

- Fetch earthquake data with optional filtering parameters
- Get specific earthquake details by ID
- Redis-based caching for improved performance
- Rate limiting to prevent API abuse
- CORS enabled for cross-origin requests

## Prerequisites

- Node.js (v14 or higher)
- Redis server running locally or accessible via URL
- npm or yarn package manager

## Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd earthquake-api-service
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
REDIS_URL=redis://localhost:6379
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

4. Start the server:
```bash
npm run dev
```

## API Endpoints

### GET /earthquakes
Fetch earthquake data with optional query parameters.

Query Parameters:
- `startTime` (optional): Start time in ISO format (e.g., 2023-01-01T00:00:00)
- `endTime` (optional): End time in ISO format
- `minMagnitude` (optional): Minimum magnitude
- `maxMagnitude` (optional): Maximum magnitude
- `limit` (optional): Number of results to return (default: 10)

Example:
```
GET /earthquakes?startTime=2023-01-01T00:00:00&minMagnitude=5.0
```

### GET /earthquakes/:id
Fetch details of a specific earthquake by its ID.

Example:
```
GET /earthquakes/us7000abcd
```

## Rate Limiting

The API implements rate limiting with the following default settings:
- 100 requests per minute per IP address
- Rate limit headers are included in the response

## Caching

- Earthquake data is cached for 5 minutes
- Individual earthquake details are cached for 10 minutes
- Cache can be cleared by restarting the Redis server

## Testing

Run the test suite:
```bash
npm test
```

## Load Testing

The repository includes a load testing script using Apache Bench (ab). To run load tests:

```bash
npm run load-test
```

## License

MIT 