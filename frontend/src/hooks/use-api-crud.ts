import { useState, useEffect } from "react";
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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get<T>(endpoint, {
        limit: 1000,
        include_relations: true
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
  };

  useEffect(() => {
    loadData();
  }, [endpoint]);

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
        setIsFormOpen(false);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar item');
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (updatedItem: T) => {
    if (!editingItem?.id) return;
    
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
        
        response = await apiService.updateWithFormData<T>(customUpdateEndpoint, editingItem.id, formData);
      } else {
        response = await apiService.update<T>(endpoint, editingItem.id, updatedItem);
      }
      
      if (response.status) {
        await loadData();
        setEditingItem(null);
        setIsFormOpen(false);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar item');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (itemToDelete: T) => {
    if (!itemToDelete.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.delete(endpoint, itemToDelete.id);
      
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

  const openAddForm = () => {
    setEditingItem(null);
    setIsFormOpen(true);
    setError(null);
  };

  const openEditForm = (item: T) => {
    const originalItem = originalData.find((orig: T) => orig.id === item.id);
    setEditingItem(originalItem || item);
    setIsFormOpen(true);
    setError(null);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    setError(null);
  };

  const handleSubmit = async (formData: T) => {
    if (editingItem) {
      await updateItem(formData);
    } else {
      await addItem(formData);
    }
  };

  return {
    data,
    loading,
    error,
    isFormOpen,
    editingItem,
    addItem,
    updateItem,
    deleteItem,
    openAddForm,
    openEditForm,
    closeForm,
    handleSubmit,
    refreshData: loadData,
  };
}; 