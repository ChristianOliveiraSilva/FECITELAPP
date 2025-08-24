import { apiService } from "@/lib/api";
import { log } from "console";

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

      if (response.success && response.token && response.user) {
        this.token = response.token;
        this.user = response.user;
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user_info', JSON.stringify(response.user));
        return response;
      } else {
        throw new Error(response.message || 'Falha no login');
      }
    } catch (error) {
      throw new Error(error.body?.detail || 'Erro de conexão');
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
      const response = await apiService.get<UserInfo>('/auth/me', {});
      
      if (response) {
        this.user = response;
        return response;
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
      return response;
    } catch (error) {
      throw new Error('Erro ao solicitar recuperação de senha');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<ResetPasswordResponse> {
    try {
      const response = await apiService.create<ResetPasswordResponse>('/auth/reset-password', { token, new_password: newPassword });
      return response;
    } catch (error) {
      throw new Error('Erro ao redefinir senha');
    }
  }
}

export const authService = new AuthService();
export type { LoginRequest, UserInfo, LoginResponse, ForgotPasswordResponse, ResetPasswordResponse }; 