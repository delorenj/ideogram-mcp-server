#!/usr/bin/env node
/**
 * FastMCP Ideogram Server
 * Main server implementation using FastMCP framework
 */

import { FastMCP } from 'fastmcp';
import { IdeogramApiClient } from './utils/api-client.js';
import { FileManager } from './utils/file-manager.js';
import { IdeogramConfig } from './types/index.js';
import {
  createGenerateTool,
  createEditTool,
  createDescribeTool,
  createDownloadTool,
  createRemixTool,
  createReframeTool,
  createReplaceBackgroundTool,
  createUpscaleTool
} from './tools/index.js';

// Configuration
const IDEOGRAM_API_BASE = "https://api.ideogram.ai/v1";
const API_KEY = process.env.IDEOGRAM_API_KEY;

if (!API_KEY) {
  console.error('Error: IDEOGRAM_API_KEY environment variable must be set');
  process.exit(1);
}

// Initialize configuration
const config: IdeogramConfig = {
  apiKey: API_KEY,
  baseUrl: IDEOGRAM_API_BASE,
  defaultModel: 'V_2',
  maxImages: 8
};

// Initialize clients
const apiClient = new IdeogramApiClient(config);
const fileManager = new FileManager(apiClient);

// Create FastMCP server
const server = new FastMCP({
  name: 'Ideogram MCP Server (FastMCP)',
  version: '2.0.0'
});

// Add all tools
server.addTool(createGenerateTool(apiClient));
server.addTool(createEditTool(apiClient, fileManager));
server.addTool(createDescribeTool(apiClient, fileManager));
server.addTool(createDownloadTool(fileManager));
server.addTool(createRemixTool(apiClient, fileManager));
server.addTool(createReframeTool(apiClient, fileManager));
server.addTool(createReplaceBackgroundTool(apiClient, fileManager));
server.addTool(createUpscaleTool(apiClient, fileManager));

// Start the server
async function startServer() {
  try {
    console.log('[FastMCP] Starting Ideogram MCP Server...');
    console.log(`[FastMCP] Version: 2.0.0-fastmcp`);
    console.log(`[FastMCP] API Base: ${IDEOGRAM_API_BASE}`);
    
    await server.start({ 
      transportType: 'stdio'
    });
    
    console.log('[FastMCP] Server started successfully with stdio transport');
  } catch (error) {
    console.error('[FastMCP] Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('[FastMCP] Shutting down gracefully...');
  try {
    await server.stop();
    console.log('[FastMCP] Server stopped');
    process.exit(0);
  } catch (error) {
    console.error('[FastMCP] Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('[FastMCP] Received SIGTERM, shutting down...');
  try {
    await server.stop();
    process.exit(0);
  } catch (error) {
    console.error('[FastMCP] Error during shutdown:', error);
    process.exit(1);
  }
});

// Start the server
startServer();