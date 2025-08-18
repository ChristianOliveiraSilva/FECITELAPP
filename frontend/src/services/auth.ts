import { apiService } from "@/lib/api";

interface LoginRequest {
  email: string;
  password: string;
}

interface UserInfo {
  id: number;
  name: string;
  email: string;
  is_evaluator: boolean;
}

interface LoginResponse {
  success: boolean;
  message: string;
  user?: UserInfo;
  token?: string;
}

interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

class AuthService {
  private token: string | null = localStorage.getItem('auth_token');
  private user: UserInfo | null = null;

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await apiService.create<LoginResponse>('/auth/login', { email, password });

      if (response.data.success && response.data.token && response.data.user) {
        this.token = response.data.token;
        this.user = response.data.user;
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user_info', JSON.stringify(response.data.user));
        return response.data;
      } else {
        throw new Error(response.data.message || 'Falha no login');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Erro de conexão');
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.token) {
        await apiService.create('/auth/logout', {});
      }
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      this.token = null;
      this.user = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
    }
  }

  async getCurrentUser(): Promise<UserInfo | null> {
    if (!this.token) {
      return null;
    }

    try {
      const response = await apiService.create<UserInfo>('/auth/me', {});
      
      if (response.data) {
        this.user = response.data;
        return response.data;
      } else {
        this.logout();
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      this.logout();
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.token !== null;
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): UserInfo | null {
    if (!this.user) {
      const userStr = localStorage.getItem('user_info');
      if (userStr) {
        this.user = JSON.parse(userStr);
      }
    }
    return this.user;
  }

  initialize() {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('user_info');
    
    if (token) {
      this.token = token;
    }
    
    if (userStr) {
      this.user = JSON.parse(userStr);
    }
  }

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    try {
      const response = await apiService.create<ForgotPasswordResponse>('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw new Error('Erro ao solicitar recuperação de senha');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<ResetPasswordResponse> {
    try {
      const response = await apiService.create<ResetPasswordResponse>('/auth/reset-password', { token, new_password: newPassword });
      return response.data;
    } catch (error) {
      throw new Error('Erro ao redefinir senha');
    }
  }
}

export const authService = new AuthService();
export type { LoginRequest, UserInfo, LoginResponse, ForgotPasswordResponse, ResetPasswordResponse }; 