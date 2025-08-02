const axios = require('axios');

class GoogleCollector {
  constructor() {
    this.source = 'Google';
    this.baseUrl = 'https://serpapi.com/search';
    this.apiKey = '24d91bd93c1e6a1f87fe441ec8a7917e944145d905c4931e9222e5daedab50d0';
  }

  async collectJobs(keywords = 'data scientist jobs', location = 'Israel') {
    try {
      console.log(`Collecting jobs from ${this.source}...`);
      
      // Prepare search parameters for Google Jobs
      const params = {
        engine: 'google_jobs',
        q: `${keywords} ${location}`,
        location: location,
        api_key: this.apiKey,
        num: 20 // Number of results to fetch
      };

      const response = await axios.get(this.baseUrl, { params });
      const jobs = response.data.jobs_results || [];
      
      const mappedJobs = jobs.map((job, index) => ({
        id: `google-${Date.now()}-${index}`,
        title: job.title || 'Unknown Title',
        company: job.company_name || 'Unknown Company',
        location: job.location || 'Unknown Location',
        description: job.description || job.job_highlights?.join('\n') || 'No description available',
        url: job.share_link || job.apply_options?.[0]?.link || '#',
        source: this.source,
        postDate: job.detected_extensions?.posted_at ? this.parseDate(job.detected_extensions.posted_at) : new Date().toISOString(),
        collectionDate: new Date().toISOString(),
        salaryRange: this.extractSalary(job.detected_extensions),
        jobType: this.mapJobType(job.detected_extensions?.schedule_type),
        experienceLevel: this.mapExperienceLevel(job.title, job.description),
        tags: this.extractTags(job.job_highlights)
      }));

      console.log(`Collected ${mappedJobs.length} jobs from ${this.source}`);
      return mappedJobs;
    } catch (error) {
      console.error(`Error collecting jobs from ${this.source}:`, error.message);
      return [];
    }
  }

  parseDate(dateString) {
    try {
      // Handle various date formats from Google Jobs
      if (dateString.includes('ago')) {
        const now = new Date();
        if (dateString.includes('day')) {
          const days = parseInt(dateString.match(/\d+/)?.[0] || '0');
          now.setDate(now.getDate() - days);
        } else if (dateString.includes('hour')) {
          const hours = parseInt(dateString.match(/\d+/)?.[0] || '0');
          now.setHours(now.getHours() - hours);
        }
        return now.toISOString();
      }
      return new Date(dateString).toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  extractSalary(extensions) {
    if (!extensions) return '';
    
    const salaryFields = ['salary', 'pay', 'wage'];
    for (const field of salaryFields) {
      if (extensions[field]) {
        return extensions[field];
      }
    }
    return '';
  }

  mapJobType(scheduleType) {
    if (!scheduleType) return 'Full-time';
    
    const typeMap = {
      'full_time': 'Full-time',
      'part_time': 'Part-time',
      'contract': 'Contract',
      'temporary': 'Contract',
      'internship': 'Internship'
    };
    
    const normalized = scheduleType.toLowerCase().replace(/[-\s]/g, '_');
    return typeMap[normalized] || 'Full-time';
  }

  mapExperienceLevel(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    
    if (text.includes('senior') || text.includes('lead') || text.includes('principal') || text.includes('staff')) {
      return 'Senior';
    }
    if (text.includes('junior') || text.includes('entry') || text.includes('graduate') || text.includes('intern')) {
      return 'Entry';
    }
    if (text.includes('mid') || text.includes('intermediate')) {
      return 'Mid';
    }
    if (text.includes('director') || text.includes('vp') || text.includes('executive') || text.includes('head of')) {
      return 'Executive';
    }
    
    return 'Mid'; // Default to Mid level
  }

  extractTags(highlights) {
    if (!Array.isArray(highlights)) return [];
    
    const tags = [];
    highlights.forEach(highlight => {
      if (typeof highlight === 'string') {
        // Extract technology keywords
        const techKeywords = highlight.match(/\b(Python|Java|JavaScript|React|Node\.js|SQL|AWS|Azure|Docker|Kubernetes|Machine Learning|AI|Data Science|Analytics|TensorFlow|PyTorch)\b/gi);
        if (techKeywords) {
          tags.push(...techKeywords);
        }
      }
    });
    
    // Remove duplicates and limit to 5 tags
    return [...new Set(tags)].slice(0, 5);
  }
}

module.exports = GoogleCollector;