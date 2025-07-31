/**
 * CORS Proxy Service
 * Provides methods to make requests through the Supabase CORS proxy function
 */
export class CorsProxyService {
  private static instance: CorsProxyService;
  private proxyUrl: string;

  private constructor() {
    // Use the Supabase function URL for CORS proxy
    this.proxyUrl = '/functions/v1/cors-proxy';
  }

  static getInstance(): CorsProxyService {
    if (!CorsProxyService.instance) {
      CorsProxyService.instance = new CorsProxyService();
    }
    return CorsProxyService.instance;
  }

  /**
   * Make a request through the CORS proxy
   */
  async request(targetUrl: string, options: RequestInit = {}): Promise<Response> {
    const headers = new Headers(options.headers);
    headers.set('x-target-url', targetUrl);

    return fetch(this.proxyUrl, {
      ...options,
      headers,
    });
  }

  /**
   * GET request through CORS proxy
   */
  async get(targetUrl: string, headers?: HeadersInit): Promise<Response> {
    return this.request(targetUrl, {
      method: 'GET',
      headers,
    });
  }

  /**
   * POST request through CORS proxy
   */
  async post(targetUrl: string, body?: BodyInit, headers?: HeadersInit): Promise<Response> {
    return this.request(targetUrl, {
      method: 'POST',
      headers,
      body,
    });
  }

  /**
   * Fetch HTML content from a job website
   */
  async fetchHtml(url: string): Promise<string> {
    const response = await this.get(url, {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }

    return response.text();
  }

  /**
   * Fetch JSON data from an API
   */
  async fetchJson(url: string, headers?: HeadersInit): Promise<any> {
    const response = await this.get(url, {
      'Accept': 'application/json',
      ...headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}