import { useState, useEffect } from 'react';
import { JobPosting, JobStats } from '@/types/job';
import { JobService } from '@/services/JobService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Download, RefreshCw, Calendar, Building, MapPin, ExternalLink, Play } from 'lucide-react';

export const JobDashboard = () => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobPosting[]>([]);
  const [stats, setStats] = useState<JobStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedExperience, setSelectedExperience] = useState<string>('all');
  
  const { toast } = useToast();
  const jobService = JobService.getInstance();

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, selectedCompany, selectedSource, selectedExperience]);

  const loadJobs = async () => {
    try {
      setIsLoading(true);
      
      const jobData = await jobService.fetchJobs();
      setJobs(jobData);
      
      const statistics = jobService.calculateStats();
      setStats(statistics);
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

  const handleRefresh = async () => {
    setIsFetching(true);
    try {
      await loadJobs();
      toast({
        title: "Data Refreshed",
        description: "Job data has been updated from the server",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh job data",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const exportCSV = () => {
    try {
      const csvData = jobService.exportToCSV();
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

  const handleJobCollection = async () => {
    setIsCollecting(true);
    try {
      const result = await jobService.triggerJobCollection();
      
      if (result.success) {
        toast({
          title: "Collection Started",
          description: result.message,
        });
        // Optionally refresh data after a short delay
        setTimeout(() => {
          handleRefresh();
        }, 2000);
      } else {
        toast({
          title: "Collection Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Collection Failed",
        description: "Failed to start job collection",
        variant: "destructive",
      });
    } finally {
      setIsCollecting(false);
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
            <p className="text-muted-foreground">Job listings from CSV data</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleJobCollection}
              disabled={isCollecting}
              variant="default"
              size="sm"
            >
              <Play className={`h-4 w-4 mr-2 ${isCollecting ? 'animate-pulse' : ''}`} />
              {isCollecting ? 'Starting Collection...' : 'Start Job Collection'}
            </Button>
            
            <Button
              onClick={handleRefresh}
              disabled={isFetching}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Refreshing...' : 'Refresh Data'}
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
                <CardTitle className="text-sm font-medium text-muted-foreground">New (24h)</CardTitle>
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
                <CardTitle className="text-sm font-medium text-muted-foreground">Last Updated</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {new Date(stats.lastCollectionDate).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </div>
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