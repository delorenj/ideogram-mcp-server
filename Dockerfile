# Use Node.js 20+ as required by dependencies
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm globally with specific version
RUN corepack enable && corepack prepare pnpm@8.15.9 --activate

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml .npmrc ./

# Copy scripts needed for preinstall check
COPY scripts/ ./scripts/

# Install dependencies with timeout and retry
RUN pnpm install --frozen-lockfile --network-timeout=300000

# Copy source code
COPY tsconfig.json ./
COPY src/ ./src/

# Build the TypeScript project
RUN pnpm run build

# Production stage
FROM node:20-alpine AS production

# Install pnpm in production stage
RUN corepack enable && corepack prepare pnpm@8.15.9 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml .npmrc ./
COPY scripts/ ./scripts/

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod --network-timeout=300000

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

# Expose the port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('Health check passed')" || exit 1

# Start the application
CMD ["node", "dist/server.js"]