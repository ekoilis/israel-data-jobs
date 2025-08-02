#!/usr/bin/env node

const JobCollectionService = require('./services/JobCollectionService');
const fs = require('fs');
const path = require('path');

/**
 * Local job crawler script
 * Collects jobs from all sources once and saves to CSV file locally only
 * Does not push to GitHub
 */
class LocalJobCrawler {
  constructor() {
    this.jobCollectionService = new JobCollectionService();
    this.outputDir = path.join(__dirname, 'output');
  }

  async run() {
    console.log('🚀 Starting local job crawler...');
    console.log('='.repeat(50));
    
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
      
      // Save to public/cvs.txt for dashboard use
      const publicDir = path.join(__dirname, '..', 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      const publicCvsPath = path.join(publicDir, 'cvs.txt');
      fs.writeFileSync(publicCvsPath, csvData, 'utf8');
      
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
      console.log('📁 Files saved locally:');
      console.log(`   CSV: ${filepath}`);
      console.log(`   Latest: ${latestPath}`);
      console.log(`   Public: ${publicCvsPath}`);
      console.log(`   Stats: ${statsPath}`);
      console.log('');
      console.log('🔍 Jobs by source:');
      Object.entries(stats.sourceDistribution).forEach(([source, count]) => {
        console.log(`   ${source}: ${count} jobs`);
      });
      
      console.log('');
      console.log('📝 Note: Files saved locally only - no GitHub push performed');
      
    } catch (error) {
      console.error('❌ Error during job collection:', error.message);
      process.exit(1);
    }
  }
}

// Run the crawler if this script is executed directly
if (require.main === module) {
  const crawler = new LocalJobCrawler();
  crawler.run()
    .then(() => {
      console.log('');
      console.log('🎉 Local crawler finished successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Local crawler failed:', error.message);
      process.exit(1);
    });
}

module.exports = LocalJobCrawler;