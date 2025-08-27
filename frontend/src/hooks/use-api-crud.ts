import { useState, useEffect, useCallback } from "react";
import { apiService, ApiResponse } from "@/lib/api";

interface UseApiCrudProps<T> {
  endpoint: string;
  initialData?: T[];
  customCreateEndpoint?: string;
  customUpdateEndpoint?: string;
  useFormData?: boolean;
}

export const useApiCrud = <T extends Record<string, unknown>>({ 
  endpoint, 
  initialData = [],
  customCreateEndpoint,
  customUpdateEndpoint,
  useFormData = false
}: UseApiCrudProps<T>) => {
  const [data, setData] = useState<T[]>(initialData);
  const [originalData, setOriginalData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get<T>(endpoint, {
        limit: 1000,
      });
      
      if (response.status) {
        setData(response.data);
        setOriginalData(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    loadData();
  }, [endpoint, loadData]);

  const addItem = async (newItem: T) => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (useFormData && customCreateEndpoint) {
        const formData = new FormData();
        Object.entries(newItem).forEach(([key, value]) => {
          if (value instanceof File) {
            formData.append(key, value);
          } else if (value !== null && value !== undefined) {
            formData.append(key, String(value));
          }
        });
        
        response = await apiService.createWithFormData<T>(customCreateEndpoint, formData);
      } else {
        response = await apiService.create<T>(endpoint, newItem);
      }
      
      if (response.status) {
        await loadData();
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar item');
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (id: string | number, updatedItem: T) => {
    
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      const hasFile = Object.values(updatedItem).some(value => value instanceof File);
      
      if (useFormData && hasFile && customUpdateEndpoint) {
        const formData = new FormData();
        Object.entries(updatedItem).forEach(([key, value]) => {
          if (value instanceof File) {
            formData.append(key, value);
          } else if (value !== null && value !== undefined) {
            formData.append(key, String(value));
          }
        });
        
        response = await apiService.updateWithFormData<T>(customUpdateEndpoint, id, formData);
      } else {
        response = await apiService.update<T>(endpoint, id, updatedItem);
      }
      
      if (response.status) {
        await loadData();
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar item');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string | number) => {
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.delete(endpoint, id);
      
      if (response.status) {
        await loadData();
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar item');
    } finally {
      setLoading(false);
    }
  };

  const getOriginalItem = (id: string | number): T | undefined => {
    return originalData.find((item: T) => item.id === id);
  };

  return {
    data,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    getOriginalItem,
    refreshData: loadData,
  };
}; 