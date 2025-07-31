const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const JobCollectionService = require('./services/JobCollectionService');
const SchedulerService = require('./services/SchedulerService');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize services
const jobCollectionService = new JobCollectionService();
const schedulerService = new SchedulerService(jobCollectionService);

// Enable CORS for all origins
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files
app.use(express.static('public'));

// API endpoint to serve jobs as CSV
app.get('/jobs.csv', (req, res) => {
  try {
    const csvData = jobCollectionService.toCSV();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="jobs.csv"');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(csvData);
  } catch (error) {
    console.error('Error generating CSV:', error);
    res.status(500).json({ error: 'Failed to generate CSV' });
  }
});

// API endpoint to get jobs as JSON
app.get('/jobs', (req, res) => {
  try {
    const jobs = jobCollectionService.getJobs();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(jobs);
  } catch (error) {
    console.error('Error getting jobs:', error);
    res.status(500).json({ error: 'Failed to get jobs' });
  }
});

// API endpoint to get job statistics
app.get('/stats', (req, res) => {
  try {
    const stats = jobCollectionService.getStats();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// API endpoint to manually trigger job collection
app.post('/collect', async (req, res) => {
  try {
    console.log('Manual job collection triggered via API');
    const jobs = await schedulerService.triggerCollection();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({ 
      success: true, 
      message: `Collected ${jobs.length} jobs`,
      totalJobs: jobs.length 
    });
  } catch (error) {
    console.error('Error during manual collection:', error);
    res.status(500).json({ error: 'Failed to collect jobs' });
  }
});

// API endpoint to get scheduler status
app.get('/scheduler/status', (req, res) => {
  try {
    const status = schedulerService.getStatus();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(status);
  } catch (error) {
    console.error('Error getting scheduler status:', error);
    res.status(500).json({ error: 'Failed to get scheduler status' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    totalJobs: jobCollectionService.getJobs().length
  });
});

// Start the scheduler when server starts
schedulerService.start();

app.listen(PORT, () => {
  console.log(`Jobs CSV server running on http://localhost:${PORT}`);
  console.log(`CSV endpoint: http://localhost:${PORT}/jobs.csv`);
  console.log(`Jobs API: http://localhost:${PORT}/jobs`);
  console.log(`Stats API: http://localhost:${PORT}/stats`);
  console.log(`Manual collection: POST http://localhost:${PORT}/collect`);
});