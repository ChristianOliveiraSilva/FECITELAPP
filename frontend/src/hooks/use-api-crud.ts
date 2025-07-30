import { useState, useEffect } from "react";
import { apiService, ApiResponse } from "@/lib/api";

interface UseApiCrudProps<T> {
  endpoint: string;
  initialData?: T[];
}

export const useApiCrud = <T extends Record<string, unknown>>({ 
  endpoint, 
  initialData = [] 
}: UseApiCrudProps<T>) => {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);

  // Load data from API
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getList<T>(endpoint, {
        limit: 1000,
        include_relations: true
      });
      
      if (response.status) {
        setData(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [endpoint]);

  const addItem = async (newItem: T) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.create<T>(endpoint, newItem);
      
      if (response.status) {
        await loadData(); // Reload data to get the new item
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
      const response = await apiService.update<T>(endpoint, editingItem.id, updatedItem);
      
      if (response.status) {
        await loadData(); // Reload data to get the updated item
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
        await loadData(); // Reload data to reflect the deletion
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
    setEditingItem(item);
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