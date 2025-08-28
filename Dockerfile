# Use Node.js 20+ as required by dependencies
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@8

# Copy package files and build configuration
COPY package.json pnpm-lock.yaml .npmrc tsconfig.json ./
COPY scripts/ ./scripts/
COPY src/ ./src/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the TypeScript project
RUN pnpm run build

# Expose the port (adjust as needed for your application)
EXPOSE 3000

# Start the application
CMD ["node", "dist/server.js"]