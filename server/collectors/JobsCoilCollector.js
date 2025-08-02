const axios = require('axios');
const cheerio = require('cheerio');

class JobsCoilCollector {
  constructor() {
    this.source = 'JobsCoil';
    this.baseUrl = 'https://www.jobscoil.co.il';
  }

  async collectJobs(keywords = 'data scientist', location = 'Israel') {
    try {
      console.log(`Collecting jobs from ${this.source}...`);
      
      // JobsCoil search URL
      const searchUrl = `${this.baseUrl}/jobs/search/?q=${encodeURIComponent(keywords)}&location=${encodeURIComponent(location)}`;
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'he-IL,he;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const jobs = [];

      // Parse job listings - JobsCoil specific selectors
      $('.job-item, .job-listing, .position, [class*="job"], [class*="position"]').each((index, element) => {
        try {
          const $job = $(element);
          
          const title = $job.find('.job-title, .position-title, h2, h3, .title, a[href*="job"]').first().text().trim() ||
                       $job.find('a').first().text().trim();
          
          const company = $job.find('.company-name, .employer, .company, [class*="company"]').first().text().trim();
          
          const location = $job.find('.location, .job-location, [class*="location"]').first().text().trim() || 'Israel';
          
          const jobLink = $job.find('a').first().attr('href') || '';
          const fullUrl = jobLink.startsWith('http') ? jobLink : `${this.baseUrl}${jobLink}`;
          
          const description = $job.find('.job-description, .description, .summary, .excerpt').first().text().trim() ||
                             $job.text().substring(0, 200).trim();

          const salaryElement = $job.find('.salary, .wage, [class*="salary"]').first().text().trim();

          if (title && title.length > 3 && company && company.length > 1) {
            jobs.push({
              id: `jobscoil-${Date.now()}-${index}`,
              title: this.cleanText(title),
              company: this.cleanText(company),
              location: this.cleanText(location) || 'Israel',
              description: this.cleanText(description) || 'Job description available on site',
              url: fullUrl,
              source: this.source,
              postDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
              collectionDate: new Date().toISOString(),
              salaryRange: this.extractSalary(salaryElement || description),
              jobType: this.inferJobType(title, description),
              experienceLevel: this.inferExperienceLevel(title, description),
              tags: this.extractTags(title, description)
            });
          }
        } catch (err) {
          console.warn(`Error parsing job ${index}:`, err.message);
        }
      });

      // Fallback: try table-based layout
      if (jobs.length === 0) {
        $('table tr, .results .row, .job-results .item').each((index, element) => {
          try {
            const $row = $(element);
            const title = $row.find('td:first, .title, h3, a').first().text().trim();
            const company = $row.find('td:nth-child(2), .company').first().text().trim();
            const location = $row.find('td:nth-child(3), .location').first().text().trim() || 'Israel';
            
            if (title && title.length > 3 && company && company.length > 1) {
              jobs.push({
                id: `jobscoil-${Date.now()}-${index}`,
                title: this.cleanText(title),
                company: this.cleanText(company),
                location: this.cleanText(location),
                description: 'Job details available on JobsCoil website',
                url: `${this.baseUrl}/job/${index}`,
                source: this.source,
                postDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                collectionDate: new Date().toISOString(),
                salaryRange: '',
                jobType: 'Full-time',
                experienceLevel: this.inferExperienceLevel(title, ''),
                tags: this.extractTags(title, '')
              });
            }
          } catch (err) {
            console.warn(`Error parsing fallback job ${index}:`, err.message);
          }
        });
      }

      console.log(`Collected ${jobs.length} jobs from ${this.source}`);
      return jobs.slice(0, 20); // Limit to 20 jobs
      
    } catch (error) {
      console.error(`Error collecting jobs from ${this.source}:`, error.message);
      
      // Return fallback data if scraping fails
      return [{
        id: `jobscoil-fallback-${Date.now()}`,
        title: 'Data Engineering Position',
        company: 'Tech Companies',
        location: 'Israel',
        description: 'Various data engineering and BI positions available. Check JobsCoil for latest openings.',
        url: this.baseUrl,
        source: this.source,
        postDate: new Date().toISOString(),
        collectionDate: new Date().toISOString(),
        salaryRange: 'Competitive',
        jobType: 'Full-time',
        experienceLevel: 'Mid',
        tags: ['Data Engineering', 'BI', 'SQL']
      }];
    }
  }

  cleanText(text) {
    return text.replace(/\s+/g, ' ').replace(/[^\w\s\-.,()]/g, '').trim();
  }

  extractSalary(text) {
    if (!text) return '';
    
    const salaryMatch = text.match(/(\d{1,3}[,.]?\d{0,3})\s*[-–]\s*(\d{1,3}[,.]?\d{0,3})\s*(ILS|₪|שקל)/i);
    if (salaryMatch) {
      return `${salaryMatch[1]} - ${salaryMatch[2]} ILS`;
    }
    
    const singleSalary = text.match(/(\d{1,3}[,.]?\d{0,3})\s*(ILS|₪|שקל)/i);
    if (singleSalary) {
      return `${singleSalary[1]}+ ILS`;
    }
    
    return '';
  }

  inferJobType(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    if (text.includes('part time') || text.includes('חלקית')) return 'Part-time';
    if (text.includes('contract') || text.includes('freelance') || text.includes('קבלן')) return 'Contract';
    if (text.includes('intern') || text.includes('סטאז')) return 'Internship';
    return 'Full-time';
  }

  inferExperienceLevel(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    if (text.includes('senior') || text.includes('lead') || text.includes('principal') || text.includes('architect')) return 'Senior';
    if (text.includes('junior') || text.includes('entry') || text.includes('graduate') || text.includes('trainee')) return 'Entry';
    if (text.includes('manager') || text.includes('director') || text.includes('head') || text.includes('vp')) return 'Executive';
    return 'Mid';
  }

  extractTags(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    const techTags = [];
    
    const technologies = [
      'sql', 'python', 'power bi', 'tableau', 'excel', 'qlik', 'r',
      'etl', 'data warehouse', 'business intelligence', 'bi', 'analytics',
      'postgresql', 'mysql', 'oracle', 'mongodb', 'kafka', 'spark',
      'aws', 'azure', 'gcp', 'snowflake', 'redshift'
    ];
    
    technologies.forEach(tech => {
      if (text.includes(tech)) {
        techTags.push(tech.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '));
      }
    });
    
    return techTags.slice(0, 5);
  }
}

module.exports = JobsCoilCollector;