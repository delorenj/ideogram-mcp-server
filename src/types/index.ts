/**
 * Ideogram MCP Server Types
 * Type definitions for the Ideogram MCP Server
 */

export interface IdeogramConfig {
  apiKey: string;
  baseUrl: string;
  defaultModel: 'V_1' | 'V_2' | 'V_2_TURBO';
  maxImages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

export interface IdeogramApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface ImageData {
  url: string;
  is_image_safe?: boolean;
}

export interface ImageGenerationResponse {
  created: string;
  data: ImageData[];
}

export interface ImageEditResponse {
  created: string;
  data: ImageData[];
}

export interface ImageDescription {
  text: string;
}

export interface ImageDescriptionResponse {
  created: string;
  descriptions: ImageDescription[];
}

export interface ImageUpscaleResponse {
  created: string;
  data: ImageData[];
}

export interface DownloadResult {
  success: boolean;
  results: Array<{
    url: string;
    success: boolean;
    filepath?: string | null;
    size?: number;
    error?: string;
  }>;
  error?: string;
  summary?: {
    total: number;
    successful: number;
    failed: number;
  };
}