/**
 * Edit Tool
 * Image editing tool implementation using FastMCP framework
 */

import { z } from 'zod';
import FormData from 'form-data';
import { IdeogramApiClient } from '../utils/api-client.js';
import { FileManager } from '../utils/file-manager.js';
import { ImageEditResponse } from '../types/index.js';

const editSchema = z.object({
  image_file: z.string().min(1, 'Image file is required'),
  mask: z.string().min(1, 'Mask file is required'),
  prompt: z.string().min(1, 'Prompt is required'),
  model: z.enum(['V_1', 'V_2', 'V_2_TURBO']).optional(),
  magic_prompt_option: z.enum(['AUTO', 'ON', 'OFF']).optional(),
  seed: z.number().int().min(0).max(2147483647).optional(),
  num_images: z.number().int().min(1).max(8).optional()
});

export function createEditTool(apiClient: IdeogramApiClient, fileManager: FileManager) {
  return {
    name: 'edit',
    description: 'Edit images using Ideogram AI with mask-based inpainting',
    parameters: {
      "~standard": 1,
      type: 'object',
      properties: {
        image_file: { type: 'string', description: 'Path to the image file to edit' },
        mask: { type: 'string', description: 'Path to the mask file' },
        prompt: { type: 'string', description: 'Text prompt for the edit' },
        model: { type: 'string', enum: ['V_1', 'V_2', 'V_2_TURBO'], description: 'Model version to use' },
        magic_prompt_option: { type: 'string', enum: ['AUTO', 'ON', 'OFF'], description: 'Magic prompt enhancement' },
        seed: { type: 'number', minimum: 0, maximum: 2147483647, description: 'Random seed for reproducibility' },
        num_images: { type: 'number', minimum: 1, maximum: 8, description: 'Number of images to generate' }
      },
      required: ['image_file', 'mask', 'prompt']
    } as const,
    execute: async (args: unknown): Promise<string> => {
      const validatedArgs = editSchema.parse(args);
      try {
        // Read and validate image file
        const imageResult = await fileManager.readImageFile(validatedArgs.image_file);
        if (!imageResult.success || !imageResult.data) {
          return `❌ Failed to read image file: ${imageResult.error}`;
        }

        // Read and validate mask file
        const maskResult = await fileManager.readImageFile(validatedArgs.mask);
        if (!maskResult.success || !maskResult.data) {
          return `❌ Failed to read mask file: ${maskResult.error}`;
        }

        // Create FormData for multipart upload
        const formData = new FormData();
        formData.append('image_request', JSON.stringify({
          prompt: validatedArgs.prompt,
          model: validatedArgs.model || 'V_2',
          magic_prompt_option: validatedArgs.magic_prompt_option || 'AUTO',
          seed: validatedArgs.seed,
          num_images: validatedArgs.num_images || 1
        }));
        formData.append('image_file', imageResult.data, {
          filename: 'image.jpg',
          contentType: 'image/jpeg'
        });
        formData.append('mask', maskResult.data, {
          filename: 'mask.jpg',
          contentType: 'image/jpeg'
        });

        // Make API request with FormData
        const response = await apiClient.post<ImageEditResponse>('/ideogram-v3/edit', formData, {
          'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`
        });

        if (!response.success) {
          return `❌ Edit failed: ${response.error}`;
        }

        if (!response.data?.data || response.data.data.length === 0) {
          return '❌ No edited images were generated. Please check your mask and try again.';
        }

        // Format response
        let result = `✅ Successfully edited image and generated ${response.data.data.length} result(s):\n\n`;
        
        response.data.data.forEach((image, index) => {
          result += `**Edited Image ${index + 1}:**\n`;
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

        result += `💡 **Tip**: Use the download_images tool to save these edited images locally.`;
        
        return result;
      } catch (error) {
        return `❌ Unexpected error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
      }
    }
  };
}

export { editSchema };