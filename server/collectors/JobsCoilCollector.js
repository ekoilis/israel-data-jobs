const axios = require('axios');
const cheerio = require('cheerio');

class JobsCoilCollector {
  constructor() {
    this.source = 'JobsCoil';
    this.baseUrl = 'https://www.jobscoil.co.il';
  }

  async collectJobs(keywords = 'data scientist', location = 'Israel') {
    try {
      console.log(`Collecting jobs from ${this.source}...`);
      
      // Simulate job collection from JobsCoil
      const mockJobs = [
        {
          id: `jobscoil-${Date.now()}-1`,
          title: 'Business Intelligence Developer',
          company: 'Enterprise Solutions',
          location: 'Herzliya, Israel',
          description: 'Develop BI solutions and create data visualizations for business stakeholders.',
          url: 'https://www.jobscoil.co.il/job/bi-developer',
          source: this.source,
          postDate: new Date(Date.now() - Math.random() * 6 * 24 * 60 * 60 * 1000).toISOString(),
          collectionDate: new Date().toISOString(),
          salaryRange: '12,000 - 20,000 ILS',
          jobType: 'Full-time',
          experienceLevel: 'Mid',
          tags: ['Power BI', 'SQL Server', 'Tableau', 'ETL']
        },
        {
          id: `jobscoil-${Date.now()}-2`,
          title: 'Data Engineer',
          company: 'Cloud Solutions Inc',
          location: 'Tel Aviv, Israel',
          description: 'Build and maintain data pipelines for large-scale data processing.',
          url: 'https://www.jobscoil.co.il/job/data-engineer',
          source: this.source,
          postDate: new Date(Date.now() - Math.random() * 4 * 24 * 60 * 60 * 1000).toISOString(),
          collectionDate: new Date().toISOString(),
          salaryRange: '16,000 - 28,000 ILS',
          jobType: 'Full-time',
          experienceLevel: 'Mid',
          tags: ['Apache Spark', 'Kafka', 'AWS', 'Python']
        }
      ];

      console.log(`Collected ${mockJobs.length} jobs from ${this.source}`);
      return mockJobs;
    } catch (error) {
      console.error(`Error collecting jobs from ${this.source}:`, error.message);
      return [];
    }
  }
}

module.exports = JobsCoilCollector;