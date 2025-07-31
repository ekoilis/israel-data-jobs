#!/usr/bin/env node

const JobCollectionService = require('./services/JobCollectionService');
const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git');

/**
 * Standalone job crawler script
 * Collects jobs from all sources once and saves to CSV file
 */
class JobCrawler {
  constructor() {
    this.jobCollectionService = new JobCollectionService();
    this.outputDir = path.join(__dirname, 'output');
    this.githubRepo = 'https://github.com/ekoilis/israel-data-jobs.git';
    this.repoDir = path.join(__dirname, 'israel-data-jobs');
    this.isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
    this.githubWorkspace = process.env.GITHUB_WORKSPACE;
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
      console.log('📁 Files saved:');
      console.log(`   CSV: ${filepath}`);
      console.log(`   Latest: ${latestPath}`);
      console.log(`   Stats: ${statsPath}`);
      console.log('');
      console.log('🔍 Jobs by source:');
      Object.entries(stats.sourceDistribution).forEach(([source, count]) => {
        console.log(`   ${source}: ${count} jobs`);
      });
      
      // Push to GitHub repository
      if (this.isGitHubActions) {
        await this.handleGitHubActions(latestPath);
      } else {
        await this.pushToGitHub(latestPath);
      }
      
    } catch (error) {
      console.error('❌ Error during job collection:', error.message);
      process.exit(1);
    }
  }

  async handleGitHubActions(csvFilePath) {
    console.log('');
    console.log('🔧 Running in GitHub Actions environment');
    
    try {
      // In GitHub Actions, we're already in the repo directory
      const publicDir = this.githubWorkspace ? 
        path.join(this.githubWorkspace, 'public') : 
        path.join(process.cwd(), 'public');
      
      // Ensure public directory exists
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
        console.log('   Created public/ directory');
      }

      // Copy the CSV file to the public directory
      const targetPath = path.join(publicDir, 'jobs.csv');
      fs.copyFileSync(csvFilePath, targetPath);
      console.log('   ✅ Copied jobs.csv to public/ directory');
      
      console.log('   📝 File ready for GitHub Actions workflow to commit and push');
      
    } catch (error) {
      console.error('❌ Error handling GitHub Actions:', error.message);
      throw error;
    }
  }

  async pushToGitHub(csvFilePath) {
    console.log('');
    console.log('📤 Pushing to GitHub repository (local mode)...');
    
    try {
      // Clone or pull the repository
      let git;
      if (fs.existsSync(this.repoDir)) {
        // Repository exists, pull latest changes
        git = simpleGit(this.repoDir);
        console.log('   Pulling latest changes...');
        await git.pull('origin', 'main');
      } else {
        // Clone the repository
        console.log('   Cloning repository...');
        git = simpleGit();
        await git.clone(this.githubRepo, this.repoDir);
        git = simpleGit(this.repoDir);
      }

      // Ensure public directory exists
      const publicDir = path.join(this.repoDir, 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      // Copy the CSV file to the public directory
      const targetPath = path.join(publicDir, 'jobs.csv');
      fs.copyFileSync(csvFilePath, targetPath);
      console.log('   Copied jobs.csv to public/ directory');

      // Add, commit, and push the changes
      await git.add('public/jobs.csv');
      
      const timestamp = new Date().toISOString();
      const commitMessage = `Update jobs data - ${timestamp}`;
      
      await git.commit(commitMessage);
      console.log(`   Committed changes: ${commitMessage}`);
      
      await git.push('origin', 'main');
      console.log('   Pushed to GitHub successfully!');
      
      console.log('✅ GitHub push completed');
      
    } catch (error) {
      console.error('❌ Error pushing to GitHub:', error.message);
      throw error;
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