# Jobs CSV Server

A simple Node.js server that serves job data in CSV format.

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

The server will run on `http://localhost:3001` by default.

## Endpoints

- `GET /jobs.csv` - Returns job data in CSV format
- `GET /health` - Health check endpoint

## Configuration

Edit the `SERVER_IP` and `SERVER_PORT` variables in `src/services/JobService.ts` to match your server configuration.

## Adding Your Own Jobs

Edit the `sampleJobs` array in `jobs-server.js` to add your own job data, or modify the server to read from a database or external API.