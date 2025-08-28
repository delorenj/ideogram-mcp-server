/**
 * Replace Background Tool
 * Background replacement tool implementation using FastMCP framework
 */

import { z } from 'zod';
import FormData from 'form-data';
import { IdeogramApiClient } from '../utils/api-client.js';
import { FileManager } from '../utils/file-manager.js';
import { ImageGenerationResponse } from '../types/index.js';

const replaceBackgroundSchema = z.object({
  image_file: z.string().min(1, 'Image file is required'),
  prompt: z.string().min(1, 'Background prompt is required'),
  model: z.enum(['V_1', 'V_2', 'V_2_TURBO']).optional(),
  magic_prompt_option: z.enum(['AUTO', 'ON', 'OFF']).optional(),
  seed: z.number().int().min(0).max(2147483647).optional(),
  num_images: z.number().int().min(1).max(8).optional()
});

export function createReplaceBackgroundTool(apiClient: IdeogramApiClient, fileManager: FileManager) {
  return {
    name: 'replace_background',
    description: 'Replace the background of images with new scenes using Ideogram v3',
    parameters: replaceBackgroundSchema,
    execute: async (args: unknown): Promise<string> => {
      const validatedArgs = replaceBackgroundSchema.parse(args);
      try {
        // Read and validate image file
        const imageResult = await fileManager.readImageFile(args.image_file);
        if (!imageResult.success || !imageResult.data) {
          return `❌ Failed to read image file: ${imageResult.error}`;
        }

        // Create FormData for multipart upload
        const formData = new FormData();
        formData.append('image_request', JSON.stringify({
          prompt: args.prompt,
          model: args.model || 'V_2',
          magic_prompt_option: args.magic_prompt_option || 'AUTO',
          seed: args.seed,
          num_images: args.num_images || 1
        }));
        formData.append('image_file', imageResult.data, {
          filename: 'image.jpg',
          contentType: 'image/jpeg'
        });

        // Make API request with FormData
        const response = await apiClient.post<ImageGenerationResponse>('/ideogram-v3/replace-background', formData, {
          'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`
        });

        if (!response.success) {
          return `❌ Background replacement failed: ${response.error}`;
        }

        if (!response.data?.data || response.data.data.length === 0) {
          return '❌ No images with replaced backgrounds were generated. Please try with a different image or prompt.';
        }

        // Format response
        let result = `✅ Successfully replaced background and generated ${response.data.data.length} result(s):\n\n`;
        
        response.data.data.forEach((image, index) => {
          result += `**Background Replaced Image ${index + 1}:**\n`;
          result += `🖼️ **URL**: ${image.url}\n`;
          if (image.is_image_safe === false) {
            result += `⚠️ **Safety**: Content flagged as potentially unsafe\n`;
          }
          result += `🌄 **New Background**: ${args.prompt}\n`;
          result += `🎨 **Model**: ${args.model || 'V_2'}\n`;
          if (args.seed) {
            result += `🌱 **Seed**: ${args.seed}\n`;
          }
          result += '\n';
        });

        result += `💡 **Tip**: Use the download_images tool to save these images with replaced backgrounds locally.`;
        
        return result;
      } catch (error) {
        return `❌ Unexpected error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
      }
    }
  };
}

export { replaceBackgroundSchema };