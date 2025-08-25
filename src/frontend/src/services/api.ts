import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiConfig, ApiResponseType, ApiRequestConfig } from '@types/api';

class ApiService {
  private instance: AxiosInstance;
  private baseURL: string;

  constructor(config: Partial<ApiConfig> = {}) {
    this.baseURL = config.baseURL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    
    this.instance = axios.create({
      baseURL: this.baseURL,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = this.getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request in development
        if (import.meta.env.DEV) {
          console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            data: config.data,
          });
        }

        return config;
      },
      (error) => {
        console.error('[API] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log response in development
        if (import.meta.env.DEV) {
          console.log(`[API] Response ${response.status}:`, response.data);
        }

        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors (token expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await this.refreshToken();
            const token = this.getStoredToken();
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.instance(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        // Log error in development
        if (import.meta.env.DEV) {
          console.error('[API] Response error:', {
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
            url: error.config?.url,
          });
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || `HTTP ${error.response.status}`;
      const apiError = new Error(message);
      (apiError as any).status = error.response.status;
      (apiError as any).data = error.response.data;
      return apiError;
    } else if (error.request) {
      // Network error
      return new Error('네트워크 연결을 확인해주세요.');
    } else {
      // Other error
      return new Error(error.message || '알 수 없는 오류가 발생했습니다.');
    }
  }

  private getStoredToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private getStoredRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  private clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  private async refreshToken(): Promise<void> {
    const refreshToken = this.getStoredRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${this.baseURL}/auth/refresh`, {
      refresh_token: refreshToken,
    });

    if (response.data.success) {
      const { access_token, refresh_token } = response.data.data.tokens;
      this.setTokens(access_token, refresh_token);
    } else {
      throw new Error('Token refresh failed');
    }
  }

  // Generic HTTP methods
  public async get<T = any>(
    url: string,
    config?: ApiRequestConfig
  ): Promise<ApiResponseType<T>> {
    const response = await this.instance.get(url, config as AxiosRequestConfig);
    return response.data;
  }

  public async post<T = any>(
    url: string,
    data?: any,
    config?: ApiRequestConfig
  ): Promise<ApiResponseType<T>> {
    const response = await this.instance.post(url, data, config as AxiosRequestConfig);
    return response.data;
  }

  public async put<T = any>(
    url: string,
    data?: any,
    config?: ApiRequestConfig
  ): Promise<ApiResponseType<T>> {
    const response = await this.instance.put(url, data, config as AxiosRequestConfig);
    return response.data;
  }

  public async patch<T = any>(
    url: string,
    data?: any,
    config?: ApiRequestConfig
  ): Promise<ApiResponseType<T>> {
    const response = await this.instance.patch(url, data, config as AxiosRequestConfig);
    return response.data;
  }

  public async delete<T = any>(
    url: string,
    config?: ApiRequestConfig
  ): Promise<ApiResponseType<T>> {
    const response = await this.instance.delete(url, config as AxiosRequestConfig);
    return response.data;
  }

  // File upload
  public async uploadFile(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponseType<any>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.instance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  // Token management
  public setAuthToken(token: string, refreshToken?: string): void {
    if (refreshToken) {
      this.setTokens(token, refreshToken);
    } else {
      localStorage.setItem('access_token', token);
    }
  }

  public clearAuth(): void {
    this.clearTokens();
  }

  public isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }

  // Health check
  public async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health');
      return true;
    } catch {
      return false;
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
export { ApiService };
