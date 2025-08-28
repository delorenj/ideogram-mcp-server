/**
 * File Manager Utility
 * Enhanced file operations with validation and parallel processing
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { IdeogramApiClient } from './api-client.js';
import { DownloadResult } from '../types/index.js';

export class FileManager {
  private apiClient: IdeogramApiClient;
  private allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  private maxFileSize = 10 * 1024 * 1024; // 10MB

  constructor(apiClient: IdeogramApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Download multiple images in parallel with comprehensive validation
   */
  async downloadImages(urls: string[], outputDir: string): Promise<DownloadResult> {
    // Create output directory if it doesn't exist
    try {
      await fs.mkdir(outputDir, { recursive: true });
    } catch (error) {
      return {
        success: false,
        error: `Failed to create output directory: ${error instanceof Error ? error.message : 'Unknown error'}`,
        results: []
      };
    }

    // Download all images in parallel
    const downloadPromises = urls.map(async (url, index) => {
      try {
        const filename = this.generateFilename(url, index);
        const filepath = path.join(outputDir, filename);
        
        const response = await this.apiClient.downloadImage(url);
        
        if (!response.success || !response.data) {
          return {
            url,
            success: false,
            error: response.error || 'Download failed',
            filepath: null
          };
        }

        // Validate file size
        if (response.data.length > this.maxFileSize) {
          return {
            url,
            success: false,
            error: `File too large: ${response.data.length} bytes (max: ${this.maxFileSize})`,
            filepath: null
          };
        }

        // Write file
        await fs.writeFile(filepath, response.data);
        
        // Validate file was written correctly
        const stats = await fs.stat(filepath);
        if (stats.size !== response.data.length) {
          return {
            url,
            success: false,
            error: 'File write validation failed',
            filepath: null
          };
        }

        return {
          url,
          success: true,
          filepath,
          size: stats.size
        };
      } catch (error) {
        return {
          url,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          filepath: null
        };
      }
    });

    try {
      const results = await Promise.all(downloadPromises);
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      return {
        success: successful.length > 0,
        results,
        summary: {
          total: results.length,
          successful: successful.length,
          failed: failed.length
        },
        error: failed.length === results.length ? 'All downloads failed' : undefined
      };
    } catch (error) {
      return {
        success: false,
        error: `Batch download failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        results: []
      };
    }
  }

  /**
   * Read and validate image file
   */
  async readImageFile(filePath: string): Promise<{ success: boolean; data?: Buffer; error?: string }> {
    try {
      // Validate file extension
      const ext = path.extname(filePath).toLowerCase();
      if (!this.allowedExtensions.includes(ext)) {
        return {
          success: false,
          error: `Unsupported file type: ${ext}. Allowed: ${this.allowedExtensions.join(', ')}`
        };
      }

      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        return {
          success: false,
          error: `File not found: ${filePath}`
        };
      }

      // Read and validate file
      const data = await fs.readFile(filePath);
      
      if (data.length === 0) {
        return {
          success: false,
          error: 'File is empty'
        };
      }

      if (data.length > this.maxFileSize) {
        return {
          success: false,
          error: `File too large: ${data.length} bytes (max: ${this.maxFileSize})`
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate unique filename from URL
   */
  private generateFilename(url: string, index: number): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const ext = path.extname(pathname) || '.jpg';
      const timestamp = Date.now();
      return `image_${index}_${timestamp}${ext}`;
    } catch {
      return `image_${index}_${Date.now()}.jpg`;
    }
  }

  /**
   * Clean up old files in directory
   */
  async cleanupOldFiles(directory: string, maxAgeMs: number = 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const files = await fs.readdir(directory);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(directory, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAgeMs) {
          await fs.unlink(filePath);
        }
      }
    } catch {
      // Ignore cleanup errors
    }
  }
}