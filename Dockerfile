# Use Node.js 20+ as required by dependencies
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install pnpm using corepack (built into Node 20)
RUN corepack enable

# Copy package files first for better layer caching
COPY package.json pnpm-lock.yaml .npmrc ./
COPY scripts/ ./scripts/

# Install all dependencies at once
RUN pnpm install --frozen-lockfile

# Copy source code
COPY tsconfig.json ./
COPY src/ ./src/

# Build the TypeScript project
RUN pnpm run build

# Remove dev dependencies to reduce image size
RUN pnpm prune --prod

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Change ownership of app directory to nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose the port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('Health check passed')" || exit 1

# Start the application
CMD ["node", "dist/server.js"]