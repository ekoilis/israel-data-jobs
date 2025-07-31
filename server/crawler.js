#!/usr/bin/env node

const JobCollectionService = require('./services/JobCollectionService');
const fs = require('fs');
const path = require('path');

/**
 * Standalone job crawler script
 * Collects jobs from all sources once and saves to CSV file
 */
class JobCrawler {
  constructor() {
    this.jobCollectionService = new JobCollectionService();
    this.outputDir = path.join(__dirname, 'output');
  }

  async run() {
    console.log('🚀 Starting job crawler...');
    console.log('=' * 50);
    
    try {
      // Ensure output directory exists
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
      }

      // Collect jobs from all sources
      const jobs = await this.jobCollectionService.collectAllJobs();
      
      if (jobs.length === 0) {
        console.log('⚠️  No jobs collected');
        return;
      }

      // Generate CSV data
      const csvData = this.jobCollectionService.toCSV();
      
      // Save to file with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `jobs-${timestamp}.csv`;
      const filepath = path.join(this.outputDir, filename);
      
      fs.writeFileSync(filepath, csvData, 'utf8');
      
      // Also save as latest.csv for easy access
      const latestPath = path.join(this.outputDir, 'latest.csv');
      fs.writeFileSync(latestPath, csvData, 'utf8');
      
      // Generate statistics
      const stats = this.jobCollectionService.getStats();
      const statsFilename = `stats-${timestamp}.json`;
      const statsPath = path.join(this.outputDir, statsFilename);
      
      fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2), 'utf8');
      
      // Print results
      console.log('✅ Job collection completed successfully!');
      console.log('');
      console.log('📊 Results:');
      console.log(`   Total jobs collected: ${jobs.length}`);
      console.log(`   Companies: ${stats.companiesCount}`);
      console.log(`   New jobs (24h): ${stats.newJobs}`);
      console.log('');
      console.log('📁 Files saved:');
      console.log(`   CSV: ${filepath}`);
      console.log(`   Latest: ${latestPath}`);
      console.log(`   Stats: ${statsPath}`);
      console.log('');
      console.log('🔍 Jobs by source:');
      Object.entries(stats.sourceDistribution).forEach(([source, count]) => {
        console.log(`   ${source}: ${count} jobs`);
      });
      
    } catch (error) {
      console.error('❌ Error during job collection:', error.message);
      process.exit(1);
    }
  }
}

// Run the crawler if this script is executed directly
if (require.main === module) {
  const crawler = new JobCrawler();
  crawler.run()
    .then(() => {
      console.log('');
      console.log('🎉 Crawler finished successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Crawler failed:', error.message);
      process.exit(1);
    });
}

module.exports = JobCrawler;