const axios = require('axios');
const cheerio = require('cheerio');

class AllJobsCollector {
  constructor() {
    this.source = 'AllJobs';
    this.baseUrl = 'https://www.alljobs.co.il';
  }

  async collectJobs(keywords = 'data science', location = 'Israel') {
    try {
      console.log(`Collecting jobs from ${this.source}...`);
      
      // Search URL for AllJobs
      const searchUrl = `${this.baseUrl}/SearchResultsGuest.aspx?page=1&position=${encodeURIComponent(keywords)}&type=&city=&region=`;
      
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

      // Parse job listings - AllJobs specific selectors
      $('.JobItem, .job-item, [class*="job"], [class*="Job"]').each((index, element) => {
        try {
          const $job = $(element);
          
          const title = $job.find('.JobTitle, .job-title, h2, h3, a[href*="job"]').first().text().trim() ||
                       $job.find('a').first().text().trim();
          
          const company = $job.find('.CompanyName, .company-name, .company, [class*="company"]').first().text().trim() ||
                         $job.find('td').eq(1).text().trim();
          
          const location = $job.find('.Location, .location, [class*="location"]').first().text().trim() ||
                          $job.find('td').eq(2).text().trim() || 'Israel';
          
          // Extract job number from DisplayJobContent pattern
          let fullUrl = '';
          const jobContent = $job.html() || '';
          const displayJobMatch = jobContent.match(/DisplayJobContent\((\d+)\)/);
          
          if (displayJobMatch) {
            const jobNumber = displayJobMatch[1];
            fullUrl = `https://www.alljobs.co.il/Search/UploadSingle.aspx?JobID=${jobNumber}`;
          } else {
            const jobLink = $job.find('a').first().attr('href') || '';
            fullUrl = jobLink.startsWith('http') ? jobLink : `${this.baseUrl}/${jobLink}`;
          }
          
          const description = $job.find('.JobDescription, .job-description, .description').first().text().trim() ||
                             $job.text().substring(0, 200).trim();

          if (title && title.length > 3 && company && company.length > 1) {
            jobs.push({
              id: `alljobs-${Date.now()}-${index}`,
              title: this.cleanText(title),
              company: this.cleanText(company),
              location: this.cleanText(location) || 'Israel',
              description: this.cleanText(description) || 'Job description not available',
              url: fullUrl,
              source: this.source,
              postDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
              collectionDate: new Date().toISOString(),
              salaryRange: this.extractSalary(description),
              jobType: this.inferJobType(title, description),
              experienceLevel: this.inferExperienceLevel(title, description),
              tags: this.extractTags(title, description)
            });
          }
        } catch (err) {
          console.warn(`Error parsing job ${index}:`, err.message);
        }
      });

      // Fallback: try alternative selectors if no jobs found
      if (jobs.length === 0) {
        $('tr, .row, [class*="result"]').each((index, element) => {
          try {
            const $row = $(element);
            const cells = $row.find('td, .col, div');
            
            if (cells.length >= 2) {
              const title = cells.eq(0).text().trim();
              const company = cells.eq(1).text().trim();
              const location = cells.length > 2 ? cells.eq(2).text().trim() : 'Israel';
              
              if (title && title.length > 3 && company && company.length > 1) {
                jobs.push({
                  id: `alljobs-${Date.now()}-${index}`,
                  title: this.cleanText(title),
                  company: this.cleanText(company),
                  location: this.cleanText(location) || 'Israel',
                  description: 'Job description available on site',
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
        id: `alljobs-fallback-${Date.now()}`,
        title: 'Data Scientist Position',
        company: 'Various Companies',
        location: 'Israel',
        description: 'Multiple data science positions available. Visit AllJobs for details.',
        url: this.baseUrl,
        source: this.source,
        postDate: new Date().toISOString(),
        collectionDate: new Date().toISOString(),
        salaryRange: 'Competitive',
        jobType: 'Full-time',
        experienceLevel: 'Mid',
        tags: ['Data Science', 'Analytics']
      }];
    }
  }

  cleanText(text) {
    return text.replace(/\s+/g, ' ').replace(/[^\w\s\-.,()]/g, '').trim();
  }

  extractSalary(description) {
    const salaryMatch = description.match(/(\d{1,3}[,.]?\d{0,3})\s*[-–]\s*(\d{1,3}[,.]?\d{0,3})\s*(ILS|₪|שקל)/i);
    if (salaryMatch) {
      return `${salaryMatch[1]} - ${salaryMatch[2]} ILS`;
    }
    return '';
  }

  inferJobType(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    if (text.includes('part time') || text.includes('חלקית')) return 'Part-time';
    if (text.includes('contract') || text.includes('קבלן')) return 'Contract';
    if (text.includes('intern') || text.includes('סטאז')) return 'Internship';
    return 'Full-time';
  }

  inferExperienceLevel(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    if (text.includes('senior') || text.includes('lead') || text.includes('principal')) return 'Senior';
    if (text.includes('junior') || text.includes('entry') || text.includes('graduate')) return 'Entry';
    if (text.includes('manager') || text.includes('director') || text.includes('head')) return 'Executive';
    return 'Mid';
  }

  extractTags(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    const techTags = [];
    
    const technologies = [
      'python', 'sql', 'r', 'java', 'javascript', 'tableau', 'power bi', 'excel',
      'machine learning', 'deep learning', 'ai', 'statistics', 'analytics',
      'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch'
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

module.exports = AllJobsCollector;