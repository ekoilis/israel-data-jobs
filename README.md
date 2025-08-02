# Data Scientist Job Collection System

An automated system for collecting and displaying Data Scientist job postings in Israel. This application continuously monitors major tech companies and job platforms, providing real-time insights into the Israeli data science job market.

## 🎯 Features

### 📊 Automated Data Collection
- **Multi-source collection**: LinkedIn, Google, Meta, Mobileye, and other major employers
- **Scheduled automation**: Runs every 12 hours automatically
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

#### 1. Data Collection Layer (`src/services/JobCollectionService.ts`)
```typescript
// Main collection service coordinating all data sources
JobCollectionService
├── GoogleCollector       // Google careers API adapter  
├── MetaCollector         // Meta careers integration
└── MobileyeCollector     // Mobileye job board adapter
```

**Key Features:**
- **Adapter Pattern**: Each job source implements the `JobCollector` interface
- **Error Handling**: Graceful failure handling per source
- **Data Validation**: Ensures data quality and consistency
- **Rate Limiting**: Respects API limits and prevents blocking

#### 2. Storage Layer (`CSVStorageService`)
```typescript
// CSV-based storage with localStorage persistence
CSVStorageService
├── readJobs()           // Load all jobs from storage
├── appendJobs()         // Add new jobs, prevent duplicates
├── exportCSV()          // Generate downloadable CSV
└── saveJobs()           // Persist job data
```

**Data Schema:**
```csv
id,title,company,location,description,url,source,postDate,collectionDate,salaryRange,jobType,experienceLevel,tags
```

#### 3. Scheduling System (`src/services/SchedulerService.ts`)
```typescript
// Application manager coordinating automated collection
SchedulerService
├── startScheduler()     // Begin automated 12-hour collection cycle
├── stopScheduler()      // Halt automated collection
├── runCollection()      // Execute single collection cycle
└── getStatus()          // Monitor scheduler state
```

**Features:**
- **Persistent scheduling**: Remembers state across browser sessions
- **Event-driven updates**: Real-time UI notifications
- **Flexible intervals**: Demo mode (30s) and production mode (12h)
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

## 🖥️ Server-Side Setup (Optional for Enhanced Features)

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

### Job Collectors

The server includes multiple specialized collectors:

#### 1. Google Collector (`server/collectors/GoogleCollector.js`)
- **Purpose**: Uses RapidAPI JSearch to collect developer jobs
- **Status**: Active with real API integration
- **Configuration**: API key configured in collector

#### 2. Mobileye Collector (`server/collectors/MobileyeCollector.js`)
- **Purpose**: Collects jobs from Mobileye careers website
- **Status**: Mock data implementation
- **Target URL**: `https://www.mobileye.com/careers`

#### 2. JobsCoil Collector (`server/collectors/JobsCoilCollector.js`)
- **Purpose**: Scrapes Israeli job board JobsCoil
- **Status**: Mock data implementation
- **Target URL**: `https://www.jobscoil.co.il`

#### 3. AllJobs Collector (`server/collectors/AllJobsCollector.js`)
- **Purpose**: Collects from AllJobs platform
- **Status**: Mock data implementation

### API Key Configuration

For production use with real data sources, you'll need to configure API keys:

#### Google Jobs (via JSearch API)
The Google collector is already configured with RapidAPI JSearch integration. For your own API key:
1. Get API key from [RapidAPI JSearch](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch)
2. Replace the API key in `GoogleCollector.js`

#### Other Collectors
Most collectors are designed to scrape public job boards and don't require API keys. However, for rate limiting and reliability, consider:
- Adding user agents and delays between requests
- Implementing proxy rotation for large-scale scraping
- Respecting robots.txt and terms of service

### Scheduler Service

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

### GitHub Actions Integration

The project includes automated GitHub Actions for continuous job collection:

**Workflow file**: `.github/workflows/collect-jobs.yml`

**Features:**
- **Monthly schedule**: Runs on the 1st of each month
- **Manual trigger**: Can be run on-demand
- **Automatic commits**: Updates and commits job data to repository
- **Node.js 18**: Uses latest Node.js version for reliability

**Setup:**
1. The workflow automatically detects GitHub Actions environment
2. Runs crawler in GitHub-optimized mode
3. Commits updated CSV files to repository
4. No additional configuration needed

### Data Output

**Server Mode Output:**
- Real-time API access to job data
- CSV downloads via `/jobs.csv` endpoint
- JSON data via `/jobs` endpoint

**Crawler Mode Output:**
Files saved to `server/output/`:
- `jobs-[timestamp].csv` - Timestamped job data
- `latest.csv` - Most recent job data
- `stats-[timestamp].json` - Collection statistics

### Frontend Integration

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

### Troubleshooting

**Common Issues:**

1. **Port conflicts**: Server runs on port 3001, ensure it's available
2. **CORS errors**: Server includes CORS middleware for frontend access
3. **Collection failures**: Check individual collector error logs
4. **Memory issues**: For large datasets, consider implementing pagination

**Debugging:**
- Check server console for detailed collection logs
- Use `/health` endpoint to verify server status
- Monitor `/stats` endpoint for collection metrics

### API Configuration

#### JSearch API Setup (Required for LinkedIn Job Data)

To enable real LinkedIn job data collection, you need to configure the JSearch API:

**Step 1: Get JSearch API Key**
1. Visit [RapidAPI JSearch](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch)
2. Subscribe (free tier available)
3. Copy your API key

**Step 2: Add API Key to Supabase Secrets**
1. Go to your Supabase dashboard
2. Navigate to **Project Settings** → **Edge Functions** → **Secrets**
3. Add a new secret:
   - **Name**: `JSEARCH_API_KEY`
   - **Value**: Your RapidAPI key for JSearch

🚀 **Features included with JSearch integration:**
- Real job data from LinkedIn (via JSearch)
- Salary extraction when available
- Smart experience level mapping
- Technology tag extraction
- Location filtering for Israel
- Error handling with fallback

The collector will now fetch real LinkedIn jobs for Israeli data science positions!

### First Time Setup

1. **Start the collection system**
   - Click "Start Scheduler" to begin automated collection
   - Or use "Manual Collection" for immediate data gathering

2. **Explore the dashboard**
   - View collected jobs and statistics
   - Use filters to narrow down results
   - Export data as needed

## 📋 Usage Guide

### Dashboard Operations

#### Starting Automated Collection
```typescript
// The scheduler runs every 12 hours in production
// Demo mode uses 30-second intervals for testing
schedulerService.startScheduler(useDemoInterval: boolean)
```

#### Manual Data Collection
```typescript
// Trigger immediate collection from all sources
await schedulerService.runCollection()
```

#### Filtering Jobs
- **Search**: Enter keywords to search titles, companies, or skills
- **Company Filter**: Select specific companies (Google, Meta, etc.)
- **Source Filter**: Filter by collection source (LinkedIn, Google, etc.)
- **Experience Level**: Filter by required experience (Entry, Mid, Senior, Executive)

#### Exporting Data
```typescript
// Export all job data as CSV file
await CSVStorageService.exportCSV()
```

### Data Collection Sources

#### Google Integration
```typescript
class GoogleCollector extends JobCollector {
  source = 'Google';
  
  async collect(): Promise<CollectionResult> {
    // Uses RapidAPI JSearch to collect developer positions
    // Handles rate limiting and authentication
    // Returns structured job data
  }
}
```

#### Company Career Pages
- **Google**: Direct integration with Google Careers API
- **Meta**: Meta careers page scraping
- **Mobileye**: Mobileye job board integration
- **Others**: Extensible system for additional sources

## 🔧 Technical Implementation

### Data Flow Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Job Sources   │───▶│  Collection      │───▶│   CSV Storage   │
│                 │    │  Adapters        │    │                 │
│ • LinkedIn      │    │                  │    │ • localStorage  │
│ • Google        │    │ • Rate Limiting  │    │ • Export        │
│ • Meta          │    │ • Error Handling │    │ • Deduplication │
│ • Mobileye      │    │ • Data Validation│    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Dashboard     │◄───│   Scheduler      │───▶│  Event System   │
│                 │    │                  │    │                 │
│ • Real-time UI  │    │ • 12-hour cycle  │    │ • collectionStarted
│ • Filtering     │    │ • State persist  │    │ • collectionCompleted
│ • Statistics    │    │ • Manual trigger │    │ • schedulerStateChanged
│ • Export        │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Error Handling Strategy

```typescript
// Each collector handles failures independently
try {
  const result = await collector.collect();
  results.push(result);
} catch (error) {
  // Log error but continue with other collectors
  results.push({
    success: false,
    jobsCollected: 0,
    errors: [error.message],
    source: collector.source,
    timestamp: new Date().toISOString()
  });
}
```

### Performance Optimizations

1. **Lazy Loading**: Dashboard components load incrementally
2. **Efficient Filtering**: Client-side filtering with optimized algorithms
3. **Caching**: localStorage-based persistence reduces API calls
4. **Event-driven Updates**: Real-time UI updates without polling

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
  source: 'LinkedIn' | 'Google' | 'Meta' | 'Mobileye' | 'Other';
  postDate: string;              // Original posting date (YYYY-MM-DD)
  collectionDate: string;        // Date collected by system (YYYY-MM-DD)
  salaryRange?: string;          // Salary information if available
  jobType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Executive';
  tags: string[];                // Skills and technologies
}
```

## 🔄 Automation Details

### Collection Schedule
- **Production**: Every 12 hours (00:00 and 12:00 UTC+2)
- **Demo Mode**: Every 30 seconds (for testing)
- **Manual**: On-demand via dashboard button

### Data Processing Pipeline
1. **Collection**: Gather jobs from all sources simultaneously
2. **Validation**: Ensure data quality and completeness
3. **Deduplication**: Remove duplicate entries by URL and title
4. **Storage**: Append to CSV with timestamp
5. **Notification**: Update dashboard with results

### State Persistence
```typescript
// Scheduler state persists across browser sessions
interface SchedulerState {
  isRunning: boolean;
  lastRunTime: string | null;
  nextRunTime: string | null;
}
```

## 🛠️ Development

### Adding New Job Sources

1. **Create collector class**
   ```typescript
   class NewSourceCollector extends JobCollector {
     source = 'NewSource';
     
     async collect(): Promise<CollectionResult> {
       // Implement source-specific collection logic
     }
     
     protected getCompanyName(): string {
       // Return company name(s) for this source
     }
   }
   ```

2. **Register with service**
   ```typescript
   // Add to JobCollectionService.initializeCollectors()
   this.collectors.push(new NewSourceCollector());
   ```

### Extending Dashboard Features

1. **Add new filters**
   ```typescript
   // Add filter state
   const [newFilter, setNewFilter] = useState<string>('all');
   
   // Update filterJobs() function
   if (newFilter !== 'all') {
     filtered = filtered.filter(job => job.someProperty === newFilter);
   }
   ```

2. **Add statistics**
   ```typescript
   // Update calculateStats() function
   const newDistribution: Record<string, number> = {};
   jobData.forEach(job => {
     newDistribution[job.someProperty] = 
       (newDistribution[job.someProperty] || 0) + 1;
   });
   ```

## 🚀 Deployment

### Production Deployment
1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy static files**
   - Upload `dist/` folder to web server
   - Configure web server for SPA routing

3. **Environment Configuration**
   - Update collection intervals for production
   - Configure API keys for real data sources
   - Set up monitoring and logging

### GitHub Integration
This project is designed to work seamlessly with Lovable's GitHub integration:

1. **Connect to GitHub** via Lovable interface
2. **Automatic syncing** of code changes
3. **Version control** for collaborative development
4. **CI/CD integration** possibilities

## 📈 Monitoring & Analytics

### System Health Metrics
- **Collection success rate**: Percentage of successful runs
- **Data freshness**: Time since last successful collection
- **Source reliability**: Success rate per job source
- **Growth trends**: Job posting volume over time

### Dashboard Metrics
- **Total jobs tracked**: Current database size
- **Daily new jobs**: Fresh postings per day
- **Company diversity**: Number of unique employers
- **Technology trends**: Most common skill requirements

## 🔒 Privacy & Compliance

### Data Handling
- **Public data only**: Collects publicly available job postings
- **No personal data**: Does not store applicant information
- **Respectful scraping**: Implements rate limiting and respectful delays
- **Terms compliance**: Adheres to platform terms of service

### Local Storage
- **Browser-based**: All data stored locally in user's browser
- **No external database**: Privacy-first approach
- **User control**: Users can clear data anytime
- **Portable**: Easy export/import of job data

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes with proper commit messages
4. Test thoroughly across browsers
5. Submit pull request with detailed description

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality enforcement
- **Component structure**: Logical separation of concerns
- **Documentation**: Comprehensive inline comments

### Testing Strategy
- **Manual testing**: Dashboard functionality
- **Collection testing**: Verify data accuracy
- **Performance testing**: Large dataset handling
- **Browser compatibility**: Modern browser support

## 📝 License

This project is part of a demonstration system for automated job data collection. 

## 📞 Support

For questions, issues, or feature requests:
- **GitHub Issues**: Create detailed bug reports
- **Feature Requests**: Propose enhancements with use cases
- **Documentation**: Improve guides and examples

---

**Built with ❤️ for the Israeli Data Science Community**

This system helps data professionals stay informed about opportunities in Israel's thriving tech ecosystem. By automating the collection and presentation of job data, we make it easier for talent and companies to connect.

## 🎯 Future Enhancements

### Planned Features
- **Email notifications**: Daily/weekly job digest emails
- **Advanced analytics**: Salary trends and market insights
- **Company profiles**: Detailed employer information
- **Skill tracking**: Technology demand analysis
- **Mobile app**: React Native companion app
- **API integration**: RESTful API for external integrations

### Technical Improvements
- **Real-time updates**: WebSocket-based live updates
- **Advanced search**: Elasticsearch integration
- **Data visualization**: Interactive charts and graphs
- **Machine learning**: Job recommendation system
- **Performance optimization**: Virtual scrolling for large datasets

*Last updated: January 2025*