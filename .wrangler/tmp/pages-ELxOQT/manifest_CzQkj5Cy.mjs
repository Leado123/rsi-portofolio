globalThis.process ??= {}; globalThis.process.env ??= {};
import { g as decodeKey } from './chunks/astro/server_B3OCGG_N.mjs';
import './chunks/astro-designed-error-pages_BAMruBUi.mjs';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/noop-middleware_COxss0NZ.mjs';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///workspaces/codespaces-blank/rsi-portofolio/","cacheDir":"file:///workspaces/codespaces-blank/rsi-portofolio/node_modules/.astro/","outDir":"file:///workspaces/codespaces-blank/rsi-portofolio/dist/","srcDir":"file:///workspaces/codespaces-blank/rsi-portofolio/src/","publicDir":"file:///workspaces/codespaces-blank/rsi-portofolio/public/","buildClientDir":"file:///workspaces/codespaces-blank/rsi-portofolio/dist/","buildServerDir":"file:///workspaces/codespaces-blank/rsi-portofolio/dist/_worker.js/","adapterName":"@astrojs/cloudflare","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"rsi-portofolio/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/rsi-portofolio","isIndex":false,"type":"page","pattern":"^\\/rsi-portofolio\\/?$","segments":[[{"content":"rsi-portofolio","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/rsi-portofolio.astro","pathname":"/rsi-portofolio","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/workspaces/codespaces-blank/rsi-portofolio/src/pages/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000astro-internal:middleware":"_astro-internal_middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:src/pages/rsi-portofolio@_@astro":"pages/rsi-portofolio.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"index.js","\u0000@astro-renderers":"renderers.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_CzQkj5Cy.mjs","/workspaces/codespaces-blank/rsi-portofolio/node_modules/unstorage/drivers/cloudflare-kv-binding.mjs":"chunks/cloudflare-kv-binding_DMly_2Gl.mjs","@/components/PrismaticBurst":"_astro/PrismaticBurst.DukEh8gB.js","@astrojs/react/client.js":"_astro/client.9unXo8s5.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/astro.Dm8K3lV8.svg","/_astro/background.BPKAcmfN.svg","/_astro/rsi-portofolio.DBHhxmlv.css","/favicon.svg","/_astro/PrismaticBurst.DukEh8gB.js","/_astro/client.9unXo8s5.js","/_astro/index.WFquGv8Z.js","/_astro/rsi-portofolio.lQ1LVgut.css","/_worker.js/_@astrojs-ssr-adapter.mjs","/_worker.js/_astro-internal_middleware.mjs","/_worker.js/index.js","/_worker.js/noop-entrypoint.mjs","/_worker.js/renderers.mjs","/_astro/fonts/01ab24aba6ae6766.woff2","/_astro/fonts/2ab5f34364ed9165.woff","/_astro/fonts/87dd684c1c391212.otf","/_astro/fonts/9ea068d9085d0bfa.woff2","/_astro/fonts/b43ca2d308393512.woff","/_astro/fonts/bbab97454cbce334.woff2","/_astro/fonts/bbacef9d6f5b567d.otf","/_astro/fonts/d6bfd54ec3afa71f.woff","/_astro/fonts/d9b1ea937ccc882b.woff","/_astro/fonts/dda3b33d819b0e6f.woff2","/_astro/fonts/ded4630b4256e35c.otf","/_astro/fonts/f58f3831e4edd8da.otf","/_worker.js/_astro/astro.Dm8K3lV8.svg","/_worker.js/_astro/background.BPKAcmfN.svg","/_worker.js/_astro/rsi-portofolio.DBHhxmlv.css","/_worker.js/chunks/_@astro-renderers_BqKWxnNo.mjs","/_worker.js/chunks/_@astrojs-ssr-adapter_D-EOcqN8.mjs","/_worker.js/chunks/astro-designed-error-pages_BAMruBUi.mjs","/_worker.js/chunks/astro_BHA446kG.mjs","/_worker.js/chunks/cloudflare-kv-binding_DMly_2Gl.mjs","/_worker.js/chunks/index_Ck0bxRNm.mjs","/_worker.js/chunks/noop-middleware_COxss0NZ.mjs","/_worker.js/pages/index.astro.mjs","/_worker.js/pages/rsi-portofolio.astro.mjs","/_worker.js/chunks/astro/server_B3OCGG_N.mjs","/rsi-portofolio/index.html","/index.html"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"serverIslandNameMap":[],"key":"zJka0iy1YYKP0EYMbTkbim9PyCOj0HL38fKfmaz/WSk=","sessionConfig":{"driver":"cloudflare-kv-binding","options":{"binding":"SESSION"}}});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = () => import('./chunks/cloudflare-kv-binding_DMly_2Gl.mjs');

export { manifest };
