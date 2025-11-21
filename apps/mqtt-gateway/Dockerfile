# Multi-stage build for MQTT Gateway
FROM node:22-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.22.0 --activate

WORKDIR /app

# Copy root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all shared packages
COPY packages ./packages

# Copy mqtt-gateway package
COPY apps/mqtt-gateway ./apps/mqtt-gateway

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build shared packages first
RUN pnpm -r --filter "@sentient/*" build

# Build mqtt-gateway
RUN pnpm -r --filter mqtt-gateway build

# Production stage
FROM node:22-alpine AS production

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.22.0 --activate

WORKDIR /app
ENV NODE_ENV=production
ENV CI=true

# Copy package files
COPY --from=base /app/package.json ./
COPY --from=base /app/pnpm-lock.yaml ./
COPY --from=base /app/pnpm-workspace.yaml ./

# Copy built packages
COPY --from=base /app/packages ./packages

# Copy built mqtt-gateway
COPY --from=base /app/apps/mqtt-gateway/dist ./apps/mqtt-gateway/dist
COPY --from=base /app/apps/mqtt-gateway/package.json ./apps/mqtt-gateway/

# Install production dependencies
RUN pnpm install --prod --frozen-lockfile

# Health check (checks if process is running)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD pgrep -f "node dist/index.js" || exit 1

# Start application
CMD ["node", "apps/mqtt-gateway/dist/index.js"]
