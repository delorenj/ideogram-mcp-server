/**
 * Remix Tool
 * Image remix tool implementation using FastMCP framework
 */

import { z } from 'zod';
import FormData from 'form-data';
import { IdeogramApiClient } from '../utils/api-client.js';
import { FileManager } from '../utils/file-manager.js';
import { ImageGenerationResponse } from '../types/index.js';

const remixSchema = z.object({
  image_file: z.string().min(1, 'Image file is required'),
  prompt: z.string().min(1, 'Prompt is required'),
  model: z.enum(['V_1', 'V_2', 'V_2_TURBO']).optional(),
  magic_prompt_option: z.enum(['AUTO', 'ON', 'OFF']).optional(),
  seed: z.number().int().min(0).max(2147483647).optional(),
  style_type: z.enum(['AUTO', 'GENERAL', 'REALISTIC', 'DESIGN', 'RENDER_3D', 'ANIME']).optional(),
  num_images: z.number().int().min(1).max(8).optional()
});

export function createRemixTool(apiClient: IdeogramApiClient, fileManager: FileManager) {
  return {
    name: 'remix',
    description: 'Remix existing images with new prompts using Ideogram v3',
    parameters: remixSchema,
    execute: async (args: unknown): Promise<string> => {
      const validatedArgs = remixSchema.parse(args);
      try {
        // Read and validate image file
        const imageResult = await fileManager.readImageFile(validatedArgs.image_file);
        if (!imageResult.success || !imageResult.data) {
          return `❌ Failed to read image file: ${imageResult.error}`;
        }

        // Create FormData for multipart upload
        const formData = new FormData();
        formData.append('image_request', JSON.stringify({
          prompt: validatedArgs.prompt,
          model: validatedArgs.model || 'V_2',
          magic_prompt_option: validatedArgs.magic_prompt_option || 'AUTO',
          seed: validatedArgs.seed,
          style_type: validatedArgs.style_type,
          num_images: validatedArgs.num_images || 1
        }));
        formData.append('image_file', imageResult.data, {
          filename: 'image.jpg',
          contentType: 'image/jpeg'
        });

        // Make API request with FormData
        const response = await apiClient.post<ImageGenerationResponse>('/ideogram-v3/remix', formData, {
          'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`
        });

        if (!response.success) {
          return `❌ Remix failed: ${response.error}`;
        }

        if (!response.data?.data || response.data.data.length === 0) {
          return '❌ No remixed images were generated. Please try with a different image or prompt.';
        }

        // Format response
        let result = `✅ Successfully remixed image and generated ${response.data.data.length} result(s):\n\n`;
        
        response.data.data.forEach((image, index) => {
          result += `**Remixed Image ${index + 1}:**\n`;
          result += `🖼️ **URL**: ${image.url}\n`;
          if (image.is_image_safe === false) {
            result += `⚠️ **Safety**: Content flagged as potentially unsafe\n`;
          }
          result += `🎨 **Model**: ${validatedArgs.model || 'V_2'}\n`;
          if (validatedArgs.seed) {
            result += `🌱 **Seed**: ${validatedArgs.seed}\n`;
          }
          result += '\n';
        });

        result += `💡 **Tip**: Use the download_images tool to save these remixed images locally.`;
        
        return result;
      } catch (error) {
        return `❌ Unexpected error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
      }
    }
  };
}

export { remixSchema };