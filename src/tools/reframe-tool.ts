/**
 * Reframe Tool
 * Image reframing tool implementation using FastMCP framework
 */

import { z } from 'zod';
import FormData from 'form-data';
import { IdeogramApiClient } from '../utils/api-client.js';
import { FileManager } from '../utils/file-manager.js';
import { ImageGenerationResponse } from '../types/index.js';

const reframeSchema = z.object({
  image_file: z.string().min(1, 'Image file is required'),
  aspect_ratio: z.enum(['ASPECT_1_1', 'ASPECT_16_9', 'ASPECT_9_16', 'ASPECT_4_3', 'ASPECT_3_4']),
  model: z.enum(['V_1', 'V_2', 'V_2_TURBO']).optional(),
  magic_prompt_option: z.enum(['AUTO', 'ON', 'OFF']).optional(),
  seed: z.number().int().min(0).max(2147483647).optional(),
  num_images: z.number().int().min(1).max(8).optional()
});

export function createReframeTool(apiClient: IdeogramApiClient, fileManager: FileManager) {
  return {
    name: 'reframe',
    description: 'Reframe existing images to different aspect ratios using Ideogram v3',
    parameters: {
      type: 'object',
      properties: {
        image_file: { type: 'string', description: 'Path to the image file to reframe' },
        aspect_ratio: { 
          type: 'string', 
          enum: ['ASPECT_1_1', 'ASPECT_16_9', 'ASPECT_9_16', 'ASPECT_4_3', 'ASPECT_3_4'],
          description: 'Target aspect ratio for the reframed image'
        },
        model: { type: 'string', enum: ['V_1', 'V_2', 'V_2_TURBO'], description: 'Model version to use' },
        magic_prompt_option: { type: 'string', enum: ['AUTO', 'ON', 'OFF'], description: 'Magic prompt enhancement' },
        seed: { type: 'number', minimum: 0, maximum: 2147483647, description: 'Random seed for reproducibility' },
        num_images: { type: 'number', minimum: 1, maximum: 8, description: 'Number of images to generate' }
      },
      required: ['image_file', 'aspect_ratio']
    } as const,
        execute: async (args: unknown): Promise<string> => {
      const validatedArgs = reframeSchema.parse(args);
      try {
        // Read and validate image file
        const imageResult = await fileManager.readImageFile(validatedArgs.image_file);
        if (!imageResult.success || !imageResult.data) {
          return `❌ Failed to read image file: ${imageResult.error}`;
        }

        // Create FormData for multipart upload
        const formData = new FormData();
        formData.append('image_request', JSON.stringify({
          aspect_ratio: validatedArgs.aspect_ratio,
          model: validatedArgs.model || 'V_2',
          magic_prompt_option: validatedArgs.magic_prompt_option || 'AUTO',
          seed: validatedArgs.seed,
          num_images: validatedArgs.num_images || 1
        }));
        formData.append('image_file', imageResult.data, {
          filename: 'image.jpg',
          contentType: 'image/jpeg'
        });

        // Make API request with FormData
        const response = await apiClient.post<ImageGenerationResponse>('/ideogram-v3/reframe', formData, {
          'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`
        });

        if (!response.success) {
          return `❌ Reframe failed: ${response.error}`;
        }

        if (!response.data?.data || response.data.data.length === 0) {
          return '❌ No reframed images were generated. Please try with a different image or aspect ratio.';
        }

        // Format response
        let result = `✅ Successfully reframed image to ${validatedArgs.aspect_ratio} and generated ${response.data.data.length} result(s):\n\n`;
        
        response.data.data.forEach((image, index) => {
          result += `**Reframed Image ${index + 1}:**\n`;
          result += `🖼️ **URL**: ${image.url}\n`;
          if (image.is_image_safe === false) {
            result += `⚠️ **Safety**: Content flagged as potentially unsafe\n`;
          }
          result += `📏 **Aspect Ratio**: ${validatedArgs.aspect_ratio}\n`;
          result += `🎨 **Model**: ${validatedArgs.model || 'V_2'}\n`;
          if (validatedArgs.seed) {
            result += `🌱 **Seed**: ${validatedArgs.seed}\n`;
          }
          result += '\n';
        });

        result += `💡 **Tip**: Use the download_images tool to save these reframed images locally.`;
        
        return result;
      } catch (error) {
        return `❌ Unexpected error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
      }
    }
  };
}

export { reframeSchema };