import apiService from './api';
import { 
  LoginRequest, 
  RegisterRequest, 
  RefreshTokenRequest,
  ChangePasswordRequest,
  AuthResponse,
  User,
  UserPreferences 
} from '@types/index';

class AuthService {
  /**
   * 로그인
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/login', credentials);
    
    if (response.success && response.data) {
      const { user, tokens } = response.data;
      apiService.setAuthToken(tokens.access_token, tokens.refresh_token);
      return response.data;
    }
    
    throw new Error(response.message || '로그인에 실패했습니다.');
  }

  /**
   * 회원가입
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/register', userData);
    
    if (response.success && response.data) {
      const { user, tokens } = response.data;
      apiService.setAuthToken(tokens.access_token, tokens.refresh_token);
      return response.data;
    }
    
    throw new Error(response.message || '회원가입에 실패했습니다.');
  }

  /**
   * 로그아웃
   */
  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      apiService.clearAuth();
    }
  }

  /**
   * 토큰 갱신
   */
  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }

    const response = await apiService.post<AuthResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    
    if (response.success && response.data) {
      const { tokens } = response.data;
      apiService.setAuthToken(tokens.access_token, tokens.refresh_token);
      return response.data;
    }
    
    throw new Error('토큰 갱신에 실패했습니다.');
  }

  /**
   * 현재 사용자 정보 조회
   */
  async getCurrentUser(): Promise<{ user: User; preferences: UserPreferences }> {
    const response = await apiService.get<{ user: User; preferences: UserPreferences }>('/auth/me');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error('사용자 정보를 불러올 수 없습니다.');
  }

  /**
   * 이메일 인증
   */
  async verifyEmail(token: string): Promise<void> {
    const response = await apiService.post('/auth/verify-email', { token });
    
    if (!response.success) {
      throw new Error(response.message || '이메일 인증에 실패했습니다.');
    }
  }

  /**
   * 비밀번호 재설정 요청
   */
  async forgotPassword(email: string): Promise<void> {
    const response = await apiService.post('/auth/forgot-password', { email });
    
    if (!response.success) {
      throw new Error(response.message || '비밀번호 재설정 요청에 실패했습니다.');
    }
  }

  /**
   * 비밀번호 재설정
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await apiService.post('/auth/reset-password', {
      token,
      new_password: newPassword,
    });
    
    if (!response.success) {
      throw new Error(response.message || '비밀번호 재설정에 실패했습니다.');
    }
  }

  /**
   * 비밀번호 변경
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    const response = await apiService.put('/users/password', data);
    
    if (!response.success) {
      throw new Error(response.message || '비밀번호 변경에 실패했습니다.');
    }
  }

  /**
   * 인증 상태 확인
   */
  isAuthenticated(): boolean {
    return apiService.isAuthenticated();
  }

  /**
   * 액세스 토큰 조회
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * 리프레시 토큰 조회
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /**
   * 모든 토큰 삭제
   */
  clearTokens(): void {
    apiService.clearAuth();
  }

  /**
   * 토큰 만료 확인
   */
  isTokenExpired(token?: string): boolean {
    const accessToken = token || this.getAccessToken();
    
    if (!accessToken) {
      return true;
    }

    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  /**
   * 사용자 ID 추출
   */
  getUserIdFromToken(token?: string): string | null {
    const accessToken = token || this.getAccessToken();
    
    if (!accessToken) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      return payload.userId || payload.sub || null;
    } catch {
      return null;
    }
  }

  /**
   * 토큰에서 만료 시간 추출
   */
  getTokenExpiration(token?: string): Date | null {
    const accessToken = token || this.getAccessToken();
    
    if (!accessToken) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      return new Date(payload.exp * 1000);
    } catch {
      return null;
    }
  }

  /**
   * 자동 토큰 갱신 설정
   */
  setupAutoRefresh(): void {
    const checkTokenExpiration = () => {
      if (this.isAuthenticated() && this.isTokenExpired()) {
        this.refreshToken().catch((error) => {
          console.error('Auto token refresh failed:', error);
          this.logout();
          window.location.href = '/login';
        });
      }
    };

    // 5분마다 토큰 만료 확인
    setInterval(checkTokenExpiration, 5 * 60 * 1000);

    // 페이지 포커스 시에도 확인
    window.addEventListener('focus', checkTokenExpiration);
  }

  /**
   * 권한 확인
   */
  hasPermission(permission: string): boolean {
    const token = this.getAccessToken();
    
    if (!token) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const permissions = payload.permissions || [];
      return permissions.includes(permission);
    } catch {
      return false;
    }
  }

  /**
   * 역할 확인
   */
  hasRole(role: string): boolean {
    const token = this.getAccessToken();
    
    if (!token) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const roles = payload.roles || [];
      return roles.includes(role);
    } catch {
      return false;
    }
  }
}

// 싱글톤 인스턴스 생성
const authService = new AuthService();

export default authService;
export { AuthService };
