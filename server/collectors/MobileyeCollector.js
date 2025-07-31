const axios = require('axios');
const cheerio = require('cheerio');

class MobileyeCollector {
  constructor() {
    this.source = 'Mobileye';
    this.baseUrl = 'https://www.mobileye.com/careers';
  }

  async collectJobs() {
    try {
      console.log(`Collecting jobs from ${this.source}...`);
      
      // Simulate job collection from Mobileye careers page
      const mockJobs = [
        {
          id: `mobileye-${Date.now()}-1`,
          title: 'Computer Vision Engineer',
          company: 'Mobileye',
          location: 'Jerusalem, Israel',
          description: 'Join our computer vision team to develop autonomous driving technologies.',
          url: 'https://www.mobileye.com/careers/computer-vision-engineer',
          source: this.source,
          postDate: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
          collectionDate: new Date().toISOString(),
          salaryRange: '20,000 - 35,000 ILS',
          jobType: 'Full-time',
          experienceLevel: 'Senior',
          tags: ['Computer Vision', 'C++', 'OpenCV', 'Autonomous Driving']
        },
        {
          id: `mobileye-${Date.now()}-2`,
          title: 'Deep Learning Engineer',
          company: 'Mobileye',
          location: 'Jerusalem, Israel',
          description: 'Develop deep learning algorithms for perception in autonomous vehicles.',
          url: 'https://www.mobileye.com/careers/deep-learning-engineer',
          source: this.source,
          postDate: new Date(Date.now() - Math.random() * 8 * 24 * 60 * 60 * 1000).toISOString(),
          collectionDate: new Date().toISOString(),
          salaryRange: '22,000 - 40,000 ILS',
          jobType: 'Full-time',
          experienceLevel: 'Senior',
          tags: ['Deep Learning', 'PyTorch', 'TensorFlow', 'CUDA']
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

module.exports = MobileyeCollector;