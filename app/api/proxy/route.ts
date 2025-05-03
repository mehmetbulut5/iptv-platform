import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }
  
  try {
    console.log('Proxying request to:', url);
    const response = await fetch(url);
    
    // Check if the response is JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      // For non-JSON responses (like streams)
      const blob = await response.blob();
      return new NextResponse(blob, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          'Content-Type': contentType || 'application/octet-stream',
        },
      });
    }
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch data from the provided URL' }, { status: 500 });
  }
}

// Support all HTTP methods
export const POST = GET;
export const PUT = GET;
export const DELETE = GET;
export const PATCH = GET;