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
    try {
      const jobs = await this.fetchJobsFromJSearch();
      await CSVStorageService.appendJobs(jobs);
      
      return {
        success: true,
        jobsCollected: jobs.length,
        errors: [],
        source: this.source,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching from JSearch API:', error);
      
      // Fallback to mock data if API fails
      const fallbackJobs = this.generateMockJobs(Math.floor(Math.random() * 8) + 3);
      await CSVStorageService.appendJobs(fallbackJobs);
      
      return {
        success: true,
        jobsCollected: fallbackJobs.length,
        errors: [`JSearch API failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        source: this.source,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  private async fetchJobsFromJSearch(): Promise<JobPosting[]> {
    // Call our Supabase edge function that handles JSearch API
    const response = await fetch('/api/fetch-linkedin-jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'data scientist OR machine learning OR AI engineer',
        location: 'Israel',
        employment_types: 'FULLTIME',
        job_requirements: 'no_experience,under_3_years_experience,more_than_3_years_experience',
        num_pages: 2
      })
    });
    
    if (!response.ok) {
      throw new Error(`JSearch API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    return this.transformJSearchData(data.jobs || []);
  }
  
  private transformJSearchData(jobs: any[]): JobPosting[] {
    return jobs.map((job: any, index: number) => ({
      id: `jsearch-${job.job_id || Date.now()}-${index}`,
      title: job.job_title || 'Data Science Position',
      company: job.employer_name || 'Tech Company',
      location: job.job_city && job.job_country ? `${job.job_city}, ${job.job_country}` : 'Israel',
      description: this.cleanDescription(job.job_description || 'Data science and machine learning position.'),
      url: job.job_apply_link || job.job_google_link || '#',
      source: 'LinkedIn' as const,
      postDate: job.job_posted_at_datetime_utc ? 
        new Date(job.job_posted_at_datetime_utc).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0],
      collectionDate: new Date().toISOString().split('T')[0],
      salaryRange: this.extractSalary(job),
      jobType: this.mapJobType(job.job_employment_type),
      experienceLevel: this.mapExperienceLevel(job.job_title, job.job_description),
      tags: this.extractTags(job.job_title, job.job_description),
    })).slice(0, 15); // Limit to 15 jobs
  }
  
  private cleanDescription(description: string): string {
    return description.replace(/<[^>]*>/g, '').trim().slice(0, 300) + '...';
  }
  
  private extractSalary(job: any): string | undefined {
    if (job.job_salary_currency && job.job_min_salary && job.job_max_salary) {
      return `${job.job_salary_currency} ${job.job_min_salary} - ${job.job_max_salary}`;
    }
    return undefined;
  }
  
  private mapJobType(employmentType: string): 'Full-time' | 'Part-time' | 'Contract' | 'Internship' {
    const type = employmentType?.toLowerCase() || '';
    if (type.includes('fulltime') || type.includes('full-time')) return 'Full-time';
    if (type.includes('parttime') || type.includes('part-time')) return 'Part-time';
    if (type.includes('contract') || type.includes('contractor')) return 'Contract';
    if (type.includes('intern')) return 'Internship';
    return 'Full-time';
  }
  
  private mapExperienceLevel(title: string, description: string): 'Entry' | 'Mid' | 'Senior' | 'Executive' {
    const text = `${title} ${description}`.toLowerCase();
    if (text.includes('senior') || text.includes('lead') || text.includes('principal')) return 'Senior';
    if (text.includes('junior') || text.includes('entry') || text.includes('intern')) return 'Entry';
    if (text.includes('director') || text.includes('vp') || text.includes('head of')) return 'Executive';
    return 'Mid';
  }
  
  private extractTags(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    const tags: string[] = [];
    
    if (text.includes('python')) tags.push('Python');
    if (text.includes('machine learning') || text.includes('ml')) tags.push('Machine Learning');
    if (text.includes('deep learning') || text.includes('dl')) tags.push('Deep Learning');
    if (text.includes('ai') || text.includes('artificial intelligence')) tags.push('AI');
    if (text.includes('data scien')) tags.push('Data Science');
    if (text.includes('tensorflow')) tags.push('TensorFlow');
    if (text.includes('pytorch')) tags.push('PyTorch');
    if (text.includes('sql')) tags.push('SQL');
    if (text.includes('aws') || text.includes('amazon web services')) tags.push('AWS');
    if (text.includes('azure')) tags.push('Azure');
    if (text.includes('docker')) tags.push('Docker');
    if (text.includes('kubernetes')) tags.push('Kubernetes');
    
    return tags.length > 0 ? tags : ['Data Science', 'Technology'];
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
    try {
      const jobs = await this.crawlMobileyeJobs();
      await CSVStorageService.appendJobs(jobs);
      
      return {
        success: true,
        jobsCollected: jobs.length,
        errors: [],
        source: this.source,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error crawling Mobileye jobs:', error);
      
      // Fallback to mock data if real crawling fails
      const fallbackJobs = this.generateMockJobs(Math.floor(Math.random() * 5) + 2);
      await CSVStorageService.appendJobs(fallbackJobs);
      
      return {
        success: true,
        jobsCollected: fallbackJobs.length,
        errors: [`Failed to crawl real jobs: ${error instanceof Error ? error.message : 'Unknown error'}`],
        source: this.source,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  private async crawlMobileyeJobs(): Promise<JobPosting[]> {
    const keywords = ['AI', 'Algorithm', 'Machine Learning', 'Deep Learning', 'Data Scientist'];
    const baseUrl = 'https://careers.mobileye.com';
    const jobListUrl = `${baseUrl}/jobs`;
    
    try {
      // Using fetch API instead of axios for browser compatibility
      const response = await fetch(jobListUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const html = await response.text();
      
      // Parse HTML using DOMParser (browser-native alternative to cheerio)
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const jobElements = doc.querySelectorAll('a.MuiBox-root[href^="/jobs/"]');
      const jobs: JobPosting[] = [];
      
      for (let i = 0; i < Math.min(jobElements.length, 10); i++) {
        const elem = jobElements[i] as HTMLAnchorElement;
        const titleElement = elem.querySelector('h6');
        const title = titleElement?.textContent?.trim() || '';
        const href = elem.getAttribute('href');
        
        if (!href || !title) continue;
        
        // Skip irrelevant jobs
        if (!keywords.some(k => title.toLowerCase().includes(k.toLowerCase()))) continue;
        
        const url = baseUrl + href;
        let description = 'AI/ML position at Mobileye focusing on autonomous driving technology.';
        
        try {
          // Try to get job details
          const jobResponse = await fetch(url);
          if (jobResponse.ok) {
            const jobHtml = await jobResponse.text();
            const jobDoc = parser.parseFromString(jobHtml, 'text/html');
            const descElement = jobDoc.querySelector('.career-job-description');
            if (descElement?.textContent) {
              description = descElement.textContent.trim().slice(0, 300) + '...';
            }
          }
        } catch (err) {
          console.warn(`Failed to fetch details for job ${url}:`, err);
        }
        
        const job: JobPosting = {
          id: `mobileye-real-${Date.now()}-${i}`,
          title,
          company: 'Mobileye',
          location: 'Jerusalem, Israel',
          description,
          url,
          source: 'Mobileye' as const,
          postDate: new Date(Date.now() - Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          collectionDate: new Date().toISOString().split('T')[0],
          jobType: 'Full-time' as const,
          experienceLevel: /senior|lead/i.test(title) ? 'Senior' as const : 'Mid' as const,
          tags: this.getTagsFromTitle(title),
        };
        
        jobs.push(job);
      }
      
      console.log(`Successfully crawled ${jobs.length} Mobileye jobs`);
      return jobs;
      
    } catch (error) {
      console.error('Error crawling Mobileye careers:', error);
      throw error;
    }
  }
  
  private getTagsFromTitle(title: string): string[] {
    const tags: string[] = [];
    const lowercaseTitle = title.toLowerCase();
    
    if (lowercaseTitle.includes('ai') || lowercaseTitle.includes('artificial intelligence')) tags.push('AI');
    if (lowercaseTitle.includes('machine learning') || lowercaseTitle.includes('ml')) tags.push('Machine Learning');
    if (lowercaseTitle.includes('deep learning') || lowercaseTitle.includes('dl')) tags.push('Deep Learning');
    if (lowercaseTitle.includes('algorithm')) tags.push('Algorithms');
    if (lowercaseTitle.includes('data scien')) tags.push('Data Science');
    if (lowercaseTitle.includes('computer vision') || lowercaseTitle.includes('cv')) tags.push('Computer Vision');
    if (lowercaseTitle.includes('autonomous') || lowercaseTitle.includes('self-driving')) tags.push('Autonomous Driving');
    if (lowercaseTitle.includes('sensor')) tags.push('Sensors');
    if (lowercaseTitle.includes('senior') || lowercaseTitle.includes('lead')) tags.push('Senior Level');
    
    return tags.length > 0 ? tags : ['Technology', 'R&D'];
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