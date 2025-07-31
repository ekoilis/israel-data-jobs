const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all origins
app.use(cors());

// Serve static files
app.use(express.static('public'));

// Sample jobs data
const sampleJobs = [
  {
    id: 'job-1',
    title: 'Senior Data Scientist',
    company: 'Tech Corp',
    location: 'Tel Aviv, Israel',
    description: 'Looking for a senior data scientist with experience in machine learning and Python.',
    url: 'https://example.com/job1',
    source: 'LinkedIn',
    postDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    collectionDate: new Date().toISOString(),
    salaryRange: '15,000 - 25,000 ILS',
    jobType: 'Full-time',
    experienceLevel: 'Senior',
    tags: 'Python; Machine Learning; SQL'
  },
  {
    id: 'job-2',
    title: 'ML Engineer',
    company: 'AI Startup',
    location: 'Jerusalem, Israel',
    description: 'Join our team to build cutting-edge AI solutions using TensorFlow and PyTorch.',
    url: 'https://example.com/job2',
    source: 'Google',
    postDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    collectionDate: new Date().toISOString(),
    salaryRange: '12,000 - 20,000 ILS',
    jobType: 'Full-time',
    experienceLevel: 'Mid',
    tags: 'TensorFlow; PyTorch; AWS'
  },
  {
    id: 'job-3',
    title: 'Backend Developer',
    company: 'Fintech Solutions',
    location: 'Haifa, Israel',
    description: 'Seeking a backend developer with Node.js and database experience.',
    url: 'https://example.com/job3',
    source: 'Other',
    postDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    collectionDate: new Date().toISOString(),
    salaryRange: '10,000 - 18,000 ILS',
    jobType: 'Full-time',
    experienceLevel: 'Mid',
    tags: 'Node.js; MongoDB; REST API'
  }
];

// Convert jobs to CSV format
function jobsToCSV(jobs) {
  const headers = [
    'id', 'title', 'company', 'location', 'description', 'url', 
    'source', 'postDate', 'collectionDate', 'salaryRange', 
    'jobType', 'experienceLevel', 'tags'
  ];

  const csvRows = [
    headers.join(','),
    ...jobs.map(job => [
      escapeCSV(job.id),
      escapeCSV(job.title),
      escapeCSV(job.company),
      escapeCSV(job.location),
      escapeCSV(job.description),
      escapeCSV(job.url),
      escapeCSV(job.source),
      escapeCSV(job.postDate),
      escapeCSV(job.collectionDate),
      escapeCSV(job.salaryRange || ''),
      escapeCSV(job.jobType),
      escapeCSV(job.experienceLevel),
      escapeCSV(job.tags)
    ].join(','))
  ];

  return csvRows.join('\n');
}

function escapeCSV(value) {
  if (!value) return '';
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

// API endpoint to serve jobs as CSV
app.get('/jobs.csv', (req, res) => {
  try {
    const csvData = jobsToCSV(sampleJobs);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="jobs.csv"');
    res.send(csvData);
  } catch (error) {
    console.error('Error generating CSV:', error);
    res.status(500).json({ error: 'Failed to generate CSV' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Jobs CSV server running on http://localhost:${PORT}`);
  console.log(`CSV endpoint: http://localhost:${PORT}/jobs.csv`);
});