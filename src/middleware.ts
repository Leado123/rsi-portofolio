import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const proto = context.request.headers.get("x-forwarded-proto");
  const host = context.request.headers.get("host");

  // If behind a proxy (like Coolify/Traefik) and protocol is http, redirect to https
  // We exclude localhost to avoid breaking local development
  if (proto === "http" && host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
    return context.redirect(`https://${host}${context.url.pathname}${context.url.search}`, 301);
  }

  const response = await next();
  
  // Add security headers to ensure HTTPS is enforced and site is recognized as secure
  // This helps browsers recognize the site as secure even if there are mixed content issues
  if (response instanceof Response) {
    const headers = new Headers(response.headers);
    
    // Only add HSTS if we're on HTTPS (not localhost)
    if (proto === "https" || (!proto && host && !host.includes("localhost") && !host.includes("127.0.0.1"))) {
      if (!headers.has('Strict-Transport-Security')) {
        headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      }
    }
    
    // Ensure X-Content-Type-Options is set to prevent MIME sniffing
    if (!headers.has('X-Content-Type-Options')) {
      headers.set('X-Content-Type-Options', 'nosniff');
    }
    
    // Ensure X-Frame-Options is set for security
    if (!headers.has('X-Frame-Options')) {
      headers.set('X-Frame-Options', 'SAMEORIGIN');
    }
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: headers,
    });
  }
  
  return response;
});
