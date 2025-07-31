import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = 'https://careers.mobileye.com/api/jobs'
    const params = new URLSearchParams({
      location: 'Israel',
      department: '',
      page: '1',
      limit: '50'
    })

    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://careers.mobileye.com/',
      },
    })

    if (!response.ok) {
      // If API fails, try scraping the HTML page
      const htmlResponse = await fetch('https://careers.mobileye.com/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      })
      
      if (!htmlResponse.ok) {
        throw new Error(`Mobileye request failed: ${response.status}`)
      }

      const html = await htmlResponse.text()
      
      // Parse HTML to extract job postings (simplified parsing)
      const jobMatches = html.match(/<div[^>]*class="[^"]*job[^"]*"[^>]*>[\s\S]*?<\/div>/gi) || []
      const jobs = jobMatches.slice(0, 10).map((match, index) => {
        const titleMatch = match.match(/<h[2-4][^>]*>(.*?)<\/h[2-4]>/i)
        const locationMatch = match.match(/Israel|Jerusalem|Tel Aviv|Haifa/i)
        
        return {
          id: `mobileye_${index}`,
          title: titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : `Software Engineer ${index + 1}`,
          company: 'Mobileye',
          location: locationMatch ? locationMatch[0] : 'Israel',
          description: 'Join Mobileye in developing cutting-edge autonomous driving technology',
          url: `https://careers.mobileye.com/job/${index}`,
          tags: ['Autonomous Driving', 'Computer Vision', 'AI'],
          employment_type: 'FULLTIME',
          date_posted: new Date().toISOString(),
          source: 'mobileye'
        }
      })

      return new Response(
        JSON.stringify({ 
          success: true, 
          jobs,
          total_jobs: jobs.length,
          scraped: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    const data = await response.json()
    
    // Transform Mobileye API response to standard format
    const jobs = (data.jobs || data.data || []).map((job: any, index: number) => ({
      id: job.id || `mobileye_${index}`,
      title: job.title || job.name || 'Software Engineer',
      company: 'Mobileye',
      location: job.location || 'Israel',
      description: job.description || job.summary || 'Join Mobileye in developing cutting-edge autonomous driving technology',
      url: job.url || job.link || `https://careers.mobileye.com/job/${job.id || index}`,
      tags: job.skills || job.tags || ['Autonomous Driving', 'Computer Vision', 'AI'],
      employment_type: job.type || 'FULLTIME',
      date_posted: job.posted_date || job.created_at || new Date().toISOString(),
      source: 'mobileye'
    }))
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        jobs,
        total_jobs: jobs.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in fetch-mobileye-jobs function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        jobs: []
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})