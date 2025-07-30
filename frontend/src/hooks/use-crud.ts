import { useState } from "react";

interface UseCrudProps<T> {
  initialData?: T[];
}

export const useCrud = <T extends Record<string, unknown>>({ initialData = [] }: UseCrudProps<T>) => {
  const [data, setData] = useState<T[]>(initialData);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);

  const addItem = (newItem: T) => {
    const itemWithId = { ...newItem, id: Date.now().toString() };
    setData([...data, itemWithId]);
    setIsFormOpen(false);
  };

  const updateItem = (updatedItem: T) => {
    setData(data.map(item => 
      item.id === editingItem?.id ? { ...updatedItem, id: item.id } : item
    ));
    setEditingItem(null);
    setIsFormOpen(false);
  };

  const deleteItem = (itemToDelete: T) => {
    setData(data.filter(item => item.id !== itemToDelete.id));
  };

  const openAddForm = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const openEditForm = (item: T) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = (formData: T) => {
    if (editingItem) {
      updateItem(formData);
    } else {
      addItem(formData);
    }
  };

  return {
    data,
    isFormOpen,
    editingItem,
    addItem,
    updateItem,
    deleteItem,
    openAddForm,
    openEditForm,
    closeForm,
    handleSubmit,
  };
}; 