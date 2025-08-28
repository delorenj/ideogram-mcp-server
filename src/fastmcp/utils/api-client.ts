/**
 * Ideogram API Client
 * Enhanced HTTP client for Ideogram API with comprehensive error handling
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { IdeogramConfig, ApiResponse, IdeogramApiError } from '../types/index.js';

export class IdeogramApiClient {
  private axiosInstance: AxiosInstance;
  private config: IdeogramConfig;

  constructor(config: IdeogramConfig) {
    this.config = { ...config };
    
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,
      timeout: 60000, // 60 seconds
      headers: {
        'Api-Key': config.apiKey,
        'Content-Type': 'application/json'
      }
    });

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.data) {
          const apiError = error.response.data as IdeogramApiError;
          throw new Error(`API Error: ${apiError.message || 'Unknown error'}`);
        }
        throw new Error(`Request failed: ${error.message}`);
      }
    );
  }

  async post<T = any>(endpoint: string, data: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.post<T>(endpoint, data, headers ? {
        headers: { ...headers }
      } : undefined);

      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 500
      };
    }
  }

  async downloadImage(url: string): Promise<ApiResponse<Buffer>> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000
      });

      return {
        success: true,
        data: Buffer.from(response.data),
        status: response.status
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Download failed',
        status: 500
      };
    }
  }

  getConfig(): IdeogramConfig {
    return { ...this.config };
  }
}