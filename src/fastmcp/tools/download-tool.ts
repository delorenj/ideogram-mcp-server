/**
 * FastMCP Download Tool
 * Image download tool implementation using FastMCP framework
 */

import { z } from 'zod';
import { FileManager } from '../utils/file-manager';

const downloadSchema = z.object({
  urls: z.array(z.string().url()).min(1, 'At least one URL is required'),
  output_dir: z.string().min(1, 'Output directory is required')
});

export function createDownloadTool(fileManager: FileManager) {
  return {
    name: 'download_images',
    description: 'Download images from URLs to a specified directory with parallel processing',
    parameters: downloadSchema,
    execute: async (args: z.infer<typeof downloadSchema>): Promise<string> => {
      try {
        const result = await fileManager.downloadImages(args.urls, args.output_dir);
        
        if (!result.success && (!result.results || result.results.length === 0)) {
          return `❌ Download failed: ${result.error}`;
        }

        // Format response with detailed results
        let response = `📥 **Download Results:**\n\n`;
        
        if (result.summary) {
          response += `📊 **Summary**: ${result.summary.successful}/${result.summary.total} downloads successful\n\n`;
        }

        // Show successful downloads
        const successful = result.results.filter(r => r.success);
        if (successful.length > 0) {
          response += `✅ **Successfully downloaded:**\n`;
          successful.forEach((item, index) => {
            response += `${index + 1}. ${item.filepath}\n`;
            if (item.size) {
              response += `   📦 Size: ${(item.size / 1024).toFixed(1)} KB\n`;
            }
          });
          response += '\n';
        }

        // Show failed downloads
        const failed = result.results.filter(r => !r.success);
        if (failed.length > 0) {
          response += `❌ **Failed downloads:**\n`;
          failed.forEach((item, index) => {
            response += `${index + 1}. ${item.url}\n`;
            response += `   ❌ Error: ${item.error}\n`;
          });
          response += '\n';
        }

        response += `📁 **Output directory**: ${args.output_dir}\n`;
        response += `💡 **Tip**: Downloaded images are ready for use with edit or describe tools.`;

        return response;
      } catch (error) {
        return `❌ Unexpected error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
      }
    }
  };
}

export { downloadSchema };