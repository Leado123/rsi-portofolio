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
    headers.set('Host', url.hostname);
    headers.set('X-Astro-Proxy', '1');
    
    // Forward the original protocol (https) so WordPress knows it's secure
    headers.set('X-Forwarded-Proto', url.protocol.replace(':', ''));
    
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

    // We no longer need to rewrite the body if we pass the correct Host header,
    // as WordPress should generate the correct links automatically.
    
    const responseHeaders = new Headers(response.headers);
    
    // However, we should still check for redirects that might accidentally use the internal URL
    // just in case WordPress ignores the Host header for some reason.
    const location = responseHeaders.get('location');
    if (location) {
        // If the redirect location contains the internal URL, rewrite it to the public URL
        const internalHost = new URL(WORDPRESS_URL).hostname;
        if (location.includes(internalHost)) {
             responseHeaders.set('location', location.replace(internalHost, url.hostname));
        }
    }

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
