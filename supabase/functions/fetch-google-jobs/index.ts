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
    const { keywords = ['data scientist', 'machine learning', 'AI', 'analytics'] } = await req.json()
    
    const url = 'https://careers.google.com/api/v3/search/'
    const params = new URLSearchParams({
      distance: '50',
      hl: 'en_US',
      jlo: 'en_US',
      location: 'Israel',
      q: keywords.join(' OR '),
      sort_by: 'date'
    })

    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google Careers API error:', response.status, errorText)
      throw new Error(`Google Careers API request failed: ${response.status}`)
    }

    const data = await response.json()
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        jobs: data.jobs || [],
        total_jobs: data.jobs?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in fetch-google-jobs function:', error)
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