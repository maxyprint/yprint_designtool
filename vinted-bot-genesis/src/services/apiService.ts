/**
 * API Service - Genesis v2.0 Backend Communication
 */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  metadata?: any;
}

class ApiService {
  private baseUrl = 'http://localhost:3001/api';

  /**
   * Get trending products from Vinted
   */
  async getTrendingProducts(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/vinted/trending`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch trending products');
      }

      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      return {
        success: false,
        data: [],
        error: error.message
      };
    }
  }

  /**
   * Get individual product details
   */
  async getProductDetails(productId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/vinted/product/${productId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch product details');
      }

      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  }

  /**
   * Get system health status
   */
  async getHealthStatus(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      const data = await response.json();

      return {
        success: true,
        data
      };
    } catch (error: any) {
      console.error('Health Check Error:', error);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  }
}

export const apiService = new ApiService();