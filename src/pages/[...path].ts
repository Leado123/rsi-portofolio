import type { APIRoute } from 'astro';

// Use environment variable for the WordPress URL (e.g., http://wordpress:80)
const WORDPRESS_URL = import.meta.env.WORDPRESS_URL || 'http://wordpress'; 

// Helper function to rewrite all HTTP URLs to HTTPS
function rewriteHttpToHttps(text: string, publicHost: string): string {
    // Replace http://publicHost with https://publicHost globally
    let result = text.replace(new RegExp(`http://${publicHost.replace(/\./g, '\\.')}`, 'gi'), `https://${publicHost}`);
    // Also replace any escaped URLs (WordPress sometimes escapes slashes)
    result = result.replace(new RegExp(`http:\\\\/\\\\/${publicHost.replace(/\./g, '\\.')}`, 'gi'), `https:\\/\\/${publicHost}`);
    return result;
}

export const ALL: APIRoute = async ({ request }) => {
  // Loop detection
  if (request.headers.get('X-Astro-Proxy')) {
    return new Response('Loop detected', { status: 508 });
  }

  const url = new URL(request.url);
  const publicHost = url.hostname;
  
  // Handle CORS preflight OPTIONS requests
  // WordPress Site Editor and REST API make preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-WP-Nonce, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      }
    });
  }
  
  // Construct target URL using the internal WordPress service URL
  const targetUrl = new URL(url.pathname + url.search, WORDPRESS_URL);

  try {
    const headers = new Headers(request.headers);
    
    // CRITICAL: Forward the original Host header (e.g., leowen.me)
    // This tells WordPress to generate links for the public domain, not the internal container name.
    headers.set('Host', publicHost);
    headers.set('X-Astro-Proxy', '1');
    
    // Forward the original protocol (https) so WordPress knows it's secure
    // We check the incoming X-Forwarded-Proto first, otherwise default to https since we are behind Coolify
    const incomingProto = request.headers.get('x-forwarded-proto');
    headers.set('X-Forwarded-Proto', incomingProto || 'https');
    
    // Forward additional headers WordPress might need for REST API / Site Editor
    headers.set('X-Forwarded-Host', publicHost);
    headers.set('X-Forwarded-For', request.headers.get('x-forwarded-for') || '127.0.0.1');
    
    // CRITICAL: Don't request compression - we need to modify the response body
    // If WordPress sends compressed content, we can't modify it properly
    headers.delete('Accept-Encoding');
    
    // Forward important headers that WordPress might need
    // These headers help WordPress understand the request context
    if (request.headers.get('referer')) {
        // Rewrite referer to use HTTPS
        const referer = request.headers.get('referer')!;
        if (referer.startsWith('http://')) {
            headers.set('Referer', referer.replace('http://', 'https://'));
        }
    }
    
    // Clean up Cloudflare headers if they exist (optional now, but good practice)
    headers.delete('cf-connecting-ip');
    headers.delete('cf-ipcountry');
    headers.delete('cf-ray');
    headers.delete('cf-visitor');

    // Properly handle request body for POST/PUT/PATCH requests
    let requestBody: BodyInit | undefined = undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD' && request.method !== 'OPTIONS') {
        // Clone the request body to avoid consuming it
        try {
            requestBody = await request.arrayBuffer();
        } catch (e) {
            // Body might already be consumed or empty
            requestBody = undefined;
        }
    }

    const response = await fetch(targetUrl.toString(), {
        method: request.method,
        headers: headers,
        body: requestBody,
        redirect: 'manual' 
    });

    const responseHeaders = new Headers(response.headers);
    
    // CRITICAL: Remove compression headers since we're modifying the body
    // If Content-Encoding is present but we modify the body, browser will fail to decode
    responseHeaders.delete('Content-Encoding');
    responseHeaders.delete('Content-Length'); // Will be recalculated
    
    // ALWAYS set CORS headers for WordPress requests
    // WordPress admin, REST API, and Site Editor all need proper CORS
    const origin = request.headers.get('origin');
    if (origin) {
        responseHeaders.set('Access-Control-Allow-Origin', origin);
        responseHeaders.set('Access-Control-Allow-Credentials', 'true');
        responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-WP-Nonce, X-Requested-With');
    }
    
    // Handle 500 errors - log them for debugging
    if (response.status === 500) {
        console.error(`WordPress 500 error for ${url.pathname}:`, {
            status: response.status,
            statusText: response.statusText,
            requestMethod: request.method,
            requestUrl: request.url,
            targetUrl: targetUrl.toString()
        });
        // Try to get the error message from WordPress
        try {
            const errorText = await response.text();
            console.error('WordPress error response:', errorText.substring(0, 1000));
            // Return the error as-is so we can see what WordPress is saying
            return new Response(rewriteHttpToHttps(errorText, publicHost), {
                status: response.status,
                statusText: response.statusText,
                headers: responseHeaders,
            });
        } catch (e) {
            // If we can't read the error, just pass it through
        }
    }
    
    // Ensure Content-Type header is preserved correctly
    // WordPress admin is very sensitive to correct Content-Type headers
    if (!responseHeaders.has('Content-Type') && response.headers.has('content-type')) {
        responseHeaders.set('Content-Type', response.headers.get('content-type')!);
    }
    
    // Remove any Content-Security-Policy that might block WordPress admin resources
    // WordPress admin needs to load scripts and styles from various sources
    responseHeaders.delete('Content-Security-Policy');
    responseHeaders.delete('Content-Security-Policy-Report-Only');
    
    // Add security headers to ensure HTTPS is enforced
    // This helps browsers recognize the site as secure
    responseHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    // Remove any headers that might interfere with HTTPS
    responseHeaders.delete('X-Frame-Options'); // Let WordPress decide this
    
    // Check for redirects that might accidentally use the internal URL
    const location = responseHeaders.get('location');
    if (location) {
        // If the redirect location contains the internal URL, rewrite it to the public URL
        const internalHost = new URL(WORDPRESS_URL).hostname;
        if (location.includes(internalHost)) {
             responseHeaders.set('location', location.replace(internalHost, url.hostname));
        }
        // Also rewrite HTTP URLs to HTTPS in redirects
        if (location.startsWith('http://')) {
            responseHeaders.set('location', location.replace('http://', 'https://'));
        }
    }

    // Rewrite HTTP URLs to HTTPS in response body to prevent mixed content warnings
    // This is critical for WordPress content that might contain HTTP image URLs, stylesheets, etc.
    const contentType = responseHeaders.get('content-type') || '';
    
    // Only rewrite text-based content
    if (contentType.includes('text/html') || 
        contentType.includes('text/css') || 
        contentType.includes('application/javascript') ||
        contentType.includes('application/json') ||
        contentType.includes('text/javascript') ||
        contentType.includes('text/xml') ||
        contentType.includes('application/xml')) {
        
        const text = await response.text();
        
        // First, do a global replace of all http://publicHost to https://publicHost
        let rewrittenText = rewriteHttpToHttps(text, publicHost);
        
        // For HTML: add upgrade-insecure-requests meta tag
        if (contentType.includes('text/html')) {
            // Add upgrade-insecure-requests meta tag if not present to force HTTPS
            if (!rewrittenText.includes('upgrade-insecure-requests')) {
                rewrittenText = rewrittenText.replace(/<head([^>]*)>/i, 
                    (match) => `${match}<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">`);
            }
        }
        
        return new Response(rewrittenText, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
        });
    }

    // For non-text content (images, videos, etc.), return the body as-is
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });

  } catch (error: any) {
    console.error('Proxy error:', error);
    console.error('Request URL:', request.url);
    console.error('Target URL:', targetUrl.toString());
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return new Response(`Error connecting to upstream server: ${error.message || error}`, { 
      status: 502,
      headers: {
        'Content-Type': 'text/plain',
        'X-Error-Details': error.message || 'Unknown error'
      }
    });
  }
};
export const prerender = false;
