import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  // Check if the URL is pointing to our mock API
  if (url.includes('/api/mock')) {
    return redirectToMockApi(request, url);
  }

  try {
    console.log('Proxying request to:', url);

    // Check if the URL is valid (must start with http:// or https://)
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw new Error('Invalid URL format. URL must start with http:// or https://');
    }

    // Create an AbortController to handle timeouts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      // Use axios instead of fetch to handle SSL issues better
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'IPTV-Platform/1.0',
        },
        timeout: 10000, // 10 seconds timeout
        // Ignore SSL certificate errors
        httpsAgent: new https.Agent({
          rejectUnauthorized: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      // Return the data directly
      return NextResponse.json(response.data);
    } catch (axiosError) {
      clearTimeout(timeoutId);
      throw axiosError;
    }
  } catch (error: any) {
    console.error('Proxy error:', error.message);
    
    // If request timed out or failed, use the mock API
    return redirectToMockApi(request, url);
  }
}

// Helper function to redirect to mock API
async function redirectToMockApi(request: NextRequest, originalUrl: string) {
  console.log('Using mock API instead of:', originalUrl);
  
  // Redirect to the mock API
  const mockUrl = new URL(request.nextUrl.origin + '/api/mock');
  
  // Try to extract parameters from the original URL
  try {
    if (originalUrl.includes('player_api.php')) {
      // This is an API request
      const parsedUrl = new URL(originalUrl);
      
      // Copy all parameters from the original URL
      parsedUrl.searchParams.forEach((value, key) => {
        mockUrl.searchParams.set(key, value);
      });
    } else if (originalUrl.includes('/live/') || originalUrl.includes('/movie/') || originalUrl.includes('/series/')) {
      // This is a stream URL, extract the stream ID
      const parts = originalUrl.split('/');
      const streamId = parts[parts.length - 1].split('.')[0]; // Get the ID without extension
      mockUrl.searchParams.set('stream_id', streamId);
      
      if (originalUrl.includes('/live/')) {
        mockUrl.searchParams.set('stream_type', 'live');
      } else if (originalUrl.includes('/movie/')) {
        mockUrl.searchParams.set('stream_type', 'movie');
      } else if (originalUrl.includes('/series/')) {
        mockUrl.searchParams.set('stream_type', 'series');
      }
    }
  } catch (parseError) {
    console.error('Error parsing URL:', parseError);
  }
  
  try {
    console.log('Redirecting to mock API:', mockUrl.toString());
    const mockResponse = await fetch(mockUrl.toString());
    const data = await mockResponse.json();
    return NextResponse.json(data);
  } catch (mockError) {
    console.error('Error using mock API:', mockError);
    
    // If all else fails, return a generic error
    return NextResponse.json({
      error: 'Failed to fetch data',
      message: 'Could not connect to API or mock service',
      url: originalUrl
    }, { status: 500 });
  }
}

// Support all HTTP methods
export const POST = GET;
export const PUT = GET;
export const DELETE = GET;
export const PATCH = GET;