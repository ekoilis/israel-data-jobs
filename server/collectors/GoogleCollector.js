const axios = require('axios');
const cheerio = require('cheerio');

class GoogleCollector {
  constructor() {
    this.source = 'Google';
    this.baseUrl = 'https://www.google.com/search';
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  }

  async collectJobs(keywords = 'AI engineer', location = 'Israel') {
    try {
      console.log(`Collecting jobs from ${this.source}...`);
      
      // Construct the search query
      const query = `site:careers.google.com ${keywords} in ${location}`;
      
      const response = await axios.get(this.baseUrl, {
        params: {
          q: query,
          num: 20
        },
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      });

      const $ = cheerio.load(response.data);
      const jobs = [];

      // Parse Google search results
      $('div.g').each((index, element) => {
        try {
          const $result = $(element);
          
          // Extract title and link
          const titleElement = $result.find('h3').first();
          const linkElement = $result.find('a[href]').first();
          
          if (titleElement.length && linkElement.length) {
            const title = titleElement.text().trim();
            const url = linkElement.attr('href');
            
            // Extract description from snippet
            const descriptionElement = $result.find('span[style*="color"]').last();
            const description = descriptionElement.length 
              ? descriptionElement.text().trim() 
              : $result.find('.VwiC3b').text().trim();

            // Extract location from title or description
            const location = this.extractLocation(title, description) || 'Google';
            
            // Company is Google for careers.google.com
            const company = 'Google';

            if (title && url && url.startsWith('http')) {
              jobs.push({
                id: `google-${Date.now()}-${index}`,
                title: this.cleanTitle(title),
                company,
                location,
                description: description || 'No description available',
                url: this.cleanUrl(url),
                source: this.source,
                postDate: new Date().toISOString(),
                collectionDate: new Date().toISOString(),
                salaryRange: '',
                jobType: this.mapJobType(title),
                experienceLevel: this.mapExperienceLevel(title, description),
                tags: this.extractTags(title, description)
              });
            }
          }
        } catch (error) {
          console.error('Error parsing individual result:', error.message);
        }
      });

      console.log(`Collected ${jobs.length} jobs from ${this.source}`);
      return jobs;
    } catch (error) {
      console.error(`Error collecting jobs from ${this.source}:`, error.message);
      return [];
    }
  }

  cleanTitle(title) {
    // Remove common prefixes and clean up the title
    return title
      .replace(/^.*?-\s*/, '') // Remove everything before first dash
      .replace(/\s*-\s*Google\s*Careers?.*$/i, '') // Remove Google Careers suffix
      .replace(/\s*-\s*Google.*$/i, '') // Remove Google suffix
      .trim();
  }

  cleanUrl(url) {
    // Clean up Google redirect URLs
    if (url.includes('/url?q=')) {
      const match = url.match(/\/url\?q=([^&]+)/);
      if (match) {
        return decodeURIComponent(match[1]);
      }
    }
    return url;
  }

  extractLocation(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    
    // Common locations in job postings
    const locations = [
      'tel aviv', 'jerusalem', 'haifa', 'israel',
      'new york', 'san francisco', 'mountain view', 'palo alto',
      'london', 'paris', 'berlin', 'amsterdam',
      'singapore', 'tokyo', 'sydney', 'toronto'
    ];

    for (const location of locations) {
      if (text.includes(location)) {
        return location.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
      }
    }

    return null;
  }

  mapJobType(title) {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('intern')) return 'Internship';
    if (titleLower.includes('part-time') || titleLower.includes('part time')) return 'Part-time';
    if (titleLower.includes('contract') || titleLower.includes('contractor')) return 'Contract';
    
    return 'Full-time';
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

  extractTags(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    const tags = [];
    
    // Technology keywords
    const techKeywords = [
      'python', 'java', 'javascript', 'react', 'node.js', 'sql', 'aws', 'azure', 'gcp',
      'docker', 'kubernetes', 'machine learning', 'ai', 'artificial intelligence',
      'data science', 'analytics', 'tensorflow', 'pytorch', 'deep learning',
      'computer vision', 'nlp', 'natural language processing', 'cloud', 'backend',
      'frontend', 'full stack', 'devops', 'mobile', 'android', 'ios', 'web'
    ];

    techKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        tags.push(keyword.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '));
      }
    });
    
    // Remove duplicates and limit to 5 tags
    return [...new Set(tags)].slice(0, 5);
  }
}

module.exports = GoogleCollector;