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

## Usage

### Server Mode (Continuous)
```bash
npm start
```
Runs the server with automatic job collection every 6 hours.

### Crawler Mode (One-time)
```bash
npm run crawl
```
Runs job collection once and saves results to `output/` directory.

## Output Files

When using crawler mode, files are saved to `server/output/`:
- `jobs-[timestamp].csv` - Timestamped job data
- `latest.csv` - Most recent job data
- `stats-[timestamp].json` - Collection statistics