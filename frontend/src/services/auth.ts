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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class AuthService {
  private token: string | null = localStorage.getItem('auth_token');
  private user: UserInfo | null = null;

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v3/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await response.json();

      if (data.success && data.token && data.user) {
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_info', JSON.stringify(data.user));
        return data;
      } else {
        throw new Error(data.message || 'Falha no login');
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
        await fetch(`${API_BASE_URL}/api/v3/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        });
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
      const response = await fetch(`${API_BASE_URL}/api/v3/auth/me`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (response.ok) {
        const user = await response.json();
        this.user = user;
        return user;
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
      const response = await fetch(`${API_BASE_URL}/api/v3/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data: ForgotPasswordResponse = await response.json();
      return data;
    } catch (error) {
      throw new Error('Erro ao solicitar recuperação de senha');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<ResetPasswordResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v3/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      const data: ResetPasswordResponse = await response.json();
      return data;
    } catch (error) {
      throw new Error('Erro ao redefinir senha');
    }
  }
}

export const authService = new AuthService();
export type { LoginRequest, UserInfo, LoginResponse, ForgotPasswordResponse, ResetPasswordResponse }; 