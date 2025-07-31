import { JobPosting } from '@/types/job';
import { CSVStorageService } from './JobCollectionService';

/**
 * Sample Data Service - Generates realistic sample data for demonstration
 */
export class SampleDataService {
  /**
   * Initialize the application with sample data if no data exists
   */
  static async initializeSampleData(): Promise<void> {
    const existingJobs = await CSVStorageService.readJobs();
    
    if (existingJobs.length === 0) {
      console.log('No existing data found. Generating sample data...');
      const sampleJobs = this.generateSampleJobs();
      await CSVStorageService.saveJobs(sampleJobs);
      console.log(`Generated ${sampleJobs.length} sample job postings`);
    }
  }

  /**
   * Generate comprehensive sample job data
   */
  private static generateSampleJobs(): JobPosting[] {
    const jobs: JobPosting[] = [];
    
    // LinkedIn jobs
    jobs.push(...this.generateLinkedInJobs());
    
    // Google jobs
    jobs.push(...this.generateGoogleJobs());
    
    // Meta jobs
    jobs.push(...this.generateMetaJobs());
    
    // Mobileye jobs
    jobs.push(...this.generateMobileyeJobs());
    
    // Other companies
    jobs.push(...this.generateOtherCompanyJobs());
    
    return jobs;
  }

  private static generateLinkedInJobs(): JobPosting[] {
    const companies = [
      'Microsoft Israel', 'Intel Israel', 'NVIDIA Israel', 
      'Amazon Israel', 'Wix', 'Check Point', 'Monday.com',
      'Fiverr', 'JFrog', 'Cellebrite'
    ];
    
    const jobs: JobPosting[] = [];
    
    companies.forEach((company, index) => {
      const jobCount = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < jobCount; i++) {
        jobs.push(this.createJobPosting(
          'LinkedIn',
          company,
          index * 10 + i
        ));
      }
    });
    
    return jobs;
  }

  private static generateGoogleJobs(): JobPosting[] {
    const positions = [
      'Staff Data Scientist',
      'Senior Data Scientist - AI',
      'Principal Research Scientist',
      'Data Scientist - Machine Learning'
    ];
    
    return positions.map((title, index) => ({
      id: `google_${Date.now()}_${index}`,
      title,
      company: 'Google',
      location: ['Tel Aviv', 'Haifa'][Math.floor(Math.random() * 2)],
      description: `Join Google's world-class research team working on cutting-edge AI and ML projects. You'll contribute to products used by billions of users worldwide while advancing the state of the art in data science.`,
      url: `https://careers.google.com/jobs/results/${Date.now()}_${index}`,
      source: 'Google' as const,
      postDate: this.getRandomDate(30),
      collectionDate: this.getRandomDate(7),
      salaryRange: '400k-600k ILS',
      jobType: 'Full-time' as const,
      experienceLevel: ['Senior', 'Executive'][Math.floor(Math.random() * 2)] as JobPosting['experienceLevel'],
      tags: ['Python', 'TensorFlow', 'BigQuery', 'GCP', 'Machine Learning', 'Deep Learning', 'Statistics']
    }));
  }

  private static generateMetaJobs(): JobPosting[] {
    const positions = [
      'Research Scientist - AI',
      'Data Scientist - Product Analytics',
      'Senior Data Scientist - Reality Labs'
    ];
    
    return positions.map((title, index) => ({
      id: `meta_${Date.now()}_${index}`,
      title,
      company: 'Meta',
      location: 'Tel Aviv',
      description: `Work at Meta's Tel Aviv office on next-generation social technologies and the metaverse. Collaborate with world-class engineers and researchers to build products that connect billions of people.`,
      url: `https://www.metacareers.com/jobs/${Date.now()}_${index}`,
      source: 'Meta' as const,
      postDate: this.getRandomDate(20),
      collectionDate: this.getRandomDate(5),
      salaryRange: '350k-500k ILS',
      jobType: 'Full-time' as const,
      experienceLevel: ['Mid', 'Senior'][Math.floor(Math.random() * 2)] as JobPosting['experienceLevel'],
      tags: ['Python', 'PyTorch', 'React', 'SQL', 'A/B Testing', 'Causal Inference', 'Computer Vision']
    }));
  }

  private static generateMobileyeJobs(): JobPosting[] {
    const positions = [
      'Computer Vision Engineer',
      'Deep Learning Researcher',
      'Data Scientist - Autonomous Driving',
      'Senior ML Engineer - ADAS',
      'AI Research Scientist'
    ];
    
    return positions.map((title, index) => ({
      id: `mobileye_${Date.now()}_${index}`,
      title,
      company: 'Mobileye',
      location: 'Jerusalem',
      description: `Join Mobileye's mission to revolutionize autonomous driving technology. Work with cutting-edge computer vision and AI technologies to make roads safer for everyone.`,
      url: `https://www.mobileye.com/careers/${Date.now()}_${index}`,
      source: 'Mobileye' as const,
      postDate: this.getRandomDate(15),
      collectionDate: this.getRandomDate(3),
      salaryRange: '300k-450k ILS',
      jobType: 'Full-time' as const,
      experienceLevel: ['Mid', 'Senior'][Math.floor(Math.random() * 2)] as JobPosting['experienceLevel'],
      tags: ['Computer Vision', 'Deep Learning', 'C++', 'Python', 'CUDA', 'OpenCV', 'Autonomous Vehicles']
    }));
  }

  private static generateOtherCompanyJobs(): JobPosting[] {
    const companies = [
      { name: 'Lightricks', location: 'Jerusalem' },
      { name: 'Gong', location: 'Herzliya' },
      { name: 'Riskified', location: 'Tel Aviv' },
      { name: 'AppsFlyer', location: 'Herzliya' },
      { name: 'Snyk', location: 'Tel Aviv' },
      { name: 'Via', location: 'Tel Aviv' },
      { name: 'Coralogix', location: 'Tel Aviv' },
      { name: 'Cybereason', location: 'Tel Aviv' }
    ];
    
    const jobs: JobPosting[] = [];
    
    companies.forEach((company, index) => {
      const jobCount = Math.floor(Math.random() * 2) + 1;
      
      for (let i = 0; i < jobCount; i++) {
        jobs.push({
          id: `other_${company.name.toLowerCase()}_${Date.now()}_${i}`,
          title: this.getRandomJobTitle(),
          company: company.name,
          location: company.location,
          description: this.getRandomJobDescription(company.name),
          url: `https://${company.name.toLowerCase()}.com/careers/${Date.now()}_${i}`,
          source: 'Other' as const,
          postDate: this.getRandomDate(25),
          collectionDate: this.getRandomDate(8),
          salaryRange: this.getRandomSalaryRange(),
          jobType: ['Full-time', 'Contract'][Math.floor(Math.random() * 2)] as JobPosting['jobType'],
          experienceLevel: this.getRandomExperienceLevel(),
          tags: this.getRandomTags()
        });
      }
    });
    
    return jobs;
  }

  private static createJobPosting(source: string, company: string, index: number): JobPosting {
    return {
      id: `${source.toLowerCase()}_${company.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}_${index}`,
      title: this.getRandomJobTitle(),
      company,
      location: this.getRandomLocation(),
      description: this.getRandomJobDescription(company),
      url: `https://${source.toLowerCase()}.com/jobs/${Date.now()}_${index}`,
      source: source as JobPosting['source'],
      postDate: this.getRandomDate(30),
      collectionDate: this.getRandomDate(7),
      salaryRange: this.getRandomSalaryRange(),
      jobType: this.getRandomJobType(),
      experienceLevel: this.getRandomExperienceLevel(),
      tags: this.getRandomTags()
    };
  }

  private static getRandomJobTitle(): string {
    const titles = [
      'Senior Data Scientist',
      'Data Scientist',
      'ML Engineer',
      'Principal Data Scientist',
      'Staff Data Scientist',
      'Data Analyst',
      'Research Scientist',
      'AI Engineer',
      'Data Science Manager',
      'Senior ML Engineer',
      'Applied Scientist',
      'Quantitative Researcher'
    ];
    
    return titles[Math.floor(Math.random() * titles.length)];
  }

  private static getRandomLocation(): string {
    const locations = ['Tel Aviv', 'Jerusalem', 'Haifa', 'Herzliya', 'Petah Tikva', 'Ramat Gan'];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  private static getRandomJobDescription(company: string): string {
    const descriptions = [
      `${company} is seeking a talented data scientist to join our growing team. You'll work on challenging problems using cutting-edge machine learning techniques and big data technologies.`,
      `Join ${company}'s data science team and help drive business insights through advanced analytics. Work with large-scale datasets and modern ML infrastructure.`,
      `Exciting opportunity at ${company} to work on real-world data science problems. You'll collaborate with cross-functional teams to deliver impactful solutions.`,
      `${company} is looking for a data scientist to develop and deploy machine learning models at scale. Experience with cloud platforms and MLOps preferred.`,
      `Be part of ${company}'s mission to leverage data for business growth. Work on end-to-end ML projects from research to production deployment.`
    ];
    
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  private static getRandomSalaryRange(): string {
    const ranges = [
      '150k-200k ILS',
      '200k-300k ILS',
      '300k-400k ILS',
      '400k-500k ILS',
      '120k-180k ILS',
      '250k-350k ILS',
      '180k-250k ILS'
    ];
    
    return ranges[Math.floor(Math.random() * ranges.length)];
  }

  private static getRandomJobType(): JobPosting['jobType'] {
    const types: JobPosting['jobType'][] = ['Full-time', 'Part-time', 'Contract'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private static getRandomExperienceLevel(): JobPosting['experienceLevel'] {
    const levels: JobPosting['experienceLevel'][] = ['Entry', 'Mid', 'Senior', 'Executive'];
    return levels[Math.floor(Math.random() * levels.length)];
  }

  private static getRandomTags(): string[] {
    const allTags = [
      'Python', 'R', 'SQL', 'Machine Learning', 'Deep Learning',
      'TensorFlow', 'PyTorch', 'AWS', 'GCP', 'Azure', 'Docker',
      'Kubernetes', 'Spark', 'Hadoop', 'Pandas', 'NumPy',
      'Scikit-learn', 'Statistics', 'A/B Testing', 'Tableau',
      'Power BI', 'Jupyter', 'Git', 'MLOps', 'Computer Vision',
      'NLP', 'Time Series', 'Causal Inference'
    ];
    
    const count = Math.floor(Math.random() * 6) + 3;
    return allTags.sort(() => 0.5 - Math.random()).slice(0, count);
  }

  private static getRandomDate(daysBack: number): string {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
    return date.toISOString().split('T')[0];
  }
}
