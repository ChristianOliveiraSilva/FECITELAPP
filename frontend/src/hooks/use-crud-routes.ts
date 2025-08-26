import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApiCrud } from "./use-api-crud";

interface UseCrudRoutesProps<T> {
  endpoint: string;
  baseRoute: string;
  title: string;
  description?: string;
}

export const useCrudRoutes = <T extends Record<string, unknown>>({
  endpoint,
  baseRoute,
  title,
  description
}: UseCrudRoutesProps<T>) => {
  const navigate = useNavigate();
  const params = useParams();
  const [currentItem, setCurrentItem] = useState<T | null>(null);
  const [loadingItem, setLoadingItem] = useState(false);
  const [itemError, setItemError] = useState<string | null>(null);

  const {
    data,
    loading,
    error,
    isFormOpen,
    editingItem,
    openAddForm,
    openEditForm,
    closeForm,
    handleSubmit,
    deleteItem,
    createItem,
    updateItem
  } = useApiCrud<T>({ endpoint });

  // Fetch single item when viewing details
  useEffect(() => {
    if (params.id && params.id !== 'create' && params.id !== 'edit') {
      fetchItem(parseInt(params.id));
    }
  }, [params.id, endpoint]);

  const fetchItem = async (id: number) => {
    setLoadingItem(true);
    setItemError(null);
    try {
      const response = await fetch(`${endpoint}/${id}`);
      if (!response.ok) {
        throw new Error('Item não encontrado');
      }
      const result = await response.json();
      setCurrentItem(result.data);
    } catch (err) {
      setItemError(err instanceof Error ? err.message : 'Erro ao carregar item');
    } finally {
      setLoadingItem(false);
    }
  };

  // Navigation handlers
  const goToList = () => navigate(baseRoute);
  const goToCreate = () => navigate(`${baseRoute}/create`);
  const goToDetail = (id: number) => navigate(`${baseRoute}/${id}`);
  const goToEdit = (id: number) => navigate(`${baseRoute}/${id}/edit`);

  // CRUD operations with navigation
  const handleCreate = async (data: T) => {
    try {
      const result = await createItem(data);
      if (result) {
        goToDetail(result.id as number);
      }
    } catch (err) {
      console.error('Erro ao criar item:', err);
    }
  };

  const handleUpdate = async (data: T) => {
    try {
      const result = await updateItem(data);
      if (result) {
        goToDetail(result.id as number);
      }
    } catch (err) {
      console.error('Erro ao atualizar item:', err);
    }
  };

  const handleDelete = async (item: T) => {
    try {
      await deleteItem(item);
      goToList();
    } catch (err) {
      console.error('Erro ao excluir item:', err);
    }
  };

  const handleEditFromDetail = () => {
    if (currentItem?.id) {
      goToEdit(currentItem.id as number);
    }
  };

  const handleDeleteFromDetail = () => {
    if (currentItem) {
      handleDelete(currentItem);
    }
  };

  return {
    // Data
    data,
    currentItem,
    editingItem,
    
    // Loading states
    loading,
    loadingItem,
    
    // Errors
    error,
    itemError,
    
    // Form state
    isFormOpen,
    
    // CRUD operations
    createItem: handleCreate,
    updateItem: handleUpdate,
    deleteItem: handleDelete,
    
    // Navigation
    goToList,
    goToCreate,
    goToDetail,
    goToEdit,
    
    // Form handlers
    openAddForm,
    openEditForm,
    closeForm,
    handleSubmit,
    
    // Detail handlers
    handleEditFromDetail,
    handleDeleteFromDetail,
    
    // Metadata
    title,
    description,
    baseRoute
  };
};
