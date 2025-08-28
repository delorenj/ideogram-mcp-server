# Ideogram MCP Server - Deployment Guide

## Migration from Docker to Smithery TypeScript CLI

The Ideogram MCP Server has been migrated from Docker deployment to support both traditional TypeScript compilation and Smithery TypeScript CLI deployment.

## Current Deployment Options

### Option 1: Traditional TypeScript Build (Recommended)

This is the current stable deployment method:

```bash
# Build the server
bun run build
# or npm run build

# Start the server
bun run start
# or npm run start

# Development mode
bun run dev
# or npm run dev
```

### Option 2: Smithery CLI (Future Support)

The project includes Smithery CLI integration for future deployment to the Smithery platform:

```bash
# Development (currently uses traditional dev mode)
bun run dev:smithery

# Build (currently uses traditional TypeScript build)
bun run build:smithery
```

**Note**: Direct Smithery CLI bundling is currently disabled due to conflicts between FastMCP's dependency tree and Smithery's bundler. The FastMCP framework uses dependencies that don't bundle well with esbuild in the current Smithery CLI version.

## Smithery Configuration

The project includes:

- `smithery.yaml` - Runtime configuration set to "typescript"
- `smithery.config.cjs` - Build configuration with external dependencies
- `@smithery/cli` dependency for future platform deployment

## Why This Approach?

1. **Compatibility**: FastMCP uses a complex dependency tree that conflicts with Smithery's bundler
2. **Reliability**: The existing TypeScript build process is stable and well-tested
3. **Future-Ready**: When Smithery CLI resolves bundling conflicts, the infrastructure is ready
4. **Best of Both Worlds**: Maintains current functionality while preparing for Smithery deployment

## MCP Server Functionality

The server maintains full MCP (Model Context Protocol) functionality including:

- ✅ Stdio transport for Claude Code integration
- ✅ All 8 Ideogram API tools (generate, edit, describe, etc.)
- ✅ FastMCP framework compatibility
- ✅ TypeScript type safety
- ✅ Environment variable configuration
- ✅ Graceful shutdown handling

## Deployment Commands

```bash
# Install dependencies
bun install

# Build for production
bun run build

# Start production server
bun run start

# Development with hot reload
bun run dev

# Run tests
bun test

# Lint code
bun run lint
```

## Environment Requirements

- Node.js >= 20.0.0
- Bun >= 1.0.0 (current package manager)
- `IDEOGRAM_API_KEY` environment variable

## Integration with Claude Code

The server works seamlessly with Claude Code using stdio transport:

```bash
# Add to Claude Code
claude mcp add ideogram-mcp-server /path/to/dist/server.js
```

## Future Enhancements

Once Smithery CLI resolves the bundling conflicts with FastMCP dependencies, full Smithery deployment will be enabled by updating the build scripts to use the actual `smithery build` and `smithery dev` commands.