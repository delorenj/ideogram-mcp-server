import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios, { AxiosError } from "axios";
import FormData from "form-data";
import fs from 'fs/promises';
import path from 'path';

// Create an MCP server
const server = new McpServer({
  name: "Ideogram MCP",
  version: "1.0.0",
  description: "MCP server for Ideogram AI API"
});

// Define the base URL and API key configuration
const IDEOGRAM_API_BASE = "https://api.ideogram.ai";
const API_KEY = process.env.IDEOGRAM_API_KEY;

if (!API_KEY) {
  throw new Error("IDEOGRAM_API_KEY environment variable must be set");
}

// Helper function for error handling
const handleError = (error: unknown) => {
  const errorMessage = error instanceof AxiosError 
    ? `API Error: ${error.response?.data?.message || error.message}`
    : `Error: ${error instanceof Error ? error.message : 'An unknown error occurred'}`;

  return {
    content: [{
      type: "text" as const,
      text: errorMessage
    }],
    isError: true
  };
};

// Helper function for success response
const handleSuccess = (data: unknown) => ({
  content: [{
    type: "text" as const,
    text: JSON.stringify(data, null, 2)
  }]
});

// Helper function to download images
async function downloadImages(urls: string[], outputDir: string): Promise<string[]> {
  await fs.mkdir(outputDir, { recursive: true });
  
  const downloadedPaths: string[] = [];
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const timestamp = Date.now();
      const filename = `image_${timestamp}_${i}.png`;
      const filepath = path.join(outputDir, filename);
      
      await fs.writeFile(filepath, response.data);
      downloadedPaths.push(filepath);
    } catch (error) {
      console.error(`Failed to download image ${url}:`, error);
    }
  }
  
  return downloadedPaths;
}

// Tool to download generated images
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

// Generate images tool
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

// Edit image tool
server.tool(
  "edit",
  {
    image_file: z.string(),
    mask: z.string(),
    prompt: z.string(),
    model: z.enum(["V_2", "V_2_TURBO"])
  },
  async ({ image_file, mask, prompt, model }) => {
    try {
      const formData = new FormData();
      formData.append("image_file", image_file);
      formData.append("mask", mask);
      formData.append("prompt", prompt);
      formData.append("model", model);

      const response = await axios.post(
        `${IDEOGRAM_API_BASE}/edit`,
        formData,
        {
          headers: {
            "Api-Key": API_KEY,
            ...formData.getHeaders()
          }
        }
      );

      return handleSuccess(response.data);
    } catch (error) {
      return handleError(error);
    }
  }
);

// Describe image tool
server.tool(
  "describe",
  {
    image_file: z.string()
  },
  async ({ image_file }) => {
    try {
      const formData = new FormData();
      formData.append("image_file", image_file);

      const response = await axios.post(
        `${IDEOGRAM_API_BASE}/describe`,
        formData,
        {
          headers: {
            "Api-Key": API_KEY,
            ...formData.getHeaders()
          }
        }
      );

      return handleSuccess(response.data);
    } catch (error) {
      return handleError(error);
    }
  }
);

// Add a prompt template for image generation
server.prompt(
  "generate_image",
  { description: z.string() },
  ({ description }) => ({
    messages: [{
      role: "user",
      content: {
        type: "text" as const,
        text: `Please generate an image based on this description: ${description}`
      }
    }]
  })
);

// Start the server with stdio transport
const transport = new StdioServerTransport();
await server.connect(transport); 