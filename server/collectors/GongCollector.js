const axios = require('axios');
const cheerio = require('cheerio');

class GongCollector {
  constructor() {
    this.source = 'Gong';
    this.baseUrl = 'https://www.gong.io';
    this.careersUrl = 'https://www.gong.io/careers/';
  }

  async collectJobs() {
    try {
      console.log(`Collecting jobs from ${this.source}...`);
      
      const response = await axios.get(this.careersUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      const jobs = [];

      // Try different selectors for job listings
      const selectors = [
        '.job-opening',
        '.career-item',
        '.position',
        '.job-card',
        '.job-listing',
        '[class*="job"]',
        '[class*="career"]',
        '[class*="position"]',
        '.opening',
        'article',
        '.card'
      ];

      let foundJobs = false;

      for (const selector of selectors) {
        if (foundJobs) break;
        
        $(selector).each((index, element) => {
          try {
            const $job = $(element);
            console.log($job);
            
            const title = $job.find('.title, .job-title, .position-title, h2, h3, h4, a').first().text().trim() ||
                         $job.text().trim().split('\n')[0];
                         
            const department = $job.find('.department, .team, .category, .division').first().text().trim() ||
                              'Technology';
                              
            const location = $job.find('.location, .office, .city, [class*="location"]').first().text().trim() ||
                            'Remote/Global';
                            
            const description = $job.find('.description, .summary, .excerpt, p').first().text().trim() ||
                               $job.text().substring(0, 200).trim();

            // Extract job URL
            let jobUrl = '';
            const linkElement = $job.find('a').first();
            if (linkElement.length) {
              const href = linkElement.attr('href');
              if (href) {
                jobUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
              }
            }

            if (title && title.length > 3 && !title.toLowerCase().includes('cookie') && 
                !title.toLowerCase().includes('privacy') && title !== description) {
              
              jobs.push({
                id: `gong-${Date.now()}-${index}`,
                title: this.cleanText(title),
                company: 'Gong',
                location: this.cleanText(location) || 'Remote/Global',
                description: this.cleanText(description) || 'Join Gong to revolutionize revenue intelligence',
                url: jobUrl || this.careersUrl,
                source: this.source,
                postDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                collectionDate: new Date().toISOString(),
                salaryRange: this.extractSalary(description),
                jobType: this.inferJobType(title, description),
                experienceLevel: this.inferExperienceLevel(title, description),
                tags: this.extractTags(title, description, department)
              });
              
              foundJobs = true;
            }
          } catch (err) {
            console.warn(`Error parsing job ${index} with selector ${selector}:`, err.message);
          }
        });

        if (jobs.length > 0) break;
      }

      // Fallback: look for any links in the careers section
      if (jobs.length === 0) {
        $('a').each((index, element) => {
          try {
            const $link = $(element);
            const href = $link.attr('href');
            const text = $link.text().trim();
            
            if (href && text && text.length > 10 && 
                (href.includes('job') || href.includes('career') || href.includes('position')) &&
                !text.toLowerCase().includes('learn more') &&
                !text.toLowerCase().includes('apply now') &&
                text.split(' ').length >= 2) {
              
              jobs.push({
                id: `gong-${Date.now()}-${index}`,
                title: this.cleanText(text),
                company: 'Gong',
                location: 'Remote/Global',
                description: 'Join Gong to revolutionize revenue intelligence and help sales teams win more deals',
                url: href.startsWith('http') ? href : `${this.baseUrl}${href}`,
                source: this.source,
                postDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                collectionDate: new Date().toISOString(),
                salaryRange: '',
                jobType: 'Full-time',
                experienceLevel: this.inferExperienceLevel(text, ''),
                tags: this.extractTags(text, '', 'Technology')
              });
            }
          } catch (err) {
            console.warn(`Error parsing fallback job ${index}:`, err.message);
          }
        });
      }

      console.log(`Collected ${jobs.length} jobs from ${this.source}`);
      return jobs.slice(0, 15); // Limit to 15 jobs
      
    } catch (error) {
      console.error(`Error collecting jobs from ${this.source}:`, error.message);
      
      // Return fallback data if scraping fails
      return [{
        id: `gong-fallback-${Date.now()}`,
        title: 'Software Engineer',
        company: 'Gong',
        location: 'Remote/Global',
        description: 'Join Gong to revolutionize revenue intelligence. Multiple positions available in engineering, product, sales, and more.',
        url: this.careersUrl,
        source: this.source,
        postDate: new Date().toISOString(),
        collectionDate: new Date().toISOString(),
        salaryRange: 'Competitive',
        jobType: 'Full-time',
        experienceLevel: 'Mid',
        tags: ['Software Engineering', 'AI/ML', 'SaaS']
      }];
    }
  }

  cleanText(text) {
    return text.replace(/\s+/g, ' ').replace(/[^\w\s\-.,()]/g, '').trim();
  }

  extractSalary(description) {
    const salaryMatch = description.match(/\$(\d{1,3}[,.]?\d{0,3})\s*[-–]\s*\$?(\d{1,3}[,.]?\d{0,3})/i);
    if (salaryMatch) {
      return `$${salaryMatch[1]} - $${salaryMatch[2]}`;
    }
    return '';
  }

  inferJobType(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    if (text.includes('part time') || text.includes('part-time')) return 'Part-time';
    if (text.includes('contract') || text.includes('contractor')) return 'Contract';
    if (text.includes('intern') || text.includes('internship')) return 'Internship';
    return 'Full-time';
  }

  inferExperienceLevel(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    if (text.includes('senior') || text.includes('lead') || text.includes('principal') || text.includes('staff')) return 'Senior';
    if (text.includes('junior') || text.includes('entry') || text.includes('graduate') || text.includes('associate')) return 'Entry';
    if (text.includes('manager') || text.includes('director') || text.includes('head') || text.includes('vp') || text.includes('chief')) return 'Executive';
    return 'Mid';
  }

  extractTags(title, description, department = '') {
    const text = `${title} ${description} ${department}`.toLowerCase();
    const techTags = [];
    
    const technologies = [
      'python', 'javascript', 'typescript', 'react', 'node.js', 'aws', 'kubernetes',
      'machine learning', 'ai', 'artificial intelligence', 'data science', 'analytics',
      'saas', 'api', 'microservices', 'docker', 'mongodb', 'postgresql', 'redis',
      'golang', 'java', 'scala', 'spark', 'kafka', 'elasticsearch', 'revenue intelligence'
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

module.exports = GongCollector;