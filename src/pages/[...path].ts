import type { APIRoute } from 'astro';

// Use environment variable for the WordPress URL (e.g., http://wordpress:80)
const WORDPRESS_URL = import.meta.env.WORDPRESS_URL || 'http://wordpress'; 

export const ALL: APIRoute = async ({ request }) => {
  // Loop detection
  if (request.headers.get('X-Astro-Proxy')) {
    return new Response('Loop detected', { status: 508 });
  }

  const url = new URL(request.url);
  // Construct target URL using the internal WordPress service URL
  const targetUrl = new URL(url.pathname + url.search, WORDPRESS_URL);

  try {
    const headers = new Headers(request.headers);
    
    // CRITICAL: Forward the original Host header (e.g., leowen.me)
    // This tells WordPress to generate links for the public domain, not the internal container name.
    headers.set('Host', 'leowen.me'); // Force Host to match public domain
    headers.set('X-Astro-Proxy', '1');
    
    // Forward the original protocol (https) so WordPress knows it's secure
    // We check the incoming X-Forwarded-Proto first, otherwise default to https since we are behind Coolify
    const incomingProto = request.headers.get('x-forwarded-proto');
    headers.set('X-Forwarded-Proto', incomingProto || 'https');
    
    // Clean up Cloudflare headers if they exist (optional now, but good practice)
    headers.delete('cf-connecting-ip');
    headers.delete('cf-ipcountry');
    headers.delete('cf-ray');
    headers.delete('cf-visitor');

    const response = await fetch(targetUrl.toString(), {
        method: request.method,
        headers: headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.blob() : undefined,
        redirect: 'manual' 
    });

    const responseHeaders = new Headers(response.headers);
    
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
    
    // Only rewrite HTML, CSS, JavaScript, and JSON content
    if (contentType.includes('text/html') || 
        contentType.includes('text/css') || 
        contentType.includes('application/javascript') ||
        contentType.includes('application/json') ||
        contentType.includes('text/javascript')) {
        
        const text = await response.text();
        const publicHost = url.hostname;
        
        // Replace HTTP URLs with HTTPS URLs for the public domain
        const rewrittenText = text
            // Replace http://publicHost with https://publicHost
            .replace(new RegExp(`http://${publicHost.replace(/\./g, '\\.')}`, 'gi'), `https://${publicHost}`)
            // Replace http:// with https:// for any URLs (to catch external resources too)
            .replace(/http:\/\/([^\s"']+)/gi, 'https://$1');
        
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
    return new Response(`Error connecting to upstream server: ${error.message || error}`, { status: 502 });
  }
};
export const prerender = false;
