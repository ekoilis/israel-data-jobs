const cron = require('node-cron');

class SchedulerService {
  constructor(jobCollectionService) {
    this.jobCollectionService = jobCollectionService;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) {
      console.log('Scheduler is already running');
      return;
    }

    console.log('Starting job collection scheduler...');
    
    // Run initial collection immediately
    this.runInitialCollection();
    
    // Schedule job collection every 6 hours
    this.cronJob = cron.schedule('0 */6 * * *', async () => {
      console.log('Scheduled job collection triggered');
      await this.jobCollectionService.collectAllJobs();
    }, {
      scheduled: true,
      timezone: 'Asia/Jerusalem'
    });

    this.isRunning = true;
    console.log('Scheduler started - jobs will be collected every 6 hours');
  }

  async runInitialCollection() {
    console.log('Running initial job collection...');
    try {
      await this.jobCollectionService.collectAllJobs();
      console.log('Initial job collection completed successfully');
    } catch (error) {
      console.error('Error during initial job collection:', error);
    }
  }

  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.isRunning = false;
      console.log('Scheduler stopped');
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      nextRun: this.cronJob ? 'Every 6 hours' : 'Not scheduled',
      lastCollection: this.jobCollectionService.lastCollectionTime
    };
  }

  // Manual trigger for job collection
  async triggerCollection() {
    console.log('Manual job collection triggered');
    return await this.jobCollectionService.collectAllJobs();
  }
}

module.exports = SchedulerService;