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
├── LinkedInCollector     // LinkedIn job scraping adapter
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

#### LinkedIn Integration
```typescript
class LinkedInCollector extends JobCollector {
  source = 'LinkedIn';
  
  async collect(): Promise<CollectionResult> {
    // Collects Data Scientist positions from LinkedIn Israel
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