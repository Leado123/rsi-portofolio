// <define:__ROUTES__>
var define_ROUTES_default = {
  version: 1,
  include: [
    "/*"
  ],
  exclude: [
    "/",
    "/_astro/*",
    "/.assetsignore",
    "/favicon.svg",
    "/rsi-portofolio"
  ]
};

// node_modules/wrangler/templates/pages-dev-pipeline.ts
import worker from "/workspaces/codespaces-blank/rsi-portofolio/.wrangler/tmp/pages-ELxOQT/bundledWorker-0.8640976060522347.mjs";
import { isRoutingRuleMatch } from "/workspaces/codespaces-blank/rsi-portofolio/node_modules/wrangler/templates/pages-dev-util.ts";
export * from "/workspaces/codespaces-blank/rsi-portofolio/.wrangler/tmp/pages-ELxOQT/bundledWorker-0.8640976060522347.mjs";
var routes = define_ROUTES_default;
var pages_dev_pipeline_default = {
  fetch(request, env, context) {
    const { pathname } = new URL(request.url);
    for (const exclude of routes.exclude) {
      if (isRoutingRuleMatch(pathname, exclude)) {
        return env.ASSETS.fetch(request);
      }
    }
    for (const include of routes.include) {
      if (isRoutingRuleMatch(pathname, include)) {
        const workerAsHandler = worker;
        if (workerAsHandler.fetch === void 0) {
          throw new TypeError("Entry point missing `fetch` handler");
        }
        return workerAsHandler.fetch(request, env, context);
      }
    }
    return env.ASSETS.fetch(request);
  }
};
export {
  pages_dev_pipeline_default as default
};
//# sourceMappingURL=cdvmmb39qwn.js.map
