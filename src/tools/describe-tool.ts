/**
 * Describe Tool
 * Image description tool implementation using FastMCP framework
 */

import { z } from 'zod';
import FormData from 'form-data';
import { IdeogramApiClient } from '../utils/api-client.js';
import { FileManager } from '../utils/file-manager.js';
import { ImageDescriptionResponse } from '../types/index.js';

const describeSchema = z.object({
  image_file: z.string().min(1, 'Image file is required')
});

export function createDescribeTool(apiClient: IdeogramApiClient, fileManager: FileManager) {
  return {
    name: 'describe',
    description: 'Get detailed descriptions of images using Ideogram AI vision capabilities',
    parameters: {
      "~standard": {} as any,
      type: 'object',
      properties: {
        image_file: { type: 'string', description: 'Path to the image file to describe' }
      },
      required: ['image_file']
    } as const,
    execute: async (args: unknown): Promise<string> => {
      const validatedArgs = describeSchema.parse(args);
      try {
        // Read and validate image file
        const imageResult = await fileManager.readImageFile(validatedArgs.image_file);
        if (!imageResult.success || !imageResult.data) {
          return `❌ Failed to read image file: ${imageResult.error}`;
        }

        // Create FormData for multipart upload
        const formData = new FormData();
        formData.append('image_file', imageResult.data, {
          filename: 'image.jpg',
          contentType: 'image/jpeg'
        });

        // Make API request with FormData - Note: describe uses /v1/describe not v3 path
        const response = await apiClient.post<ImageDescriptionResponse>('/describe', formData, {
          'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`
        });

        if (!response.success) {
          return `❌ Description failed: ${response.error}`;
        }

        if (!response.data?.descriptions || response.data.descriptions.length === 0) {
          return '❌ No description was generated. Please try with a different image.';
        }

        // Format response
        let result = `✅ **Image Description:**\n\n`;
        result += `📝 **Description**: ${response.data.descriptions[0].text}\n\n`;
        result += `🔍 **Analysis**: The AI has analyzed the visual content, composition, colors, objects, and context within the image to provide this comprehensive description.\n`;
        
        return result;
      } catch (error) {
        return `❌ Unexpected error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
      }
    }
  };
}

export { describeSchema };