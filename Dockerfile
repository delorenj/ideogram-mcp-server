FROM node:20-alpine

WORKDIR /app

# Install bun
RUN npm install -g bun

# Copy package files
COPY package.json bun.lockb* ./

# Install with bun
RUN bun install --frozen-lockfile

# Copy source
COPY tsconfig.json ./
COPY src/ ./src/

# Build
RUN bun run build

# Security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000

CMD ["bun", "run", "dist/server.js"]
