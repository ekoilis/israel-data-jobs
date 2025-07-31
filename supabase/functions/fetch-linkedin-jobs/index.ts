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
    const { query, location, employment_types, job_requirements, num_pages } = await req.json()
    
    // Get JSearch API key from Supabase secrets
    const jsearchApiKey = Deno.env.get('JSEARCH_API_KEY')
    if (!jsearchApiKey) {
      throw new Error('JSEARCH_API_KEY not found in environment variables')
    }

    const url = 'https://jsearch.p.rapidapi.com/search'
    const params = new URLSearchParams({
      query: query || 'data scientist machine learning Israel',
      page: '1',
      num_pages: (num_pages || 2).toString(),
      date_posted: 'month',
      remote_jobs_only: 'false',
      employment_types: employment_types || 'FULLTIME',
      job_requirements: job_requirements || 'no_experience,under_3_years_experience,more_than_3_years_experience',
      country: 'IL'
    })

    if (location) {
      params.append('location', location)
    }

    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': jsearchApiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('JSearch API error:', response.status, errorText)
      throw new Error(`JSearch API request failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        jobs: data.data || [],
        total_jobs: data.data?.length || 0,
        parameters: data.parameters || {}
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in fetch-linkedin-jobs function:', error)
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