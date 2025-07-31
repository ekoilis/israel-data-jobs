import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-target-url',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const targetUrl = req.headers.get('x-target-url')
    
    if (!targetUrl) {
      return new Response(
        JSON.stringify({ error: 'x-target-url header is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate that the target URL is for allowed job sites
    const allowedDomains = [
      'careers.mobileye.com',
      'jobs.co.il',
      'alljobs.co.il',
      'careers.google.com',
      'jsearch.p.rapidapi.com'
    ]
    
    const targetDomain = new URL(targetUrl).hostname
    if (!allowedDomains.some(domain => targetDomain.includes(domain))) {
      return new Response(
        JSON.stringify({ error: 'Domain not allowed' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Forward the request
    const proxyHeaders = new Headers()
    
    // Copy relevant headers from the original request
    const headersToCopy = ['user-agent', 'accept', 'accept-language', 'content-type']
    headersToCopy.forEach(header => {
      const value = req.headers.get(header)
      if (value) {
        proxyHeaders.set(header, value)
      }
    })

    // Set a realistic user agent
    proxyHeaders.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: proxyHeaders,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.arrayBuffer() : undefined,
    })

    // Get response body
    const responseBody = await response.arrayBuffer()
    
    // Create response headers
    const responseHeaders = new Headers(corsHeaders)
    
    // Copy relevant response headers
    const responsHeadersToCopy = ['content-type', 'content-length']
    responsHeadersToCopy.forEach(header => {
      const value = response.headers.get(header)
      if (value) {
        responseHeaders.set(header, value)
      }
    })

    return new Response(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })

  } catch (error) {
    console.error('CORS proxy error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})