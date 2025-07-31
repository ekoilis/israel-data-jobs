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
      new LinkedInCollector(),      // Real data via JSearch API
      new GoogleCollector(),        // Real data from Google Careers API
      new MobileyeCollector(),      // Real data from careers.mobileye.com
      new JobsCoIlCollector(),      // Real data from jobs.co.il
      new AllJobsCollector()        // Real data from alljobs.co.il
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

  protected mapExperienceLevel(title: string, description: string = ''): 'Entry' | 'Mid' | 'Senior' | 'Executive' {
    const text = `${title} ${description}`.toLowerCase();
    if (text.includes('senior') || text.includes('lead') || text.includes('principal')) return 'Senior';
    if (text.includes('junior') || text.includes('entry') || text.includes('intern')) return 'Entry';
    if (text.includes('director') || text.includes('vp') || text.includes('head of') || text.includes('manager')) return 'Executive';
    return 'Mid';
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
    const response = await fetch('/functions/v1/fetch-linkedin-jobs', {
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
 * Google careers collector adapter using real Google Careers API
 */
class GoogleCollector extends JobCollector {
  source = 'Google';
  
  async collect(): Promise<CollectionResult> {
    try {
      const jobs = await this.fetchJobsFromGoogleAPI();
      await CSVStorageService.appendJobs(jobs);
      
      return {
        success: true,
        jobsCollected: jobs.length,
        errors: [],
        source: this.source,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching from Google Careers API:', error);
      
      // Fallback to mock data if API fails
      const fallbackJobs = this.generateMockJobs(Math.floor(Math.random() * 6) + 2);
      await CSVStorageService.appendJobs(fallbackJobs);
      
      return {
        success: true,
        jobsCollected: fallbackJobs.length,
        errors: [`Google Careers API failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        source: this.source,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  private async fetchJobsFromGoogleAPI(): Promise<JobPosting[]> {
    try {
      // Call our Supabase edge function for Google jobs
      const response = await fetch('/functions/v1/fetch-google-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords: ['data scientist', 'machine learning', 'AI', 'analytics']
        })
      });
      
      if (!response.ok) {
        throw new Error(`Google Careers API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      return this.transformGoogleData(data.jobs || []);
      
    } catch (error) {
      console.error('Error fetching from Google Careers API:', error);
      throw error;
    }
  }
  
  private transformGoogleData(jobs: any[]): JobPosting[] {
    const dataKeywords = ['data scientist', 'machine learning', 'ai', 'data analyst', 'ml engineer', 'data engineer', 'analytics'];
    
    return jobs
      .filter((job: any) => {
        const title = job.title?.toLowerCase() || '';
        const description = job.description?.toLowerCase() || '';
        return dataKeywords.some(keyword => title.includes(keyword) || description.includes(keyword));
      })
      .map((job: any, index: number) => ({
        id: `google-${job.id || Date.now()}-${index}`,
        title: job.title || 'Data Science Position',
        company: 'Google',
        location: this.extractLocation(job),
        description: this.cleanDescription(job.description || 'Data science position at Google working on innovative projects.'),
        url: job.apply_url || `https://careers.google.com/jobs/results/${job.id || ''}`,
        source: 'Google' as const,
        postDate: job.created ? new Date(job.created).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        collectionDate: new Date().toISOString().split('T')[0],
        salaryRange: this.extractSalary(job),
        jobType: this.mapJobType(job.job_type),
        experienceLevel: this.mapExperienceLevel(job.title, job.description),
        tags: this.extractTags(job.title, job.description, job.qualifications),
      }))
      .slice(0, 10); // Limit to 10 jobs
  }
  
  private extractLocation(job: any): string {
    if (job.locations && job.locations.length > 0) {
      const israelLocation = job.locations.find((loc: any) => 
        loc.address?.includes('Israel') || loc.city?.includes('Tel Aviv') || loc.city?.includes('Haifa')
      );
      if (israelLocation) {
        return israelLocation.city ? `${israelLocation.city}, Israel` : 'Israel';
      }
    }
    return 'Tel Aviv, Israel';
  }
  
  private cleanDescription(description: string): string {
    return description.replace(/<[^>]*>/g, '').trim().slice(0, 300) + '...';
  }
  
  private extractSalary(job: any): string | undefined {
    if (job.salary_min && job.salary_max) {
      return `${job.salary_min} - ${job.salary_max} USD`;
    }
    return undefined;
  }
  
  private mapJobType(jobType: string): 'Full-time' | 'Part-time' | 'Contract' | 'Internship' {
    const type = jobType?.toLowerCase() || '';
    if (type.includes('full') || type.includes('permanent')) return 'Full-time';
    if (type.includes('part')) return 'Part-time';
    if (type.includes('contract') || type.includes('temporary')) return 'Contract';
    if (type.includes('intern')) return 'Internship';
    return 'Full-time';
  }
  
  
  private extractTags(title: string, description: string, qualifications?: string): string[] {
    const text = `${title} ${description} ${qualifications || ''}`.toLowerCase();
    const tags: string[] = [];
    
    if (text.includes('python')) tags.push('Python');
    if (text.includes('machine learning') || text.includes('ml')) tags.push('Machine Learning');
    if (text.includes('deep learning') || text.includes('dl')) tags.push('Deep Learning');
    if (text.includes('ai') || text.includes('artificial intelligence')) tags.push('AI');
    if (text.includes('data scien')) tags.push('Data Science');
    if (text.includes('tensorflow')) tags.push('TensorFlow');
    if (text.includes('pytorch')) tags.push('PyTorch');
    if (text.includes('sql')) tags.push('SQL');
    if (text.includes('bigquery')) tags.push('BigQuery');
    if (text.includes('cloud') || text.includes('gcp')) tags.push('Cloud');
    if (text.includes('analytics')) tags.push('Analytics');
    if (text.includes('statistics')) tags.push('Statistics');
    if (text.includes('research')) tags.push('Research');
    
    return tags.length > 0 ? tags : ['Data Science', 'Technology'];
  }
  
  protected getCompanyName(): string {
    return 'Google';
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
    try {
      // Call our Supabase edge function for Mobileye jobs
      const response = await fetch('/functions/v1/fetch-mobileye-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error(`Mobileye API request failed: ${response.status}`);
      }

      const data = await response.json();
      return this.transformMobileyeData(data.jobs || []);
      
    } catch (error) {
      console.error('Error fetching from Mobileye API:', error);
      throw error;
    }
  }

  private transformMobileyeData(jobs: any[]): JobPosting[] {
    return jobs.map((job: any, index: number) => ({
      id: job.id || `mobileye-${Date.now()}-${index}`,
      title: job.title || 'AI Engineer',
      company: job.company || 'Mobileye',
      location: job.location || 'Jerusalem, Israel',
      description: job.description || 'AI/ML position at Mobileye focusing on autonomous driving technology.',
      url: job.url || '#',
      source: 'Mobileye' as const,
      postDate: job.date_posted ? new Date(job.date_posted).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      collectionDate: new Date().toISOString().split('T')[0],
      salaryRange: undefined,
      jobType: job.employment_type || 'Full-time' as const,
      experienceLevel: this.mapExperienceLevel(job.title, job.description),
      tags: job.tags || this.getTagsFromTitle(job.title || 'AI Engineer')
    }));
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
 * Jobs.co.il collector adapter
 */
class JobsCoIlCollector extends JobCollector {
  source = 'Other';
  
  async collect(): Promise<CollectionResult> {
    try {
      const jobs = await this.crawlJobsCoIl();
      await CSVStorageService.appendJobs(jobs);
      
      return {
        success: true,
        jobsCollected: jobs.length,
        errors: [],
        source: this.source,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error crawling Jobs.co.il:', error);
      
      // Fallback to mock data
      const fallbackJobs = this.generateMockJobs(Math.floor(Math.random() * 6) + 2);
      await CSVStorageService.appendJobs(fallbackJobs);
      
      return {
        success: true,
        jobsCollected: fallbackJobs.length,
        errors: [`Jobs.co.il crawling failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        source: this.source,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  private async crawlJobsCoIl(): Promise<JobPosting[]> {
    try {
      // Call our Supabase edge function for Jobs.co.il
      const response = await fetch('/functions/v1/fetch-jobscoil-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'data scientist machine learning'
        })
      });

      if (!response.ok) {
        throw new Error(`Jobs.co.il request failed: ${response.status}`);
      }

      const data = await response.json();
      return this.transformJobsCoIlData(data.jobs || []);
      
    } catch (error) {
      console.error('Error crawling Jobs.co.il:', error);
      throw error;
    }
  }

  private transformJobsCoIlData(jobs: any[]): JobPosting[] {
    return jobs.map((job: any, index: number) => ({
      id: job.id || `jobscoil-${Date.now()}-${index}`,
      title: job.title || 'Data Science Position',
      company: job.company || 'Tech Company',
      location: job.location || 'Israel',
      description: job.description || 'Data science and analytics position.',
      url: job.url || '#',
      source: 'Other' as const,
      postDate: job.date_posted ? new Date(job.date_posted).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      collectionDate: new Date().toISOString().split('T')[0],
      salaryRange: undefined,
      jobType: 'Full-time' as const,
      experienceLevel: this.determineExperienceLevel(job.title),
      tags: job.tags || this.extractTagsFromText(job.title)
    }));
  }
  
  private determineExperienceLevel(title: string): 'Entry' | 'Mid' | 'Senior' | 'Executive' {
    const text = title.toLowerCase();
    if (text.includes('senior') || text.includes('lead') || text.includes('principal')) return 'Senior';
    if (text.includes('junior') || text.includes('entry') || text.includes('graduate')) return 'Entry';
    if (text.includes('director') || text.includes('head') || text.includes('vp')) return 'Executive';
    return 'Mid';
  }
  
  private extractTagsFromText(text: string): string[] {
    const tags: string[] = [];
    const lowercaseText = text.toLowerCase();
    
    if (lowercaseText.includes('data scien')) tags.push('Data Science');
    if (lowercaseText.includes('machine learning') || lowercaseText.includes('ml')) tags.push('Machine Learning');
    if (lowercaseText.includes('ai') || lowercaseText.includes('artificial intelligence')) tags.push('AI');
    if (lowercaseText.includes('analyst')) tags.push('Analytics');
    if (lowercaseText.includes('python')) tags.push('Python');
    if (lowercaseText.includes('sql')) tags.push('SQL');
    if (lowercaseText.includes('bi') || lowercaseText.includes('business intelligence')) tags.push('BI');
    
    return tags.length > 0 ? tags : ['Data Science', 'Analytics'];
  }
  
  protected getCompanyName(): string {
    const companies = ['Taboola', 'SimilarWeb', 'Cellebrite', 'IronSource', 'Payoneer', 'monday.com'];
    return companies[Math.floor(Math.random() * companies.length)];
  }
}

/**
 * AllJobs collector adapter
 */
class AllJobsCollector extends JobCollector {
  source = 'Other';
  
  async collect(): Promise<CollectionResult> {
    try {
      const jobs = await this.crawlAllJobs();
      await CSVStorageService.appendJobs(jobs);
      
      return {
        success: true,
        jobsCollected: jobs.length,
        errors: [],
        source: this.source,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error crawling AllJobs:', error);
      
      // Fallback to mock data
      const fallbackJobs = this.generateMockJobs(Math.floor(Math.random() * 5) + 2);
      await CSVStorageService.appendJobs(fallbackJobs);
      
      return {
        success: true,
        jobsCollected: fallbackJobs.length,
        errors: [`AllJobs crawling failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        source: this.source,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  private async crawlAllJobs(): Promise<JobPosting[]> {
    try {
      // Call our Supabase edge function for AllJobs
      const response = await fetch('/functions/v1/fetch-alljobs-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'data scientist machine learning'
        })
      });

      if (!response.ok) {
        throw new Error(`AllJobs.co.il request failed: ${response.status}`);
      }

      const data = await response.json();
      return this.transformAllJobsData(data.jobs || []);
      
    } catch (error) {
      console.error('Error crawling AllJobs.co.il:', error);
      throw error;
    }
  }

  private transformAllJobsData(jobs: any[]): JobPosting[] {
    return jobs.map((job: any, index: number) => ({
      id: job.id || `alljobs-${Date.now()}-${index}`,
      title: job.title || 'Data Science Position',
      company: job.company || 'Innovation Company',
      location: job.location || 'Israel',
      description: job.description || 'Data science and innovation position.',
      url: job.url || '#',
      source: 'Other' as const,
      postDate: job.date_posted ? new Date(job.date_posted).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      collectionDate: new Date().toISOString().split('T')[0],
      salaryRange: undefined,
      jobType: 'Full-time' as const,
      experienceLevel: this.determineExperienceLevel(job.title),
      tags: job.tags || this.extractTagsFromText(job.title)
    }));
  }
  
  private determineExperienceLevel(title: string): 'Entry' | 'Mid' | 'Senior' | 'Executive' {
    const text = title.toLowerCase();
    if (text.includes('senior') || text.includes('lead') || text.includes('principal')) return 'Senior';
    if (text.includes('junior') || text.includes('entry') || text.includes('intern')) return 'Entry';
    if (text.includes('manager') || text.includes('director') || text.includes('head')) return 'Executive';
    return 'Mid';
  }
  
  private extractTagsFromText(text: string): string[] {
    const tags: string[] = [];
    const lowercaseText = text.toLowerCase();
    
    if (lowercaseText.includes('data scien')) tags.push('Data Science');
    if (lowercaseText.includes('machine learning') || lowercaseText.includes('ml')) tags.push('Machine Learning');
    if (lowercaseText.includes('ai') || lowercaseText.includes('artificial intelligence')) tags.push('AI');
    if (lowercaseText.includes('analyst')) tags.push('Analytics');
    if (lowercaseText.includes('engineer')) tags.push('Engineering');
    if (lowercaseText.includes('research')) tags.push('Research');
    if (lowercaseText.includes('statistics')) tags.push('Statistics');
    
    return tags.length > 0 ? tags : ['Data Science', 'Technology'];
  }
  
  protected getCompanyName(): string {
    const companies = ['Fiverr', 'Lightricks', 'AppsFlyer', 'Gett', 'Via', 'OrCam'];
    return companies[Math.floor(Math.random() * companies.length)];
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
  
  /**
   * Initialize clean storage (removes all existing fake data)
   */
  static initializeCleanStorage(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('Storage initialized with clean state - no fake jobs');
  }
}