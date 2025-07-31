# Jobs Collection Server

A Node.js server that collects job data from multiple sources and serves it via CSV/JSON APIs.

## Features

- **Automated Job Collection**: Collects jobs from LinkedIn, Google, Mobileye, JobsCoil, and AllJobs
- **Scheduler**: Runs job collection every 6 hours automatically
- **Multiple APIs**: Serves data as CSV, JSON, and statistics
- **CORS Enabled**: Frontend can access from any origin

## Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The server will run on `http://localhost:3001` and start collecting jobs immediately.

## Endpoints

- `GET /jobs.csv` - Returns job data in CSV format
- `GET /jobs` - Returns job data in JSON format
- `GET /stats` - Returns job statistics
- `POST /collect` - Manually trigger job collection
- `GET /scheduler/status` - Get scheduler status
- `GET /health` - Health check endpoint

## Configuration

Edit the `SERVER_IP` and `SERVER_PORT` variables in `src/services/JobService.ts` to match your server configuration.

## Job Collection

The server automatically:
1. Starts job collection when the server starts
2. Runs collection every 6 hours via cron scheduler
3. Collects from all configured sources in parallel
4. Provides real-time job data to the frontend