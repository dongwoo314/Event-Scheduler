import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import toast from 'react-hot-toast';

// API 응답 타입 정의
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp?: string;
}

// 에러 응답 타입
interface ApiError {
  success: false;
  message: string;
  error?: string;
  details?: any;
}

class ApiService {
  private api: AxiosInstance;
  private refreshing = false;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * 인터셉터 설정
   */
  private setupInterceptors(): void {
    // Request 인터셉터
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // 개발 환경에서 요청 로깅
        if (import.meta.env.DEV) {
          console.log('🚀 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            data: config.data,
          });
        }
        
        return config;
      },
      (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response 인터셉터
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        // 개발 환경에서 응답 로깅
        if (import.meta.env.DEV) {
          console.log('✅ API Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data,
          });
        }
        
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // 401 Unauthorized - 토큰 갱신 시도
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.refreshing) {
            return Promise.reject(error);
          }

          originalRequest._retry = true;

          try {
            await this.refreshToken();
            const token = localStorage.getItem('access_token');
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return this.api(originalRequest);
          } catch (refreshError) {
            this.handleAuthError();
            return Promise.reject(refreshError);
          }
        }

        // 403 Forbidden
        if (error.response?.status === 403) {
          toast.error('접근 권한이 없습니다.');
        }

        // 404 Not Found - 조용히 처리 (토스트 제거)
        // if (error.response?.status === 404) {
        //   toast.error('요청한 리소스를 찾을 수 없습니다.');
        // }

        // 500 Internal Server Error
        if (error.response?.status === 500) {
          toast.error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }

        // Network Error
        if (!error.response) {
          toast.error('네트워크 연결을 확인해주세요.');
        }

        // 개발 환경에서만 에러 로깅
        if (import.meta.env.DEV && error.response?.status !== 404) {
          console.error('❌ API Error:', {
            status: error.response?.status,
            message: error.message,
            url: error.config?.url,
            data: error.response?.data,
          });
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * 토큰 갱신
   */
  private async refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    this.refreshing = true;

    try {
      const response = await axios.post(`${this.api.defaults.baseURL}/auth/refresh`, {
        refresh_token: refreshToken,
      });

      if (response.data.success) {
        const { access_token, refresh_token: newRefreshToken } = response.data.data.tokens;
        this.setAuthToken(access_token, newRefreshToken);
      } else {
        throw new Error('Token refresh failed');
      }
    } finally {
      this.refreshing = false;
    }
  }

  /**
   * 인증 오류 처리
   */
  private handleAuthError(): void {
    this.clearAuth();
    toast.error('로그인이 만료되었습니다. 다시 로그인해주세요.');
    
    // 로그인 페이지로 리다이렉트 (현재 위치 저장)
    const currentPath = window.location.pathname;
    if (currentPath !== '/login') {
      sessionStorage.setItem('redirectAfterLogin', currentPath);
      window.location.href = '/login';
    }
  }

  /**
   * 인증 토큰 설정
   */
  setAuthToken(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  /**
   * 인증 정보 삭제
   */
  clearAuth(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  /**
   * 인증 상태 확인
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  /**
   * GET 요청
   */
  async get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response = await this.api.get(url, { params });
    return response.data;
  }

  /**
   * POST 요청
   */
  async post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.api.post(url, data);
    return response.data;
  }

  /**
   * PUT 요청
   */
  async put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.api.put(url, data);
    return response.data;
  }

  /**
   * PATCH 요청
   */
  async patch<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.api.patch(url, data);
    return response.data;
  }

  /**
   * DELETE 요청
   */
  async delete<T = any>(url: string): Promise<ApiResponse<T>> {
    const response = await this.api.delete(url);
    return response.data;
  }

  /**
   * 파일 업로드
   */
  async upload<T = any>(
    url: string,
    formData: FormData,
    onProgress?: (progressEvent: any) => void
  ): Promise<ApiResponse<T>> {
    const response = await this.api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    });
    return response.data;
  }

  /**
   * 파일 다운로드
   */
  async download(url: string, filename?: string): Promise<void> {
    const response = await this.api.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  /**
   * Axios 인스턴스 반환 (고급 사용자용)
   */
  getInstance(): AxiosInstance {
    return this.api;
  }

  /**
   * Base URL 설정
   */
  setBaseURL(baseURL: string): void {
    this.api.defaults.baseURL = baseURL;
  }

  /**
   * 타임아웃 설정
   */
  setTimeout(timeout: number): void {
    this.api.defaults.timeout = timeout;
  }

  /**
   * 기본 헤더 설정
   */
  setDefaultHeader(key: string, value: string): void {
    this.api.defaults.headers.common[key] = value;
  }

  /**
   * 기본 헤더 삭제
   */
  removeDefaultHeader(key: string): void {
    delete this.api.defaults.headers.common[key];
  }
}

// 싱글톤 인스턴스 생성
const apiService = new ApiService();

// Named export와 default export 모두 지원
export { apiService };
export default apiService;
export type { ApiResponse, ApiError };
