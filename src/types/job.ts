export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  source: 'LinkedIn' | 'Google' | 'Meta' | 'Mobileye' | 'Other';
  postDate: string;
  collectionDate: string;
  salaryRange?: string;
  jobType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Executive';
  tags: string[];
}

export interface JobStats {
  totalJobs: number;
  newJobs: number;
  companiesCount: number;
  sourceDistribution: Record<string, number>;
  experienceLevelDistribution: Record<string, number>;
  lastCollectionDate: string;
}

export interface CollectionResult {
  success: boolean;
  jobsCollected: number;
  errors: string[];
  source: string;
  timestamp: string;
}