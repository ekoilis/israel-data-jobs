import { JobCollectionService } from './JobCollectionService';

/**
 * Application Manager - Coordinates the entire job collection system
 * Manages periodic collection every 12 hours and dashboard updates
 */
export class SchedulerService {
  private static instance: SchedulerService;
  private collectionService: JobCollectionService;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private lastRunTime: Date | null = null;
  private nextRunTime: Date | null = null;
  
  // 12 hours in milliseconds
  private readonly COLLECTION_INTERVAL = 12 * 60 * 60 * 1000;
  
  // For demo purposes, use 30 seconds instead of 12 hours
  private readonly DEMO_INTERVAL = 30 * 1000;

  constructor() {
    this.collectionService = JobCollectionService.getInstance();
    this.loadScheduleState();
  }

  static getInstance(): SchedulerService {
    if (!SchedulerService.instance) {
      SchedulerService.instance = new SchedulerService();
    }
    return SchedulerService.instance;
  }

  /**
   * Start the automated collection scheduler
   */
  startScheduler(useDemoInterval = false): void {
    if (this.isRunning) {
      console.log('Scheduler is already running');
      return;
    }

    const interval = useDemoInterval ? this.DEMO_INTERVAL : this.COLLECTION_INTERVAL;
    
    console.log(`Starting job collection scheduler (interval: ${interval / 1000}s)`);
    
    // Run immediately on start
    this.runCollection();
    
    // Schedule recurring collections
    this.intervalId = setInterval(() => {
      this.runCollection();
    }, interval);
    
    this.isRunning = true;
    this.updateNextRunTime(interval);
    this.saveScheduleState();
    
    // Dispatch custom event for UI updates
    window.dispatchEvent(new CustomEvent('schedulerStateChanged', {
      detail: { isRunning: this.isRunning, nextRunTime: this.nextRunTime }
    }));
  }

  /**
   * Stop the automated collection scheduler
   */
  stopScheduler(): void {
    if (!this.isRunning) {
      console.log('Scheduler is not running');
      return;
    }

    console.log('Stopping job collection scheduler');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isRunning = false;
    this.nextRunTime = null;
    this.saveScheduleState();
    
    // Dispatch custom event for UI updates
    window.dispatchEvent(new CustomEvent('schedulerStateChanged', {
      detail: { isRunning: this.isRunning, nextRunTime: this.nextRunTime }
    }));
  }

  /**
   * Run a single collection cycle
   */
  async runCollection(): Promise<void> {
    console.log('Starting scheduled job collection...');
    this.lastRunTime = new Date();
    
    try {
      // Dispatch collection started event
      window.dispatchEvent(new CustomEvent('collectionStarted'));
      
      const results = await this.collectionService.collectAllJobs();
      
      const totalCollected = results.reduce((sum, result) => sum + result.jobsCollected, 0);
      const errors = results.filter(result => !result.success);
      
      console.log(`Collection completed: ${totalCollected} jobs collected from ${results.length} sources`);
      
      if (errors.length > 0) {
        console.warn(`Collection errors from ${errors.length} sources:`, errors);
      }
      
      // Dispatch collection completed event
      window.dispatchEvent(new CustomEvent('collectionCompleted', {
        detail: { results, totalCollected, errors }
      }));
      
    } catch (error) {
      console.error('Collection failed:', error);
      
      // Dispatch collection error event
      window.dispatchEvent(new CustomEvent('collectionError', {
        detail: { error }
      }));
    }
    
    this.saveScheduleState();
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRunTime: this.lastRunTime,
      nextRunTime: this.nextRunTime,
      intervalHours: this.COLLECTION_INTERVAL / (60 * 60 * 1000)
    };
  }

  /**
   * Calculate next run time
   */
  private updateNextRunTime(interval: number): void {
    if (this.isRunning) {
      this.nextRunTime = new Date(Date.now() + interval);
    }
  }

  /**
   * Save scheduler state to localStorage
   */
  private saveScheduleState(): void {
    const state = {
      isRunning: this.isRunning,
      lastRunTime: this.lastRunTime?.toISOString(),
      nextRunTime: this.nextRunTime?.toISOString()
    };
    localStorage.setItem('scheduler_state', JSON.stringify(state));
  }

  /**
   * Load scheduler state from localStorage
   */
  private loadScheduleState(): void {
    const stateStr = localStorage.getItem('scheduler_state');
    if (!stateStr) return;
    
    try {
      const state = JSON.parse(stateStr);
      this.lastRunTime = state.lastRunTime ? new Date(state.lastRunTime) : null;
      this.nextRunTime = state.nextRunTime ? new Date(state.nextRunTime) : null;
      
      // Don't auto-restart on page reload for safety
      this.isRunning = false;
    } catch (error) {
      console.error('Error loading scheduler state:', error);
    }
  }

  /**
   * Get time until next collection
   */
  getTimeUntilNext(): string {
    if (!this.nextRunTime || !this.isRunning) return 'Not scheduled';
    
    const now = new Date();
    const diff = this.nextRunTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Running soon...';
    
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((diff % (60 * 1000)) / 1000);
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  }
}