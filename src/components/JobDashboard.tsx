import { useState, useEffect } from 'react';
import { JobPosting, JobStats } from '@/types/job';
import { JobCollectionService, CSVStorageService } from '@/services/JobCollectionService';
import { SchedulerService } from '@/services/SchedulerService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Play, Pause, Download, RefreshCw, Calendar, Building, MapPin, ExternalLink, Database } from 'lucide-react';

export const JobDashboard = () => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobPosting[]>([]);
  const [stats, setStats] = useState<JobStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollecting, setIsCollecting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedExperience, setSelectedExperience] = useState<string>('all');
  const [schedulerStatus, setSchedulerStatus] = useState(SchedulerService.getInstance().getStatus());
  
  const { toast } = useToast();
  const collectionService = JobCollectionService.getInstance();
  const schedulerService = SchedulerService.getInstance();

  useEffect(() => {
    loadJobs();
    setupEventListeners();
    
    return () => {
      // Cleanup event listeners
      window.removeEventListener('collectionStarted', handleCollectionStarted);
      window.removeEventListener('collectionCompleted', handleCollectionCompleted);
      window.removeEventListener('collectionError', handleCollectionError);
      window.removeEventListener('schedulerStateChanged', handleSchedulerStateChanged);
    };
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, selectedCompany, selectedSource, selectedExperience]);

  const setupEventListeners = () => {
    window.addEventListener('collectionStarted', handleCollectionStarted);
    window.addEventListener('collectionCompleted', handleCollectionCompleted);
    window.addEventListener('collectionError', handleCollectionError);
    window.addEventListener('schedulerStateChanged', handleSchedulerStateChanged);
  };

  const handleCollectionStarted = () => {
    setIsCollecting(true);
    toast({
      title: "Collection Started",
      description: "Collecting jobs from all sources...",
    });
  };

  const handleCollectionCompleted = (event: any) => {
    setIsCollecting(false);
    const { totalCollected, errors } = event.detail;
    
    toast({
      title: "Collection Completed",
      description: `Collected ${totalCollected} new jobs`,
      variant: errors.length > 0 ? "destructive" : "default",
    });
    
    loadJobs(); // Refresh the dashboard
  };

  const handleCollectionError = (event: any) => {
    setIsCollecting(false);
    toast({
      title: "Collection Failed",
      description: "An error occurred during job collection",
      variant: "destructive",
    });
  };

  const handleSchedulerStateChanged = () => {
    setSchedulerStatus(schedulerService.getStatus());
  };

  const loadJobs = async () => {
    try {
      setIsLoading(true);
      
      // Initialize clean storage (removes all fake jobs)
      CSVStorageService.initializeCleanStorage();
      
      const jobData = await collectionService.getAllJobs();
      setJobs(jobData);
      calculateStats(jobData);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load job data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (jobData: JobPosting[]) => {
    const sourceDistribution: Record<string, number> = {};
    const experienceLevelDistribution: Record<string, number> = {};
    const companies = new Set<string>();
    
    const today = new Date().toISOString().split('T')[0];
    let newJobs = 0;
    let lastCollectionDate = '';

    jobData.forEach(job => {
      sourceDistribution[job.source] = (sourceDistribution[job.source] || 0) + 1;
      experienceLevelDistribution[job.experienceLevel] = (experienceLevelDistribution[job.experienceLevel] || 0) + 1;
      companies.add(job.company);
      
      if (job.collectionDate === today) {
        newJobs++;
      }
      
      if (job.collectionDate > lastCollectionDate) {
        lastCollectionDate = job.collectionDate;
      }
    });

    setStats({
      totalJobs: jobData.length,
      newJobs,
      companiesCount: companies.size,
      sourceDistribution,
      experienceLevelDistribution,
      lastCollectionDate
    });
  };

  const filterJobs = () => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCompany !== 'all') {
      filtered = filtered.filter(job => job.company === selectedCompany);
    }

    if (selectedSource !== 'all') {
      filtered = filtered.filter(job => job.source === selectedSource);
    }

    if (selectedExperience !== 'all') {
      filtered = filtered.filter(job => job.experienceLevel === selectedExperience);
    }

    setFilteredJobs(filtered);
  };

  const handleManualCollection = async () => {
    await schedulerService.runCollection();
  };

  const toggleScheduler = () => {
    if (schedulerStatus.isRunning) {
      schedulerService.stopScheduler();
    } else {
      schedulerService.startScheduler(true); // Use demo interval
    }
  };

  const exportCSV = async () => {
    try {
      const { CSVStorageService } = await import('@/services/JobCollectionService');
      const csvData = await CSVStorageService.exportCSV();
      if (csvData) {
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `data_scientist_jobs_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Export Successful",
          description: "CSV file has been downloaded",
        });
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export CSV file",
        variant: "destructive",
      });
    }
  };

  const getUniqueCompanies = () => {
    return Array.from(new Set(jobs.map(job => job.company))).sort();
  };

  const getUniqueSources = () => {
    return Array.from(new Set(jobs.map(job => job.source))).sort();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading job data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Data Scientist Jobs Dashboard</h1>
            <p className="text-muted-foreground">Automated job collection system for Israel</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleManualCollection}
              disabled={isCollecting}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isCollecting ? 'animate-spin' : ''}`} />
              {isCollecting ? 'Collecting...' : 'Manual Collection'}
            </Button>
            
            <Button
              onClick={toggleScheduler}
              variant={schedulerStatus.isRunning ? "destructive" : "default"}
              size="sm"
            >
              {schedulerStatus.isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {schedulerStatus.isRunning ? 'Stop Scheduler' : 'Start Scheduler'}
            </Button>
            
            <Button onClick={exportCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">{stats.totalJobs}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">New Today</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-success">{stats.newJobs}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Companies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{stats.companiesCount}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Scheduler Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${schedulerStatus.isRunning ? 'bg-success' : 'bg-muted'}`} />
                  <span className="text-sm font-medium">
                    {schedulerStatus.isRunning ? 'Running' : 'Stopped'}
                  </span>
                </div>
                {schedulerStatus.isRunning && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Next: {schedulerService.getTimeUntilNext()}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Collector Statistics Table */}
        {stats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Job Collection Statistics by Source
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Collector Source</TableHead>
                    <TableHead>Jobs Found</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(stats.sourceDistribution)
                    .sort(([,a], [,b]) => b - a) // Sort by job count descending
                    .map(([source, count]) => {
                      const percentage = stats.totalJobs > 0 ? ((count / stats.totalJobs) * 100).toFixed(1) : '0';
                      const getSourceDisplayName = (src: string) => {
                        switch(src) {
                          case 'LinkedIn': return 'LinkedIn (JSearch API)';
                          case 'Google': return 'Google Careers';
                          case 'Mobileye': return 'Mobileye Careers';
                          case 'Other': return 'Israeli Job Boards';
                          default: return src;
                        }
                      };
                      
                      return (
                        <TableRow key={source}>
                          <TableCell className="font-medium">
                            {getSourceDisplayName(source)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-semibold text-primary">{count}</span>
                              <span className="text-sm text-muted-foreground">jobs</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{percentage}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={count > 0 ? "default" : "secondary"}>
                              {count > 0 ? "Active" : "No Data"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  {Object.keys(stats.sourceDistribution).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No data collected yet. Start collection to see statistics.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                placeholder="Search jobs, companies, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="All Companies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {getUniqueCompanies().map(company => (
                    <SelectItem key={company} value={company}>{company}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {getUniqueSources().map(source => (
                    <SelectItem key={source} value={source}>{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                <SelectTrigger>
                  <SelectValue placeholder="All Experience Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Experience Levels</SelectItem>
                  <SelectItem value="Entry">Entry Level</SelectItem>
                  <SelectItem value="Mid">Mid Level</SelectItem>
                  <SelectItem value="Senior">Senior Level</SelectItem>
                  <SelectItem value="Executive">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Job Listings */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Job Listings ({filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'})
            </h2>
          </div>
          
          {filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No jobs match your current filters.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredJobs.map(job => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-foreground hover:text-primary">
                            <a href={job.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                              {job.title}
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </h3>
                          <Badge variant="secondary">{job.source}</Badge>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            {job.company}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Posted: {job.postDate}
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {job.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {job.tags.slice(0, 5).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {job.tags.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.tags.length - 5} more
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span>Experience: {job.experienceLevel}</span>
                          <span>Type: {job.jobType}</span>
                          {job.salaryRange && <span>Salary: {job.salaryRange}</span>}
                          <span>Collected: {job.collectionDate}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};