import { useState, useEffect, useCallback } from "react";
import { apiService, ApiResponse } from "@/lib/api";

interface UseApiCrudWithFiltersProps<T> {
  endpoint: string;
  initialData?: T[];
  customCreateEndpoint?: string;
  customUpdateEndpoint?: string;
  useFormData?: boolean;
}

interface FilterParams {
  skip?: number;
  limit?: number;
  [key: string]: any;
}

export const useApiCrudWithFilters = <T extends Record<string, unknown>>({ 
  endpoint, 
  initialData = [],
  customCreateEndpoint,
  customUpdateEndpoint,
  useFormData = false
}: UseApiCrudWithFiltersProps<T>) => {
  const [data, setData] = useState<T[]>(initialData);
  const [originalData, setOriginalData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const loadData = useCallback(async (params?: FilterParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = {
        skip: ((currentPage - 1) * pageSize),
        limit: pageSize,
        ...filters,
        ...params
      };

      // Remove filtros vazios
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === '' || queryParams[key] === null || queryParams[key] === undefined) {
          delete queryParams[key];
        }
      });

      const response = await apiService.get<T>(endpoint, queryParams);
      
      if (response.status) {
        setData(response.data);
        // Se for a primeira carga, também salva como dados originais
        if (currentPage === 1 && Object.keys(filters).length === 0) {
          setOriginalData(response.data);
        }
        // Para APIs que retornam total, você pode extrair de response.meta ou similar
        // Por enquanto, vamos usar o tamanho dos dados retornados
        setTotalItems(response.data.length);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [endpoint, currentPage, pageSize, filters]);

  // Effect para recarregar dados quando filtros, página ou tamanho da página mudarem
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFiltersChange = useCallback((
    newFilters: Record<string, string>, 
    newSortColumn: string | null, 
    newSortDirection: 'asc' | 'desc', 
    newPage: number, 
    newPageSize: number
  ) => {
    setFilters(newFilters);
    setSortColumn(newSortColumn);
    setSortDirection(newSortDirection);
    setCurrentPage(newPage);
    setPageSize(newPageSize);
  }, []);

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
    totalItems,
    currentPage,
    pageSize,
    filters,
    sortColumn,
    sortDirection,
    addItem,
    updateItem,
    deleteItem,
    getOriginalItem,
    refreshData: loadData,
    handleFiltersChange,
  };
};
