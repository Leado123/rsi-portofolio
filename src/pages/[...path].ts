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
    
    // CRITICAL: Don't request compression - we need to modify the response body
    // If WordPress sends compressed content, we can't modify it properly
    headers.delete('Accept-Encoding');
    
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
    
    // CRITICAL: Remove compression headers since we're modifying the body
    // If Content-Encoding is present but we modify the body, browser will fail to decode
    responseHeaders.delete('Content-Encoding');
    responseHeaders.delete('Content-Length'); // Will be recalculated
    
    // Ensure CORS headers are properly set for WordPress admin AJAX requests
    // WordPress admin makes cross-origin requests that need proper CORS headers
    if (url.pathname.includes('/wp-admin') || url.pathname.includes('/wp-json') || url.pathname.includes('/admin-ajax.php')) {
        const origin = request.headers.get('origin');
        if (origin) {
            responseHeaders.set('Access-Control-Allow-Origin', origin);
            responseHeaders.set('Access-Control-Allow-Credentials', 'true');
        }
        // Forward CORS headers from WordPress if they exist
        if (response.headers.get('Access-Control-Allow-Methods')) {
            responseHeaders.set('Access-Control-Allow-Methods', response.headers.get('Access-Control-Allow-Methods')!);
        }
        if (response.headers.get('Access-Control-Allow-Headers')) {
            responseHeaders.set('Access-Control-Allow-Headers', response.headers.get('Access-Control-Allow-Headers')!);
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
    
    // Add security headers to ensure HTTPS is enforced
    // This helps browsers recognize the site as secure
    if (!responseHeaders.has('Strict-Transport-Security')) {
        responseHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    
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
    const publicHost = url.hostname;
    const publicProtocol = url.protocol;
    
    // Only rewrite HTML, CSS, JavaScript, and JSON content
    if (contentType.includes('text/html') || 
        contentType.includes('text/css') || 
        contentType.includes('application/javascript') ||
        contentType.includes('application/json') ||
        contentType.includes('text/javascript')) {
        
        const text = await response.text();
        let rewrittenText = text;
        
        // For HTML: rewrite URLs in attributes (src, href, action, data-*, etc.)
        if (contentType.includes('text/html')) {
            // Replace http://publicHost with https://publicHost in HTML attributes
            rewrittenText = rewrittenText
                .replace(new RegExp(`(src|href|action|data-[^=]*)=["']http://${publicHost.replace(/\./g, '\\.')}([^"']*)["']`, 'gi'), 
                    (match, attr, path) => `${attr}="https://${publicHost}${path}"`)
                .replace(new RegExp(`(src|href|action|data-[^=]*)=["']http://([^"']+)["']`, 'gi'), 
                    (match, attr, url) => `${attr}="https://${url}"`)
                // Also handle URLs in style attributes and inline styles
                .replace(new RegExp(`style=["'][^"']*url\\(http://${publicHost.replace(/\./g, '\\.')}([^)]+)\\)`, 'gi'),
                    (match) => match.replace(/http:\/\//g, 'https://'))
                .replace(/style=["'][^"']*url\(http:\/\/([^)]+)\)/gi,
                    (match) => match.replace(/http:\/\//g, 'https://'));
        }
        
        // For CSS: rewrite URLs in url() functions
        if (contentType.includes('text/css')) {
            rewrittenText = rewrittenText
                .replace(new RegExp(`url\\(["']?http://${publicHost.replace(/\./g, '\\.')}([^"')]+)["']?\\)`, 'gi'), 
                    `url("https://${publicHost}$1")`)
                .replace(/url\(["']?http:\/\/([^"')]+)["']?\)/gi, 'url("https://$1")');
        }
        
        // For JavaScript: be VERY careful - only rewrite URLs in string literals for the public host
        // This prevents breaking WordPress admin AJAX calls and external API requests
        if (contentType.includes('application/javascript') || contentType.includes('text/javascript')) {
            // Only rewrite URLs that match the public host in string literals
            // Match: "http://leowen.me/path" or 'http://leowen.me/path'
            rewrittenText = rewrittenText
                .replace(new RegExp(`(["'])http://${publicHost.replace(/\./g, '\\.')}([^"']*)(["'])`, 'gi'), 
                    `$1https://${publicHost}$2$3`)
                // Also handle template literals
                .replace(new RegExp(`(\`)http://${publicHost.replace(/\./g, '\\.')}([^\`]*)(\`)`, 'gi'),
                    `$1https://${publicHost}$2$3`);
            // DO NOT rewrite all HTTP URLs in JS - this breaks WordPress admin AJAX
        }
        
        // For JSON: rewrite URLs in string values
        if (contentType.includes('application/json')) {
            rewrittenText = rewrittenText
                .replace(new RegExp(`"http://${publicHost.replace(/\./g, '\\.')}([^"]*)"`, 'gi'), 
                    `"https://${publicHost}$1"`)
                .replace(/"http:\/\/([^"]+)"/gi, '"https://$1"');
        }
        
        return new Response(rewrittenText, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
        });
    }

    // For non-text content (images, videos, etc.), return the body as-is
    // But still remove compression headers if present (shouldn't be, but just in case)
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
