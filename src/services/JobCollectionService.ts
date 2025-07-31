import { JobPosting, CollectionResult } from '@/types/job';

/**
 * Job Collection Service - Coordinates data collection from multiple sources
 * This service manages data collection adapters and orchestrates the collection process
 */
export class JobCollectionService {
  private collectors: JobCollector[] = [];
  private static instance: JobCollectionService;

  constructor() {
    this.initializeCollectors();
  }

  static getInstance(): JobCollectionService {
    if (!JobCollectionService.instance) {
      JobCollectionService.instance = new JobCollectionService();
    }
    return JobCollectionService.instance;
  }

  /**
   * Initialize all data collection adapters
   */
  private initializeCollectors(): void {
    this.collectors = [
      new LinkedInCollector(),
      new GoogleCollector(),
      new MetaCollector(),
      new MobileyeCollector()
    ];
  }

  /**
   * Run collection from all sources
   */
  async collectAllJobs(): Promise<CollectionResult[]> {
    console.log('Starting job collection from all sources...');
    const results: CollectionResult[] = [];

    for (const collector of this.collectors) {
      try {
        const result = await collector.collect();
        results.push(result);
        console.log(`Collection completed for ${collector.source}: ${result.jobsCollected} jobs`);
      } catch (error) {
        console.error(`Collection failed for ${collector.source}:`, error);
        results.push({
          success: false,
          jobsCollected: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          source: collector.source,
          timestamp: new Date().toISOString()
        });
      }
    }

    return results;
  }

  /**
   * Get all collected jobs from CSV storage
   */
  async getAllJobs(): Promise<JobPosting[]> {
    return await CSVStorageService.readJobs();
  }
}

/**
 * Abstract base class for job collectors
 */
abstract class JobCollector {
  abstract source: string;
  
  abstract collect(): Promise<CollectionResult>;
  
  protected generateMockJobs(count: number): JobPosting[] {
    const titles = [
      'Senior Data Scientist', 'Data Scientist', 'ML Engineer', 
      'Data Analyst', 'Research Scientist', 'AI Engineer',
      'Principal Data Scientist', 'Staff Data Scientist'
    ];
    
    const locations = ['Tel Aviv', 'Jerusalem', 'Haifa', 'Herzliya', 'Petah Tikva'];
    const experienceLevels: JobPosting['experienceLevel'][] = ['Entry', 'Mid', 'Senior', 'Executive'];
    const jobTypes: JobPosting['jobType'][] = ['Full-time', 'Part-time', 'Contract'];
    
    const jobs: JobPosting[] = [];
    
    for (let i = 0; i < count; i++) {
      const postDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      
      jobs.push({
        id: `${this.source.toLowerCase()}_${Date.now()}_${i}`,
        title: titles[Math.floor(Math.random() * titles.length)],
        company: this.getCompanyName(),
        location: locations[Math.floor(Math.random() * locations.length)],
        description: this.generateJobDescription(),
        url: `https://${this.source.toLowerCase()}.com/jobs/${Date.now()}_${i}`,
        source: this.source as JobPosting['source'],
        postDate: postDate.toISOString().split('T')[0],
        collectionDate: new Date().toISOString().split('T')[0],
        salaryRange: this.generateSalaryRange(),
        jobType: jobTypes[Math.floor(Math.random() * jobTypes.length)],
        experienceLevel: experienceLevels[Math.floor(Math.random() * experienceLevels.length)],
        tags: this.generateTags()
      });
    }
    
    return jobs;
  }
  
  protected abstract getCompanyName(): string;
  
  protected generateJobDescription(): string {
    const descriptions = [
      'Exciting opportunity to work with large-scale data and machine learning models.',
      'Join our team to develop cutting-edge AI solutions for real-world problems.',
      'Looking for a data scientist to drive insights and build predictive models.',
      'Work on advanced analytics and data-driven decision making.',
      'Opportunity to work with big data technologies and statistical modeling.'
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }
  
  protected generateSalaryRange(): string {
    const ranges = ['150k-200k ILS', '200k-300k ILS', '300k-400k ILS', '120k-180k ILS'];
    return ranges[Math.floor(Math.random() * ranges.length)];
  }
  
  protected generateTags(): string[] {
    const allTags = ['Python', 'R', 'SQL', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'AWS', 'Docker', 'Kubernetes'];
    const count = Math.floor(Math.random() * 5) + 3;
    return allTags.sort(() => 0.5 - Math.random()).slice(0, count);
  }
}

/**
 * LinkedIn job collector adapter
 */
class LinkedInCollector extends JobCollector {
  source = 'LinkedIn';
  
  async collect(): Promise<CollectionResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const jobs = this.generateMockJobs(Math.floor(Math.random() * 15) + 5);
    await CSVStorageService.appendJobs(jobs);
    
    return {
      success: true,
      jobsCollected: jobs.length,
      errors: [],
      source: this.source,
      timestamp: new Date().toISOString()
    };
  }
  
  protected getCompanyName(): string {
    const companies = ['Microsoft Israel', 'Intel Israel', 'NVIDIA Israel', 'Amazon Israel', 'Wix', 'Check Point'];
    return companies[Math.floor(Math.random() * companies.length)];
  }
}

/**
 * Google careers collector adapter
 */
class GoogleCollector extends JobCollector {
  source = 'Google';
  
  async collect(): Promise<CollectionResult> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const jobs = this.generateMockJobs(Math.floor(Math.random() * 8) + 2);
    await CSVStorageService.appendJobs(jobs);
    
    return {
      success: true,
      jobsCollected: jobs.length,
      errors: [],
      source: this.source,
      timestamp: new Date().toISOString()
    };
  }
  
  protected getCompanyName(): string {
    return 'Google';
  }
}

/**
 * Meta careers collector adapter
 */
class MetaCollector extends JobCollector {
  source = 'Meta';
  
  async collect(): Promise<CollectionResult> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const jobs = this.generateMockJobs(Math.floor(Math.random() * 6) + 1);
    await CSVStorageService.appendJobs(jobs);
    
    return {
      success: true,
      jobsCollected: jobs.length,
      errors: [],
      source: this.source,
      timestamp: new Date().toISOString()
    };
  }
  
  protected getCompanyName(): string {
    return 'Meta';
  }
}

/**
 * Mobileye careers collector adapter
 */
class MobileyeCollector extends JobCollector {
  source = 'Mobileye';
  
  async collect(): Promise<CollectionResult> {
    await new Promise(resolve => setTimeout(resolve, 900));
    
    const jobs = this.generateMockJobs(Math.floor(Math.random() * 10) + 3);
    await CSVStorageService.appendJobs(jobs);
    
    return {
      success: true,
      jobsCollected: jobs.length,
      errors: [],
      source: this.source,
      timestamp: new Date().toISOString()
    };
  }
  
  protected getCompanyName(): string {
    return 'Mobileye';
  }
}

/**
 * CSV Storage Service - Handles reading/writing job data to CSV format
 */
export class CSVStorageService {
  private static readonly STORAGE_KEY = 'job_postings_csv';
  
  /**
   * Convert JobPosting to CSV row
   */
  private static jobToCSVRow(job: JobPosting): string {
    const escapeCsvField = (field: string): string => {
      if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    };
    
    return [
      job.id,
      escapeCsvField(job.title),
      escapeCsvField(job.company),
      escapeCsvField(job.location),
      escapeCsvField(job.description),
      job.url,
      job.source,
      job.postDate,
      job.collectionDate,
      job.salaryRange || '',
      job.jobType,
      job.experienceLevel,
      escapeCsvField(job.tags.join(';'))
    ].join(',');
  }
  
  /**
   * Convert CSV row to JobPosting
   */
  private static csvRowToJob(row: string): JobPosting | null {
    try {
      const fields = this.parseCSVRow(row);
      if (fields.length < 13) return null;
      
      return {
        id: fields[0],
        title: fields[1],
        company: fields[2],
        location: fields[3],
        description: fields[4],
        url: fields[5],
        source: fields[6] as JobPosting['source'],
        postDate: fields[7],
        collectionDate: fields[8],
        salaryRange: fields[9] || undefined,
        jobType: fields[10] as JobPosting['jobType'],
        experienceLevel: fields[11] as JobPosting['experienceLevel'],
        tags: fields[12] ? fields[12].split(';') : []
      };
    } catch (error) {
      console.error('Error parsing CSV row:', error);
      return null;
    }
  }
  
  /**
   * Parse CSV row handling quoted fields
   */
  private static parseCSVRow(row: string): string[] {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      
      if (char === '"') {
        if (inQuotes && row[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        fields.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    fields.push(current);
    return fields;
  }
  
  /**
   * Get CSV header
   */
  private static getCSVHeader(): string {
    return 'id,title,company,location,description,url,source,postDate,collectionDate,salaryRange,jobType,experienceLevel,tags';
  }
  
  /**
   * Read all jobs from localStorage
   */
  static async readJobs(): Promise<JobPosting[]> {
    const csvData = localStorage.getItem(this.STORAGE_KEY);
    if (!csvData) return [];
    
    const lines = csvData.split('\n').filter(line => line.trim());
    if (lines.length <= 1) return []; // No data or only header
    
    const jobs: JobPosting[] = [];
    for (let i = 1; i < lines.length; i++) { // Skip header
      const job = this.csvRowToJob(lines[i]);
      if (job) jobs.push(job);
    }
    
    return jobs;
  }
  
  /**
   * Append new jobs to CSV storage
   */
  static async appendJobs(newJobs: JobPosting[]): Promise<void> {
    const existingJobs = await this.readJobs();
    const existingIds = new Set(existingJobs.map(job => job.id));
    
    // Filter out duplicates
    const uniqueNewJobs = newJobs.filter(job => !existingIds.has(job.id));
    
    if (uniqueNewJobs.length === 0) return;
    
    const allJobs = [...existingJobs, ...uniqueNewJobs];
    await this.saveJobs(allJobs);
  }
  
  /**
   * Save all jobs to CSV storage
   */
  static async saveJobs(jobs: JobPosting[]): Promise<void> {
    const csvLines = [this.getCSVHeader()];
    csvLines.push(...jobs.map(job => this.jobToCSVRow(job)));
    
    localStorage.setItem(this.STORAGE_KEY, csvLines.join('\n'));
  }
  
  /**
   * Export CSV data for download
   */
  static async exportCSV(): Promise<string> {
    const csvData = localStorage.getItem(this.STORAGE_KEY);
    return csvData || this.getCSVHeader();
  }
}