# Data Scientist Job Collection System

An automated system for collecting and displaying Data Scientist job postings in Israel. This application continuously monitors major tech companies and job platforms, providing real-time insights into the Israeli data science job market.

## 🎯 Features

### 📊 Automated Data Collection
- **Multi-source collection**: JSearch API, SerpAPI, Google scraping, Gong, JobsCoil, AllJobs
- **Scheduled automation**: Runs every 6 hours automatically
- **Data persistence**: Stores all job data in CSV format
- **Duplicate prevention**: Intelligent filtering to avoid duplicate entries

### 🖥️ Interactive Dashboard
- **Real-time visualization**: Live updates when new jobs are collected
- **Advanced filtering**: Filter by company, source, experience level, and keywords
- **Comprehensive search**: Search across job titles, descriptions, and skill tags
- **Statistical insights**: Track total jobs, new postings, and company distribution

### ⚡ System Management
- **Scheduler control**: Start/stop automated collection with one click
- **Manual collection**: Trigger immediate job collection
- **Export functionality**: Download job data as CSV
- **Real-time status**: Monitor collection progress and next scheduled run

## 🏗️ Architecture

### Core Components

#### 1. Data Collection Layer (`server/services/JobCollectionService.js`)
```javascript
// Main collection service coordinating all data sources
JobCollectionService
├── JSearchCollector       // RapidAPI JSearch (LinkedIn, Indeed, Glassdoor, etc.)
├── SerpAPICollector       // SerpAPI Google Jobs search integration
├── GoogleCollector        // Direct Google search scraping for careers.google.com
├── GongCollector          // Gong careers page scraping with Puppeteer
├── JobsCoilCollector      // Israeli JobsCoil platform scraping
└── AllJobsCollector       // AllJobs platform scraping
```

**Key Features:**
- **Adapter Pattern**: Each job source implements consistent collector interface
- **Error Handling**: Graceful failure handling per source
- **Data Validation**: Ensures data quality and consistency
- **Rate Limiting**: Respects API limits and prevents blocking

#### 2. Storage Layer (CSV-based)
```javascript
// File-based storage with multiple output formats
Output Structure
├── jobs-[timestamp].csv   // Timestamped job data
├── latest.csv            // Most recent job data
└── stats-[timestamp].json // Collection statistics
```

**Data Schema:**
```csv
id,title,company,location,description,url,source,postDate,collectionDate,salaryRange,jobType,experienceLevel,tags
```

#### 3. Scheduling System (`server/services/SchedulerService.js`)
```javascript
// Application manager coordinating automated collection
SchedulerService
├── start()              // Begin automated 6-hour collection cycle
├── stop()               // Halt automated collection
├── triggerCollection()  // Execute single collection cycle
└── getStatus()          // Monitor scheduler state
```

**Features:**
- **Automatic startup**: Begins collecting immediately when server starts
- **Event-driven updates**: Real-time status notifications
- **Flexible intervals**: 6-hour production intervals
- **Error recovery**: Continues operation despite individual failures

#### 4. Dashboard Interface (`src/components/JobDashboard.tsx`)
```typescript
// Interactive dashboard for job data visualization
JobDashboard
├── StatisticsCards      // Real-time job metrics
├── FilteringSystem      // Multi-dimensional data filtering
├── JobListings         // Formatted job display
└── ControlPanel        // System management interface
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern web browser with localStorage support

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd data-scientist-jobs-israel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open the application**
   Navigate to `http://localhost:8080`

## 🖥️ Server-Side Setup (Enhanced Features)

The application includes a powerful Node.js server for advanced job collection capabilities with multiple collectors and automated scheduling.

### Server Architecture

#### Job Collection Server (`server/`)
The server provides:
- **Automated job collection** from multiple sources
- **Scheduled collection** every 6 hours
- **REST API** for triggering collections and fetching data
- **CSV/JSON export** functionality
- **Real-time statistics** and monitoring

### Server Installation & Setup

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install server dependencies**
   ```bash
   npm install
   ```

3. **Choose your running mode:**

   **Option A: Continuous Server Mode (Recommended)**
   ```bash
   npm start
   ```
   - Runs server on `http://localhost:3001`
   - Starts automatic collection immediately
   - Continues collecting every 6 hours
   - Provides API endpoints for frontend integration

   **Option B: One-time Crawler Mode**
   ```bash
   npm run crawl
   ```
   - Runs collection once and exits
   - Saves results to `server/output/` directory
   - Good for testing or manual data gathering

### Server API Endpoints

Once the server is running, you can access:

- `GET /jobs.csv` - Download job data in CSV format
- `GET /jobs` - Get job data as JSON
- `GET /stats` - View collection statistics
- `POST /collect` - Manually trigger job collection
- `GET /scheduler/status` - Check scheduler status
- `GET /health` - Server health check

## 📋 Job Collectors

The server includes multiple specialized collectors for comprehensive job data gathering:

### 1. JSearch Collector (`server/collectors/JSearchCollector.js`)
- **Purpose**: Uses RapidAPI JSearch to collect jobs from major job boards
- **Sources**: LinkedIn, Indeed, Glassdoor, ZipRecruiter, and other major job sites
- **Status**: Active with real API integration
- **Features**:
  - Salary extraction when available
  - Smart experience level mapping
  - Technology tag extraction
  - Location filtering for Israel
  - Error handling with fallback

### 2. SerpAPI Collector (`server/collectors/SerpAPICollector.js`)
- **Purpose**: Uses SerpAPI to search Google Jobs for job postings
- **Status**: Active with real API integration
- **Features**:
  - Google Jobs search integration
  - Advanced query building
  - Salary and job type extraction
  - Technology tag identification
  - Date parsing and normalization

### 3. Google Collector (`server/collectors/GoogleCollector.js`)
- **Purpose**: Scrapes Google search results directly for careers.google.com jobs
- **Query Format**: `site:careers.google.com AI engineer in Israel`
- **Status**: Active web scraping implementation
- **Features**:
  - Direct Google search scraping
  - HTML parsing with Cheerio
  - Clean URL extraction from Google redirects
  - Location extraction from job titles/descriptions
  - Technology stack identification

### 4. Gong Collector (`server/collectors/GongCollector.js`)
- **Purpose**: Scrapes Gong careers page for job openings using Puppeteer
- **Status**: Active web scraping implementation with browser automation
- **Target URL**: `https://www.gong.io/careers/`
- **Features**:
  - Puppeteer browser automation for dynamic content
  - Career page parsing with JavaScript execution
  - Job detail extraction from SPA applications
  - Location-based filtering
  - Improved reliability for modern web applications

### 5. JobsCoil Collector (`server/collectors/JobsCoilCollector.js`)
- **Purpose**: Scrapes Israeli job board JobsCoil
- **Status**: Active web scraping implementation
- **Target URL**: `https://www.jobscoil.co.il`
- **Features**:
  - Hebrew language support
  - Israeli market focus
  - Local job board integration

### 6. AllJobs Collector (`server/collectors/AllJobsCollector.js`)
- **Purpose**: Collects from AllJobs platform
- **Status**: Active web scraping implementation
- **Target URL**: `https://www.alljobs.co.il`
- **Features**:
  - Israeli job platform integration
  - Local market specialization
  - Hebrew/English job parsing

## 🔑 API Key Configuration

For production use with real data sources, you'll need to configure API keys:

### JSearch API (Multiple Job Boards)
The JSearch collector aggregates jobs from major job boards including LinkedIn, Indeed, Glassdoor, ZipRecruiter, and others. For your own API key:
1. Get API key from [RapidAPI JSearch](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch)
2. Replace the API key in `server/collectors/JSearchCollector.js`

### SerpAPI (Google Jobs)
The SerpAPI collector uses SerpAPI to search Google Jobs. For your own API key:
1. Get API key from [SerpAPI](https://serpapi.com/)
2. Replace the API key in `server/collectors/SerpAPICollector.js`

### Web Scraping Collectors
All web scraping collectors include:
- **Robust parsing**: Multiple fallback selectors for different site layouts
- **Error handling**: Graceful fallbacks when scraping fails
- **Rate limiting**: Built-in delays and proper headers to avoid blocking
- **Hebrew support**: Handles Hebrew text and Israeli job sites
- **User agent rotation**: Prevents blocking with realistic browser headers

## ⏰ Scheduler Service

The server includes an automated scheduler (`server/services/SchedulerService.js`):

**Features:**
- **Automatic startup**: Begins collecting immediately when server starts
- **6-hour intervals**: Collects jobs every 6 hours automatically
- **Manual triggering**: API endpoint for immediate collection
- **Status monitoring**: Track last collection time and next scheduled run
- **Timezone aware**: Uses Israel timezone (`Asia/Jerusalem`)

**Usage:**
```javascript
const SchedulerService = require('./services/SchedulerService');
const scheduler = new SchedulerService(jobCollectionService);

scheduler.start();              // Start automatic collection
scheduler.stop();               // Stop the scheduler
scheduler.triggerCollection();  // Manual collection trigger
scheduler.getStatus();          // Get current status
```

## 🔄 GitHub Actions Integration

The project includes automated GitHub Actions for continuous job collection:

**Workflow file**: `.github/workflows/collect-jobs.yml`

**Features:**
- **Scheduled runs**: Configurable collection intervals
- **Manual trigger**: Can be run on-demand from GitHub
- **Automatic commits**: Updates and commits job data to repository
- **Node.js 18**: Uses latest Node.js version for reliability
- **Multi-collector support**: Runs all collectors in parallel

**Setup:**
1. The workflow automatically detects GitHub Actions environment
2. Runs crawler in GitHub-optimized mode
3. Commits updated CSV files to repository
4. No additional configuration needed

## 📊 Data Output

### Server Mode Output
- Real-time API access to job data
- CSV downloads via `/jobs.csv` endpoint
- JSON data via `/jobs` endpoint
- Statistics via `/stats` endpoint

### Crawler Mode Output
Files saved to `server/output/`:
- `jobs-[timestamp].csv` - Timestamped job data
- `latest.csv` - Most recent job data
- `stats-[timestamp].json` - Collection statistics

### Data Schema Structure
```javascript
{
  id: 'unique-job-identifier',
  title: 'Job Title',
  company: 'Company Name',
  location: 'Job Location',
  description: 'Job Description',
  url: 'Original Job Posting URL',
  source: 'Collector Source',
  postDate: 'ISO Date String',
  collectionDate: 'ISO Date String',
  salaryRange: 'Salary Information',
  jobType: 'Full-time | Part-time | Contract | Internship',
  experienceLevel: 'Entry | Mid | Senior | Executive',
  tags: ['Technology', 'Skills', 'Keywords']
}
```

## 🔧 Frontend Integration

To connect the frontend to your local server:

1. **Update JobService configuration** in frontend:
   ```typescript
   // In src/services/JobService.ts
   private readonly USE_LOCAL_CSV = false; // Use server data
   ```

2. **Start both frontend and server**:
   ```bash
   # Terminal 1: Start server
   cd server && npm start
   
   # Terminal 2: Start frontend
   npm run dev
   ```

3. **Use the "Start Job Collection" button** in the dashboard to trigger server-side collection

## 🐛 Troubleshooting

**Common Issues:**

1. **Port conflicts**: Server runs on port 3001, ensure it's available
2. **CORS errors**: Server includes CORS middleware for frontend access
3. **Collection failures**: Check individual collector error logs
4. **API rate limits**: Respect rate limits for external APIs
5. **Memory issues**: For large datasets, consider implementing pagination

**Debugging:**
- Check server console for detailed collection logs
- Use `/health` endpoint to verify server status
- Monitor `/stats` endpoint for collection metrics
- Review individual collector error messages

## 📋 Usage Guide

### Dashboard Operations

#### Starting Automated Collection
```javascript
// The scheduler runs every 6 hours in production
// Can be manually triggered via dashboard
schedulerService.start()
```

#### Manual Data Collection
```javascript
// Trigger immediate collection from all sources
await jobCollectionService.collectAllJobs()
```

#### Filtering Jobs
- **Search**: Enter keywords to search titles, companies, or skills
- **Company Filter**: Select specific companies (Google, Gong, etc.)
- **Source Filter**: Filter by collection source (JSearch, Google, etc.)
- **Experience Level**: Filter by required experience (Entry, Mid, Senior, Executive)

#### Exporting Data
- Use the `/jobs.csv` endpoint for CSV export
- Use the `/jobs` endpoint for JSON data
- Dashboard provides direct download links

## 🎨 Design System

### Color Palette
```css
/* Professional dark theme for data dashboard */
--primary: 142.1 76.2% 36.3%;        /* Green accent */
--secondary: 240 3.7% 15.9%;         /* Dark gray */
--background: 240 10% 3.9%;          /* Very dark background */
--foreground: 0 0% 98%;              /* Near white text */
```

### Component Architecture
- **Semantic tokens**: All colors defined in design system
- **Responsive design**: Mobile-first approach
- **Accessibility**: WCAG 2.1 compliant
- **Modern styling**: Tailwind CSS with custom design tokens

## 📊 Data Schema

### Job Posting Structure
```typescript
interface JobPosting {
  id: string;                    // Unique identifier
  title: string;                 // Job title
  company: string;               // Company name
  location: string;              // Job location (Israeli cities)
  description: string;           // Job description
  url: string;                   // Link to original posting
  source: 'JSearch' | 'SerpAPI' | 'Google' | 'Gong' | 'JobsCoil' | 'AllJobs';
  postDate: string;              // ISO date string
  collectionDate: string;        // ISO date string
  salaryRange?: string;          // Optional salary information
  jobType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Executive';
  tags: string[];                // Technology and skill tags
}
```

### Collection Statistics
```typescript
interface JobStats {
  totalJobs: number;                              // Total jobs collected
  newJobs: number;                               // Jobs collected in last 24h
  companiesCount: number;                        // Unique companies
  sourceDistribution: Record<string, number>;    // Jobs per source
  experienceLevelDistribution: Record<string, number>; // Jobs per level
  lastCollectionDate: string;                    // Last collection timestamp
}
```

## 🔄 System Architecture

### Data Flow
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Job Sources   │───▶│  Collection      │───▶│   File Storage  │
│                 │    │  Service         │    │                 │
│ • JSearch API   │    │                  │    │ • CSV Export    │
│ • SerpAPI       │    │ • Rate Limiting  │    │ • JSON API      │
│ • Google Search │    │ • Error Handling │    │ • Statistics    │
│ • Web Scraping  │    │ • Data Validation│    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │◄───│   REST API       │───▶│  Scheduler      │
│   Dashboard     │    │                  │    │                 │
│                 │    │ • /jobs.csv      │    │ • 6-hour cycle  │
│ • Real-time UI  │    │ • /jobs (JSON)   │    │ • Auto-start    │
│ • Filtering     │    │ • /stats         │    │ • Manual trigger│
│ • Export        │    │ • /collect       │    │ • Status API    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Error Handling Strategy
```javascript
// Each collector handles failures independently
const results = await Promise.all(
  collectors.map(async (collector) => {
    try {
      return await collector.collectJobs();
    } catch (error) {
      console.error(`Error in ${collector.source}:`, error.message);
      return []; // Return empty array to continue with other collectors
    }
  })
);
```

## 🚀 Performance Features

1. **Parallel Collection**: All collectors run simultaneously
2. **Efficient Parsing**: Optimized HTML parsing with Cheerio
3. **Rate Limiting**: Built-in delays to prevent blocking
4. **Error Recovery**: System continues despite individual failures
5. **Caching**: File-based storage reduces redundant API calls
6. **Streaming**: Large datasets handled efficiently

## 📈 Monitoring & Analytics

### Collection Metrics
- **Success Rate**: Track successful vs failed collections per source
- **Performance**: Monitor collection time and job count trends
- **Error Tracking**: Log and analyze collection errors
- **Source Comparison**: Compare effectiveness of different collectors

### Dashboard Analytics
- **Job Trends**: Track job posting patterns over time
- **Company Analysis**: Monitor hiring activity by company
- **Technology Trends**: Identify popular skills and technologies
- **Location Distribution**: Analyze job locations across Israel

## 🔮 Future Enhancements

### Planned Features
- **Database Integration**: PostgreSQL/MongoDB for advanced queries
- **Real-time Notifications**: Email/Slack alerts for new jobs
- **Machine Learning**: Job recommendation engine
- **Advanced Analytics**: Salary trend analysis and market insights
- **Mobile App**: React Native mobile application
- **API Authentication**: Secure API access with rate limiting

### Extensibility
- **Plugin System**: Easy addition of new job sources
- **Custom Filters**: User-defined filtering criteria
- **Webhook Integration**: Real-time data integration
- **Export Formats**: Excel, PDF, and database exports

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines and submit pull requests for any improvements.

## 📞 Support

For questions, issues, or feature requests, please open an issue on the GitHub repository.