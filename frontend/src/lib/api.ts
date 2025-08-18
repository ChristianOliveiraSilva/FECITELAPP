const API_BASE_URL = import.meta.env.VITE_API_URL + '/api/v3';

export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

export interface PaginationParams {
  skip?: number;
  limit?: number;
  include_relations?: boolean;
}

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private getYear(): string | null {
    return localStorage.getItem('year');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.getAuthToken();
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async get<T>(
    endpoint: string,
    params: PaginationParams = {}
  ): Promise<ApiResponse<T[]>> {
    const searchParams = new URLSearchParams();
    
    if (params.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());
    if (params.include_relations !== undefined) searchParams.append('include_relations', params.include_relations.toString());

    const year = this.getYear();
    if (year) {
      searchParams.append('year', year);
    }

    const queryString = searchParams.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return this.request<T[]>(url);
  }

  async create<T>(endpoint: string, data: Record<string, unknown>): Promise<ApiResponse<T>> {
    const year = this.getYear();
    if (year) {
      data.year = year;
    }

    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createWithFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {};
    
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const year = this.getYear();
    if (year) {
      formData.append('year', year);
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async update<T>(endpoint: string, id: string | number, data: Record<string, unknown>): Promise<ApiResponse<T>> {
    const year = this.getYear();
    if (year) {
      data.year = year;
    }

    return this.request<T>(`${endpoint}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateWithFormData<T>(endpoint: string, id: string | number, formData: FormData): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}/${id}`;
    
    const headers: Record<string, string> = {};
    
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const year = this.getYear();
    if (year) {
      formData.append('year', year);
    }
    
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async delete(endpoint: string, id: string | number): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request(`${endpoint}/${id}`, {
      method: 'DELETE',
    });
  }

  async downloadFile(endpoint: string): Promise<Blob> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {};
    
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  }
}

export const apiService = new ApiService(); 