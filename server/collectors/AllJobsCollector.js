const axios = require('axios');
const cheerio = require('cheerio');

class AllJobsCollector {
  constructor() {
    this.source = 'AllJobs';
    this.baseUrl = 'https://www.alljobs.co.il';
  }

  async collectJobs(keywords = 'data science', location = 'Israel') {
    try {
      console.log(`Collecting jobs from ${this.source}...`);
      
      // Simulate job collection from AllJobs
      const mockJobs = [
        {
          id: `alljobs-${Date.now()}-1`,
          title: 'Junior Data Scientist',
          company: 'StartupX',
          location: 'Tel Aviv, Israel',
          description: 'Entry-level position for recent graduates in data science or related fields.',
          url: 'https://www.alljobs.co.il/job/junior-data-scientist',
          source: this.source,
          postDate: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString(),
          collectionDate: new Date().toISOString(),
          salaryRange: '8,000 - 14,000 ILS',
          jobType: 'Full-time',
          experienceLevel: 'Entry',
          tags: ['Python', 'Statistics', 'Pandas', 'Scikit-learn']
        },
        {
          id: `alljobs-${Date.now()}-2`,
          title: 'Data Science Manager',
          company: 'BigCorp',
          location: 'Ramat Gan, Israel',
          description: 'Lead a team of data scientists and drive strategic data initiatives.',
          url: 'https://www.alljobs.co.il/job/data-science-manager',
          source: this.source,
          postDate: new Date(Date.now() - Math.random() * 12 * 24 * 60 * 60 * 1000).toISOString(),
          collectionDate: new Date().toISOString(),
          salaryRange: '25,000 - 45,000 ILS',
          jobType: 'Full-time',
          experienceLevel: 'Senior',
          tags: ['Leadership', 'Strategy', 'Machine Learning', 'Team Management']
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

module.exports = AllJobsCollector;