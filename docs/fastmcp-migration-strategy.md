# FastMCP Migration Strategy for Ideogram MCP Server

## Executive Summary

This document outlines a comprehensive migration strategy to transition the Ideogram MCP Server from the standard `@modelcontextprotocol/sdk` to the FastMCP TypeScript framework. The migration aims to improve developer experience, reduce boilerplate code, and enhance maintainability while preserving all existing functionality.

## Current Architecture Analysis

### Current Implementation
- **Framework**: `@modelcontextprotocol/sdk` v1.8.0
- **Language**: TypeScript with ES modules
- **Transport**: StdioServerTransport
- **Validation**: Zod schemas
- **Tools**: 4 main tools (generate, edit, describe, download_images)
- **Features**: Image generation, editing, description, and download capabilities

### Current Code Patterns
```typescript
// Current MCP SDK Pattern
const server = new McpServer({
  name: "Ideogram MCP",
  version: "1.0.0",
  description: "MCP server for Ideogram AI API"
});

server.tool(
  "generate",
  {
    prompt: z.string(),
    aspect_ratio: z.enum(["ASPECT_1_1", "ASPECT_16_9", ...]).optional(),
    // ... more schema definitions
  },
  async ({ prompt, aspect_ratio, ... }) => {
    // Implementation logic
    return handleSuccess(response.data);
  }
);
```

## Target Architecture (FastMCP)

### FastMCP Framework Options
Two viable TypeScript FastMCP implementations identified:

1. **punkpeye/fastmcp** - Comprehensive framework with advanced features
2. **JeromyJSmith/fastmcp-js** - Simplified framework focusing on ease of use

### Recommended Target Pattern
```typescript
// FastMCP Pattern
import { FastMCP } from "fastmcp";
import { z } from "zod";

const server = new FastMCP({
  name: "Ideogram MCP",
  version: "1.0.0",
  description: "MCP server for Ideogram AI API"
});

server.addTool({
  name: "generate",
  description: "Generate images using Ideogram AI",
  parameters: z.object({
    prompt: z.string(),
    aspect_ratio: z.enum(["ASPECT_1_1", "ASPECT_16_9", ...]).optional(),
    // ... simplified schema definitions
  }),
  execute: async (args) => {
    // Implementation logic
    return JSON.stringify(response.data, null, 2);
  }
});
```

## Migration Benefits

### 1. Reduced Boilerplate
- **Before**: Manual server setup, transport configuration, complex error handling
- **After**: Simplified server initialization, built-in error handling, automatic schema generation

### 2. Enhanced Developer Experience
- Built-in CLI tools: `npx fastmcp dev` and `npx fastmcp inspect`
- Automatic type validation
- Simplified tool registration
- Better error messages

### 3. Modern Patterns
- Clean, declarative tool definitions
- Consistent return patterns
- Built-in progress reporting
- Session management support

### 4. Future-Proofing
- Active development and community
- Built on official SDK foundation
- OAuth support for advanced authentication
- HTTP streaming capabilities

## Detailed Migration Plan

### Phase 1: Preparation and Setup (1-2 days)

#### Step 1.1: Research and Validation
- [x] Research FastMCP TypeScript implementations
- [x] Analyze current codebase structure
- [x] Identify migration requirements
- [ ] Test FastMCP framework locally

#### Step 1.2: Environment Preparation
- [ ] Create migration branch: `feature/fastmcp-migration`
- [ ] Install FastMCP dependencies
- [ ] Update development environment

### Phase 2: Core Migration (2-3 days)

#### Step 2.1: Framework Migration
- [ ] Replace `@modelcontextprotocol/sdk` with `fastmcp`
- [ ] Update package.json dependencies
- [ ] Migrate server initialization code

#### Step 2.2: Tool Migration
- [ ] Migrate `generate` tool to FastMCP pattern
- [ ] Migrate `edit` tool to FastMCP pattern  
- [ ] Migrate `describe` tool to FastMCP pattern
- [ ] Migrate `download_images` tool to FastMCP pattern

#### Step 2.3: Schema and Validation
- [ ] Update Zod schemas to FastMCP patterns
- [ ] Simplify parameter validation
- [ ] Implement FastMCP error handling

### Phase 3: Enhancement and Testing (2-3 days)

#### Step 3.1: Enhanced Features
- [ ] Implement FastMCP CLI development tools
- [ ] Add progress reporting for long operations
- [ ] Enhance error handling and logging

#### Step 3.2: Testing Strategy
- [ ] Unit tests for all migrated tools
- [ ] Integration tests with Claude Desktop
- [ ] Performance benchmarking
- [ ] Error scenario testing

#### Step 3.3: Documentation Update
- [ ] Update README with FastMCP setup
- [ ] Document new CLI development tools
- [ ] Create migration guide for other developers

### Phase 4: Deployment and Optimization (1-2 days)

#### Step 4.1: Build and Package
- [ ] Update TypeScript configuration
- [ ] Test build process
- [ ] Validate npm package structure

#### Step 4.2: Deployment Testing
- [ ] Test with Claude Desktop integration
- [ ] Validate all tool functionality
- [ ] Performance testing

## Detailed Code Migration Guide

### 1. Package.json Changes

#### Current Dependencies
```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.8.0",
    "axios": "^1.6.7",
    "form-data": "^4.0.0",
    "zod": "^3.22.4"
  }
}
```

#### Target Dependencies
```json
{
  "dependencies": {
    "fastmcp": "^1.0.0", // or latest version
    "axios": "^1.6.7",
    "form-data": "^4.0.0",
    "zod": "^3.22.4"
  }
}
```

### 2. Server Initialization Migration

#### Current Pattern
```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
  name: "Ideogram MCP",
  version: "1.0.0",
  description: "MCP server for Ideogram AI API"
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

#### Target Pattern
```typescript
import { FastMCP } from "fastmcp";

const server = new FastMCP({
  name: "Ideogram MCP",
  version: "1.0.0",
  description: "MCP server for Ideogram AI API"
});

server.start({ transportType: "stdio" });
```

### 3. Tool Migration Examples

#### Generate Tool Migration

**Current Implementation:**
```typescript
server.tool(
  "generate",
  {
    prompt: z.string(),
    aspect_ratio: z.enum(["ASPECT_1_1", "ASPECT_16_9", "ASPECT_9_16", "ASPECT_4_3", "ASPECT_3_4"]).optional(),
    model: z.enum(["V_1", "V_2", "V_2_TURBO"]).optional(),
    magic_prompt_option: z.enum(["AUTO", "ON", "OFF"]).optional(),
    num_images: z.number().min(1).max(8).optional(),
    seed: z.number().int().min(0).max(2147483647).optional()
  },
  async ({ prompt, aspect_ratio, model, magic_prompt_option, num_images, seed }) => {
    try {
      const response = await axios.post(
        `${IDEOGRAM_API_BASE}/generate`,
        {
          image_request: {
            prompt,
            aspect_ratio,
            model: model || "V_2",
            magic_prompt_option: magic_prompt_option || "AUTO",
            num_images: num_images || 1,
            seed
          }
        },
        {
          headers: {
            "Api-Key": API_KEY,
            "Content-Type": "application/json"
          }
        }
      );

      return handleSuccess(response.data);
    } catch (error) {
      return handleError(error);
    }
  }
);
```

**Target Implementation:**
```typescript
server.addTool({
  name: "generate",
  description: "Generate images using Ideogram AI",
  parameters: z.object({
    prompt: z.string(),
    aspect_ratio: z.enum(["ASPECT_1_1", "ASPECT_16_9", "ASPECT_9_16", "ASPECT_4_3", "ASPECT_3_4"]).optional(),
    model: z.enum(["V_1", "V_2", "V_2_TURBO"]).optional(),
    magic_prompt_option: z.enum(["AUTO", "ON", "OFF"]).optional(),
    num_images: z.number().min(1).max(8).optional(),
    seed: z.number().int().min(0).max(2147483647).optional()
  }),
  execute: async (args) => {
    const response = await axios.post(
      `${IDEOGRAM_API_BASE}/generate`,
      {
        image_request: {
          prompt: args.prompt,
          aspect_ratio: args.aspect_ratio,
          model: args.model || "V_2",
          magic_prompt_option: args.magic_prompt_option || "AUTO",
          num_images: args.num_images || 1,
          seed: args.seed
        }
      },
      {
        headers: {
          "Api-Key": API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    return JSON.stringify(response.data, null, 2);
  }
});
```

#### Download Images Tool Migration

**Current Implementation:**
```typescript
server.tool(
  "download_images",
  {
    urls: z.array(z.string().url()),
    output_dir: z.string()
  },
  async ({ urls, output_dir }) => {
    try {
      const downloadedPaths = await downloadImages(urls, output_dir);
      
      if (downloadedPaths.length === 0) {
        return {
          content: [{ 
            type: "text" as const, 
            text: "No images were downloaded successfully." 
          }],
          isError: true
        };
      }

      return {
        content: [{ 
          type: "text" as const, 
          text: `Successfully downloaded ${downloadedPaths.length} images to:\n${downloadedPaths.join('\n')}` 
        }]
      };
    } catch (error) {
      return handleError(error);
    }
  }
);
```

**Target Implementation:**
```typescript
server.addTool({
  name: "download_images", 
  description: "Download images from URLs to local directory",
  parameters: z.object({
    urls: z.array(z.string().url()),
    output_dir: z.string()
  }),
  execute: async (args) => {
    const downloadedPaths = await downloadImages(args.urls, args.output_dir);
    
    if (downloadedPaths.length === 0) {
      throw new Error("No images were downloaded successfully.");
    }

    return `Successfully downloaded ${downloadedPaths.length} images to:\n${downloadedPaths.join('\n')}`;
  }
});
```

## Testing Strategy

### 1. Unit Testing

#### Current Testing Gaps
- No existing test suite
- Manual testing only

#### Target Testing Approach
```typescript
import { describe, it, expect } from '@jest/globals';
import { FastMCP } from 'fastmcp';

describe('Ideogram MCP Server', () => {
  let server: FastMCP;

  beforeEach(() => {
    server = new FastMCP({
      name: "Test Server",
      version: "1.0.0"
    });
  });

  it('should register generate tool', () => {
    // Test tool registration
  });

  it('should validate generate parameters', async () => {
    // Test parameter validation
  });

  it('should handle API errors gracefully', async () => {
    // Test error handling
  });
});
```

### 2. Integration Testing

#### CLI Development Tools Testing
```bash
# Test development server
npx fastmcp dev src/index.ts

# Test tools interactively  
npx fastmcp inspect src/index.ts
```

#### Claude Desktop Integration
- Test all tools in Claude Desktop
- Verify parameter validation
- Test error scenarios

### 3. Performance Testing

#### Benchmarks to Measure
- Tool execution time
- Memory usage
- Startup time
- Response payload size

## Risk Assessment

### High Risk Areas

1. **Breaking Changes in Tool Interface**
   - **Risk**: Tools may not work with existing clients
   - **Mitigation**: Thorough integration testing with Claude Desktop

2. **Dependency Conflicts**
   - **Risk**: FastMCP may have conflicting dependencies
   - **Mitigation**: Test in isolated environment first

3. **Performance Regression**
   - **Risk**: FastMCP may be slower than current implementation
   - **Mitigation**: Comprehensive performance benchmarking

### Medium Risk Areas

1. **Learning Curve**
   - **Risk**: New patterns may require development time
   - **Mitigation**: Comprehensive documentation and examples

2. **Community Support**
   - **Risk**: FastMCP may have smaller community
   - **Mitigation**: Maintain fallback plan to current SDK

### Low Risk Areas

1. **Core Functionality**
   - **Risk**: Basic tools should work identically
   - **Mitigation**: Similar underlying concepts

## Success Criteria

### Functional Requirements
- [ ] All 4 tools (generate, edit, describe, download_images) work identically
- [ ] Integration with Claude Desktop functions perfectly
- [ ] No performance regression
- [ ] All existing parameters and options supported

### Developer Experience Requirements  
- [ ] Reduced lines of code (target: 20-30% reduction)
- [ ] Improved error messages and debugging
- [ ] Working CLI development tools
- [ ] Comprehensive test suite

### Quality Requirements
- [ ] 100% test coverage for all tools
- [ ] TypeScript strict mode compliance
- [ ] ESLint with no errors
- [ ] Updated documentation

## Implementation Timeline

### Week 1: Preparation and Core Migration
- Days 1-2: Setup and framework installation
- Days 3-5: Core server and tool migration

### Week 2: Enhancement and Testing  
- Days 1-3: Enhanced features and testing
- Days 4-5: Documentation and deployment preparation

### Total Estimated Time: 8-10 days

## Post-Migration Benefits

### Immediate Benefits
- Cleaner, more maintainable code
- Better developer experience with CLI tools
- Improved error handling
- Modern TypeScript patterns

### Long-term Benefits
- Future-proofed architecture
- OAuth support for advanced features
- HTTP streaming capabilities
- Better community support and examples

## Rollback Plan

If migration encounters critical issues:

1. **Immediate Rollback**: Revert to feature branch with current SDK
2. **Partial Migration**: Keep FastMCP for development, current SDK for production
3. **Hybrid Approach**: Migrate tools incrementally

## Conclusion

The migration to FastMCP presents a significant opportunity to modernize the Ideogram MCP Server with minimal risk. The comprehensive research shows that FastMCP TypeScript implementations are mature and well-suited for our use case. The migration plan provides a systematic approach to transition while maintaining all existing functionality and adding significant developer experience improvements.

The estimated 8-10 day timeline is conservative and accounts for thorough testing and documentation. The risk assessment shows manageable risks with clear mitigation strategies. Success criteria ensure we maintain functionality while gaining the benefits of modern tooling.

---

**Research Completed by**: PortExpert Agent  
**Date**: 2025-08-27  
**Status**: Ready for Implementation  
**Next Steps**: Begin Phase 1 preparation and setup