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
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

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

  // Generic CRUD methods
  async getList<T>(
    endpoint: string,
    params: PaginationParams = {}
  ): Promise<ApiResponse<T[]>> {
    const searchParams = new URLSearchParams();
    
    if (params.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());
    if (params.include_relations !== undefined) searchParams.append('include_relations', params.include_relations.toString());

    const queryString = searchParams.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return this.request<T[]>(url);
  }

  async getById<T>(endpoint: string, id: string | number): Promise<ApiResponse<T>> {
    return this.request<T>(`${endpoint}/${id}`);
  }

  async create<T>(endpoint: string, data: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createWithFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header, let browser set it with boundary for multipart/form-data
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async update<T>(endpoint: string, id: string | number, data: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.request<T>(`${endpoint}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateWithFormData<T>(endpoint: string, id: string | number, formData: FormData): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}/${id}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      body: formData,
      // Don't set Content-Type header, let browser set it with boundary for multipart/form-data
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
}

export const apiService = new ApiService(); 