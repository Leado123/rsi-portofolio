import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const proto = context.request.headers.get("x-forwarded-proto");
  const host = context.request.headers.get("host");

  // If behind a proxy (like Coolify/Traefik) and protocol is http, redirect to https
  // We exclude localhost to avoid breaking local development
  if (proto === "http" && host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
    return context.redirect(`https://${host}${context.url.pathname}${context.url.search}`, 301);
  }

  // Just pass through to the next handler
  // Don't modify responses here - let the proxy handler do that
  return next();
});
