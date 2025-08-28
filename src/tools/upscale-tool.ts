/**
 * Upscale Tool
 * Image upscaling tool implementation using FastMCP framework
 */

import { z } from 'zod';
import FormData from 'form-data';
import { IdeogramApiClient } from '../utils/api-client.js';
import { FileManager } from '../utils/file-manager.js';
import { ImageUpscaleResponse } from '../types/index.js';

const upscaleSchema = z.object({
  image_file: z.string().min(1, 'Image file is required'),
  detail_scale: z.number().min(1).max(5).optional(),
  scale_factor: z.number().min(1).max(4).optional(),
  resemblance: z.number().min(0).max(100).optional()
});

export function createUpscaleTool(apiClient: IdeogramApiClient, fileManager: FileManager) {
  return {
    name: 'upscale',
    description: 'Upscale images to higher resolution using Ideogram upscaling technology',
    parameters: upscaleSchema,
    execute: async (args: unknown): Promise<string> => {
      const validatedArgs = upscaleSchema.parse(args);
      try {
        // Read and validate image file
        const imageResult = await fileManager.readImageFile(args.image_file);
        if (!imageResult.success || !imageResult.data) {
          return `❌ Failed to read image file: ${imageResult.error}`;
        }

        // Create FormData for multipart upload
        const formData = new FormData();
        formData.append('image_request', JSON.stringify({
          detail_scale: args.detail_scale || 2,
          scale_factor: args.scale_factor || 2,
          resemblance: args.resemblance || 80
        }));
        formData.append('image_file', imageResult.data, {
          filename: 'image.jpg',
          contentType: 'image/jpeg'
        });

        // Make API request with FormData - Note: upscale uses /v1/upscale not v3 path
        const response = await apiClient.post<ImageUpscaleResponse>('/upscale', formData, {
          'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`
        });

        if (!response.success) {
          return `❌ Upscale failed: ${response.error}`;
        }

        if (!response.data?.data || response.data.data.length === 0) {
          return '❌ No upscaled image was generated. Please try with a different image.';
        }

        // Format response
        let result = `✅ Successfully upscaled image:\n\n`;
        
        const image = response.data.data[0]; // Upscale typically returns single image
        result += `**Upscaled Image:**\n`;
        result += `🖼️ **URL**: ${image.url}\n`;
        if (image.is_image_safe === false) {
          result += `⚠️ **Safety**: Content flagged as potentially unsafe\n`;
        }
        result += `📈 **Scale Factor**: ${args.scale_factor || 2}x\n`;
        result += `🔍 **Detail Scale**: ${args.detail_scale || 2}\n`;
        result += `🎯 **Resemblance**: ${args.resemblance || 80}%\n`;

        result += `\n💡 **Tip**: Use the download_images tool to save this upscaled image locally.`;
        
        return result;
      } catch (error) {
        return `❌ Unexpected error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
      }
    }
  };
}

export { upscaleSchema };