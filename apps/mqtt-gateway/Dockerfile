# Multi-stage build for MQTT Gateway
FROM node:22-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.22.0 --activate

WORKDIR /app

# Copy root package files
COPY package.json pnpm-workspace.yaml ./

# Copy mqtt-gateway package
COPY apps/mqtt-gateway/package.json ./apps/mqtt-gateway/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy mqtt-gateway source
COPY apps/mqtt-gateway ./apps/mqtt-gateway

# Build the application
WORKDIR /app/apps/mqtt-gateway
RUN pnpm build

# Production stage
FROM node:22-alpine AS production

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.22.0 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml ./
COPY apps/mqtt-gateway/package.json ./apps/mqtt-gateway/

# Install production dependencies
RUN pnpm install --prod --no-frozen-lockfile

WORKDIR /app/apps/mqtt-gateway

# Copy built application
COPY --from=base /app/apps/mqtt-gateway/dist ./dist

# Health check (checks if process is running)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD pgrep -f "node dist/index.js" || exit 1

# Start application
CMD ["pnpm", "start"]
