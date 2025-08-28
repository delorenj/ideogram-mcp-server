/**
 * Generate Tool
 * Image generation tool implementation using FastMCP framework
 */

import { z } from 'zod';
import { IdeogramApiClient } from '../utils/api-client.js';
import { ImageGenerationResponse } from '../types/index.js';

const generateSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  aspect_ratio: z.enum(['ASPECT_1_1', 'ASPECT_16_9', 'ASPECT_9_16', 'ASPECT_4_3', 'ASPECT_3_4']).optional(),
  model: z.enum(['V_1', 'V_2', 'V_2_TURBO']).optional(),
  magic_prompt_option: z.enum(['AUTO', 'ON', 'OFF']).optional(),
  seed: z.number().int().min(0).max(2147483647).optional(),
  style_type: z.enum(['AUTO', 'GENERAL', 'REALISTIC', 'DESIGN', 'RENDER_3D', 'ANIME']).optional(),
  num_images: z.number().int().min(1).max(8).optional()
});

export function createGenerateTool(apiClient: IdeogramApiClient) {
  return {
    name: 'generate',
    description: 'Generate images using Ideogram AI with customizable parameters',
    parameters: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Text prompt for image generation' },
        aspect_ratio: { type: 'string', enum: ['ASPECT_1_1', 'ASPECT_16_9', 'ASPECT_9_16', 'ASPECT_4_3', 'ASPECT_3_4'], description: 'Image aspect ratio' },
        model: { type: 'string', enum: ['V_1', 'V_2', 'V_2_TURBO'], description: 'Model version to use' },
        magic_prompt_option: { type: 'string', enum: ['AUTO', 'ON', 'OFF'], description: 'Magic prompt enhancement' },
        seed: { type: 'number', minimum: 0, maximum: 2147483647, description: 'Random seed for reproducibility' },
        style_type: { type: 'string', enum: ['AUTO', 'GENERAL', 'REALISTIC', 'DESIGN', 'RENDER_3D', 'ANIME'], description: 'Style type' },
        num_images: { type: 'number', minimum: 1, maximum: 8, description: 'Number of images to generate' }
      },
      required: ['prompt']
    },
    execute: async (args: unknown): Promise<string> => {
      const validatedArgs = generateSchema.parse(args);
      try {
        // Prepare request payload
        const payload = {
          image_request: {
            prompt: validatedArgs.prompt,
            aspect_ratio: validatedArgs.aspect_ratio || 'ASPECT_1_1',
            model: validatedArgs.model || 'V_2',
            magic_prompt_option: validatedArgs.magic_prompt_option || 'AUTO',
            seed: validatedArgs.seed,
            style_type: validatedArgs.style_type,
            num_images: validatedArgs.num_images || 1
          }
        };

        // Make API request
        const response = await apiClient.post<ImageGenerationResponse>('/ideogram-v3/generate', payload);

        if (!response.success) {
          return `❌ Generation failed: ${response.error}`;
        }

        if (!response.data?.data || response.data.data.length === 0) {
          return '❌ No images were generated. Please try again with different parameters.';
        }

        // Format response with image URLs highlighted
        let result = `✅ Successfully generated ${response.data.data.length} image(s):\n\n`;
        
        response.data.data.forEach((image, index) => {
          result += `**Image ${index + 1}:**\n`;
          result += `🖼️ **URL**: ${image.url}\n`;
          if (image.is_image_safe === false) {
            result += `⚠️ **Safety**: Content flagged as potentially unsafe\n`;
          }
          result += `📏 **Resolution**: Based on ${validatedArgs.aspect_ratio || 'ASPECT_1_1'}\n`;
          result += `🎨 **Model**: ${validatedArgs.model || 'V_2'}\n`;
          if (validatedArgs.seed) {
            result += `🌱 **Seed**: ${validatedArgs.seed}\n`;
          }
          result += '\n';
        });

        result += `💡 **Tip**: Use the download_images tool to save these images locally.`;
        
        return result;
      } catch (error) {
        return `❌ Unexpected error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
      }
    }
  };
}

export { generateSchema };