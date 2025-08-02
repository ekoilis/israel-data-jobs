const axios = require('axios');
const cheerio = require('cheerio');

class JSearchCollector {
  constructor() {
    this.source = 'JSearch';
    this.baseUrl = 'https://jsearch.p.rapidapi.com';
  }

  async collectJobs(keywords = 'data scientist jobs', location = 'Israel') {
    try {
      console.log(`Collecting jobs from ${this.source}...`);
      
      const url = 'https://jsearch.p.rapidapi.com/search';
      
      const response = await axios.get(url, {
        headers: {
          'x-rapidapi-host': 'jsearch.p.rapidapi.com',
          'x-rapidapi-key': '2382634436mshf7fd65cc08d1274p1a7adcjsndeaf8bc5bece'
        }
      });

      const jobs = response.data.data || [];
      
      const mappedJobs = jobs.map((job, index) => ({
        id: `jsearch-${Date.now()}-${index}`,
        title: job.job_title || 'Unknown Title',
        company: job.employer_name || 'Unknown Company',
        location: job.job_city && job.job_state ? `${job.job_city}, ${job.job_state}` : (job.job_country || 'Unknown Location'),
        description: job.job_description || 'No description available',
        url: job.job_apply_link || job.job_offer_expiration_datetime_utc || '#',
        source: this.source,
        postDate: job.job_posted_at_datetime_utc || new Date().toISOString(),
        collectionDate: new Date().toISOString(),
        salaryRange: this.formatSalary(job.job_min_salary, job.job_max_salary, job.job_salary_currency),
        jobType: this.mapJobType(job.job_employment_type),
        experienceLevel: this.mapExperienceLevel(job.job_required_experience),
        tags: this.extractTags(job.job_highlights?.Qualifications || [])
      }));

      console.log(`Collected ${mappedJobs.length} jobs from ${this.source}`);
      return mappedJobs;
    } catch (error) {
      console.error(`Error collecting jobs from ${this.source}:`, error.message);
      return [];
    }
  }

  formatSalary(minSalary, maxSalary, currency = 'USD') {
    if (!minSalary && !maxSalary) return '';
    if (minSalary && maxSalary) {
      return `${minSalary} - ${maxSalary} ${currency}`;
    }
    return minSalary ? `${minSalary}+ ${currency}` : `Up to ${maxSalary} ${currency}`;
  }

  mapJobType(employmentType) {
    const typeMap = {
      'FULLTIME': 'Full-time',
      'PARTTIME': 'Part-time',
      'CONTRACTOR': 'Contract',
      'INTERN': 'Internship'
    };
    return typeMap[employmentType?.toUpperCase()] || 'Full-time';
  }

  mapExperienceLevel(requiredExperience) {
    if (!requiredExperience) return 'Entry';
    const exp = requiredExperience.toString().toLowerCase();
    if (exp.includes('senior') || exp.includes('lead') || exp.includes('principal')) return 'Senior';
    if (exp.includes('mid') || exp.includes('intermediate')) return 'Mid';
    if (exp.includes('executive') || exp.includes('director') || exp.includes('vp')) return 'Executive';
    return 'Entry';
  }

  extractTags(qualifications) {
    if (!Array.isArray(qualifications)) return [];
    return qualifications.slice(0, 5).map(q => 
      q.replace(/[^\w\s]/g, '').trim()
    ).filter(Boolean);
  }
}

module.exports = JSearchCollector;