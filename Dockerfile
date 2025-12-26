FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
COPY package.json bun.lock ./
# Try frozen-lockfile first for reproducibility, but fall back to regular install if lockfile is out of sync
RUN bun install --frozen-lockfile || bun install

# Rebuild the source code only when needed
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules

# Copy config files first (they change less frequently than source code)
# This allows Docker to cache this layer when only source files change
COPY astro.config.mjs tailwind.config.js tsconfig.json components.json ./
COPY package.json ./

# Copy source files (these change more frequently)
COPY src ./src
COPY public ./public

# Build the project
# Ensure environment variables required for build are present if needed
ARG TYPEKIT_ID
ENV TYPEKIT_ID=$TYPEKIT_ID
RUN bun run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 4321

CMD ["bun", "./dist/server/entry.mjs"]
