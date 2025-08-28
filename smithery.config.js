/**
 * Smithery configuration for Ideogram MCP Server
 * This config ensures proper bundling and external dependencies
 */
module.exports = {
  // Mark certain packages as external to avoid bundling issues
  external: [
    // FastMCP framework - should be bundled for proper functionality
    // 'fastmcp',
    // Node.js built-in modules
    'fs',
    'path',
    'crypto',
    'http',
    'https',
    'stream',
    'util',
    'url',
    'querystring',
    'buffer',
    'events',
    'os'
  ],
  
  // Build options
  minify: false, // Keep readable for debugging
  target: 'node20', // Match Node.js version requirement
  
  // Entry point
  entryPoint: 'src/server.ts',
  
  // Output configuration
  outdir: 'dist',
  
  // Enable source maps for debugging
  sourcemap: true,
  
  // Define NODE_ENV for production builds
  define: {
    'process.env.NODE_ENV': '"production"'
  }
};