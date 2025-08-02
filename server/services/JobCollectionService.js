const JSearchCollector = require('../collectors/JSearchCollector');
const GoogleCollector = require('../collectors/GoogleCollector');
const MobileyeCollector = require('../collectors/MobileyeCollector');
const JobsCoilCollector = require('../collectors/JobsCoilCollector');
const AllJobsCollector = require('../collectors/AllJobsCollector');

class JobCollectionService {
  constructor() {
    this.collectors = [
      new JSearchCollector(),
      new GoogleCollector(),
      new MobileyeCollector(),
      new JobsCoilCollector(),
      new AllJobsCollector()
    ];
    this.allJobs = [];
    this.lastCollectionTime = null;
  }

  async collectAllJobs() {
    console.log('Starting job collection from all sources...');
    const startTime = Date.now();
    
    try {
      // Collect jobs from all sources in parallel
      const collectionPromises = this.collectors.map(async (collector) => {
        try {
          return await collector.collectJobs();
        } catch (error) {
          console.error(`Error in ${collector.source} collector:`, error.message);
          return [];
        }
      });

      const results = await Promise.all(collectionPromises);
      
      // Flatten and combine all results
      this.allJobs = results.flat();
      this.lastCollectionTime = new Date();
      
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      console.log(`Job collection completed in ${duration}s`);
      console.log(`Total jobs collected: ${this.allJobs.length}`);
      
      // Log breakdown by source
      const sourceBreakdown = {};
      this.allJobs.forEach(job => {
        sourceBreakdown[job.source] = (sourceBreakdown[job.source] || 0) + 1;
      });
      
      console.log('Jobs by source:', sourceBreakdown);
      
      return this.allJobs;
    } catch (error) {
      console.error('Error during job collection:', error);
      return this.allJobs;
    }
  }

  getJobs() {
    return this.allJobs;
  }

  getStats() {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const newJobs = this.allJobs.filter(job => 
      new Date(job.collectionDate) > twentyFourHoursAgo
    ).length;

    const companiesSet = new Set(this.allJobs.map(job => job.company));
    
    const sourceDistribution = {};
    const experienceLevelDistribution = {};
    
    this.allJobs.forEach(job => {
      sourceDistribution[job.source] = (sourceDistribution[job.source] || 0) + 1;
      experienceLevelDistribution[job.experienceLevel] = (experienceLevelDistribution[job.experienceLevel] || 0) + 1;
    });

    return {
      totalJobs: this.allJobs.length,
      newJobs,
      companiesCount: companiesSet.size,
      sourceDistribution,
      experienceLevelDistribution,
      lastCollectionDate: this.lastCollectionTime?.toISOString() || new Date().toISOString()
    };
  }

  // Convert jobs to CSV format
  toCSV() {
    if (this.allJobs.length === 0) return '';

    const headers = [
      'id', 'title', 'company', 'location', 'description', 'url', 
      'source', 'postDate', 'collectionDate', 'salaryRange', 
      'jobType', 'experienceLevel', 'tags'
    ];

    const csvRows = [
      headers.join(','),
      ...this.allJobs.map(job => [
        this.escapeCSV(job.id),
        this.escapeCSV(job.title),
        this.escapeCSV(job.company),
        this.escapeCSV(job.location),
        this.escapeCSV(job.description),
        this.escapeCSV(job.url),
        this.escapeCSV(job.source),
        this.escapeCSV(job.postDate),
        this.escapeCSV(job.collectionDate),
        this.escapeCSV(job.salaryRange || ''),
        this.escapeCSV(job.jobType),
        this.escapeCSV(job.experienceLevel),
        this.escapeCSV((job.tags || []).join('; '))
      ].join(','))
    ];

    return csvRows.join('\n');
  }

  escapeCSV(value) {
    if (!value) return '';
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  }
}

module.exports = JobCollectionService;