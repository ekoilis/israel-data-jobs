import { JobPosting, JobStats } from '@/types/job';

/**
 * Service for fetching and managing job data from CSV file
 */
export class JobService {
  private static instance: JobService;
  private jobs: JobPosting[] = [];
  private lastFetchTime: Date | null = null;
  
  // Configure your CSV file URL here
  private readonly CSV_URL = 'https://your-server.com/jobs.csv';

  static getInstance(): JobService {
    if (!JobService.instance) {
      JobService.instance = new JobService();
    }
    return JobService.instance;
  }

  /**
   * Fetch jobs from CSV file
   */
  async fetchJobs(): Promise<JobPosting[]> {
    try {
      console.log('Fetching jobs from CSV...');
      
      const response = await fetch(this.CSV_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.status}`);
      }
      
      const csvText = await response.text();
      this.jobs = this.parseCSV(csvText);
      this.lastFetchTime = new Date();
      
      console.log(`Fetched ${this.jobs.length} jobs from CSV`);
      return this.jobs;
    } catch (error) {
      console.error('Error fetching jobs from CSV:', error);
      // Return demo data if fetch fails
      this.jobs = this.getDemoJobs();
      return this.jobs;
    }
  }

  /**
   * Get cached jobs
   */
  getJobs(): JobPosting[] {
    return this.jobs;
  }

  /**
   * Calculate statistics from job data
   */
  calculateStats(): JobStats {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const newJobs = this.jobs.filter(job => 
      new Date(job.collectionDate) > twentyFourHoursAgo
    ).length;

    const companiesSet = new Set(this.jobs.map(job => job.company));
    
    const sourceDistribution: Record<string, number> = {};
    const experienceLevelDistribution: Record<string, number> = {};
    
    this.jobs.forEach(job => {
      sourceDistribution[job.source] = (sourceDistribution[job.source] || 0) + 1;
      experienceLevelDistribution[job.experienceLevel] = (experienceLevelDistribution[job.experienceLevel] || 0) + 1;
    });

    return {
      totalJobs: this.jobs.length,
      newJobs,
      companiesCount: companiesSet.size,
      sourceDistribution,
      experienceLevelDistribution,
      lastCollectionDate: this.lastFetchTime?.toISOString() || new Date().toISOString()
    };
  }

  /**
   * Export jobs to CSV format
   */
  exportToCSV(): string {
    if (this.jobs.length === 0) return '';

    const headers = [
      'id', 'title', 'company', 'location', 'description', 'url', 
      'source', 'postDate', 'collectionDate', 'salaryRange', 
      'jobType', 'experienceLevel', 'tags'
    ];

    const csvRows = [
      headers.join(','),
      ...this.jobs.map(job => [
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
        this.escapeCSV(job.tags.join('; '))
      ].join(','))
    ];

    return csvRows.join('\n');
  }

  /**
   * Parse CSV text into JobPosting objects
   */
  private parseCSV(csvText: string): JobPosting[] {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const jobs: JobPosting[] = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = this.parseCSVLine(lines[i]);
        if (values.length < headers.length) continue;

        const job: JobPosting = {
          id: values[0] || `job-${i}`,
          title: values[1] || 'Unknown Title',
          company: values[2] || 'Unknown Company',
          location: values[3] || 'Unknown Location',
          description: values[4] || 'No description available',
          url: values[5] || '#',
          source: (values[6] as JobPosting['source']) || 'Other',
          postDate: values[7] || new Date().toISOString(),
          collectionDate: values[8] || new Date().toISOString(),
          salaryRange: values[9] || undefined,
          jobType: (values[10] as JobPosting['jobType']) || 'Full-time',
          experienceLevel: (values[11] as JobPosting['experienceLevel']) || 'Mid',
          tags: values[12] ? values[12].split(';').map(tag => tag.trim()).filter(Boolean) : []
        };

        jobs.push(job);
      } catch (error) {
        console.warn(`Error parsing CSV line ${i}:`, error);
      }
    }

    return jobs;
  }

  /**
   * Parse a single CSV line handling quoted values
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result.map(value => value.replace(/^"(.*)"$/, '$1').replace(/\\"/g, '"'));
  }

  /**
   * Escape CSV values
   */
  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * Get demo jobs for fallback
   */
  private getDemoJobs(): JobPosting[] {
    return [
      {
        id: 'demo-1',
        title: 'Senior Data Scientist',
        company: 'Tech Corp',
        location: 'Tel Aviv, Israel',
        description: 'Looking for a senior data scientist with experience in machine learning...',
        url: '#',
        source: 'LinkedIn',
        postDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        collectionDate: new Date().toISOString(),
        salaryRange: '15,000 - 25,000 ILS',
        jobType: 'Full-time',
        experienceLevel: 'Senior',
        tags: ['Python', 'Machine Learning', 'SQL']
      },
      {
        id: 'demo-2',
        title: 'ML Engineer',
        company: 'AI Startup',
        location: 'Jerusalem, Israel',
        description: 'Join our team to build cutting-edge AI solutions...',
        url: '#',
        source: 'Google',
        postDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        collectionDate: new Date().toISOString(),
        jobType: 'Full-time',
        experienceLevel: 'Mid',
        tags: ['TensorFlow', 'PyTorch', 'AWS']
      }
    ];
  }
}