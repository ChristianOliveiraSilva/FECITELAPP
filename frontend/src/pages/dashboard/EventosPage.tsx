import { useParams, useLocation } from "react-router-dom";
import { DataTable } from "@/components/ui/data-table";
import { CrudForm } from "@/components/ui/crud-form";
import { useApiCrud } from "@/hooks/use-api-crud";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { ReactNode, useState, useEffect } from "react";
import { ItemDetail } from "@/components/ui/item-detail";
import { CrudFormPage } from "@/components/ui/crud-form-page";
import { CrudListPage } from "@/components/ui/crud-list-page";

interface Evento extends Record<string, unknown> {
  id?: number;
  year: number;
  app_primary_color: string;
  app_font_color: string;
  app_logo_url?: string;
  created_at?: string;
  updated_at?: string;
}

const columns = [
  { 
    key: "year", 
    label: "Ano", 
    sortable: true, 
    filterable: true, 
    filterType: 'number' as const 
  },
  { 
    key: "app_primary_color", 
    label: "Cor Primária", 
    sortable: false, 
    filterable: false 
  },
  { 
    key: "app_font_color", 
    label: "Cor da Fonte", 
    sortable: false, 
    filterable: false 
  },
  { 
    key: "app_logo_url", 
    label: "Logo", 
    sortable: false, 
    filterable: false 
  },
  { 
    key: "created_at", 
    label: "Criado em", 
    sortable: true, 
    filterable: true, 
    filterType: 'date' as const 
  }
];

const formFields = [
  {
    name: "year",
    label: "Ano do Evento",
    type: "number" as const,
    required: true,
    placeholder: "Digite o ano do evento"
  },
  {
    name: "app_primary_color",
    label: "Cor Primária",
    type: "color" as const,
    required: true,
    placeholder: "Selecione a cor primária"
  },
  {
    name: "app_font_color",
    label: "Cor da Fonte",
    type: "color" as const,
    required: true,
    placeholder: "Selecione a cor da fonte"
  },
  {
    name: "logo",
    label: "Logo",
    type: "file" as const,
    required: true,
    accept: "image/*"
  }
];

const detailFields = [
  { key: "id", label: "ID", type: "number" as const },
  { key: "year", label: "Ano", type: "number" as const },
  { key: "app_primary_color", label: "Cor Primária", type: "color" as const },
  { key: "app_font_color", label: "Cor da Fonte", type: "color" as const },
  { key: "app_logo_url", label: "Logo", type: "text" as const },
  { key: "created_at", label: "Criado em", type: "date" as const },
  { key: "updated_at", label: "Atualizado em", type: "date" as const }
];

export const EventosPage = () => {
  const params = useParams();
  const location = useLocation();
  const [currentItem, setCurrentItem] = useState<Evento | null>(null);
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
    deleteItem
  } = useApiCrud<Evento>({ endpoint: "/events" });

  const [itemToDelete, setItemToDelete] = useState<Evento | null>(null);

  // Determine current view based on URL
  const isListView = !params.id || params.id === 'create';
  const isDetailView = params.id && params.id !== 'create' && params.id !== 'edit';
  const isCreateView = params.id === 'create';
  const isEditView = params.id && params.id !== 'create' && location.pathname.includes('/edit');

  // Fetch single item when viewing details
  useEffect(() => {
    if (isDetailView && params.id) {
      fetchItem(parseInt(params.id));
    }
  }, [params.id, isDetailView]);

  const fetchItem = async (id: number) => {
    setLoadingItem(true);
    setItemError(null);
    try {
      const response = await fetch(`/events/${id}`);
      if (!response.ok) {
        throw new Error('Evento não encontrado');
      }
      const result = await response.json();
      setCurrentItem(result.data);
    } catch (err) {
      setItemError(err instanceof Error ? err.message : 'Erro ao carregar evento');
    } finally {
      setLoadingItem(false);
    }
  };

  const handleEdit = (item: Record<string, ReactNode>) => {
    openEditForm(item as Evento);
  };

  const handleDelete = (item: Record<string, ReactNode>) => {
    setItemToDelete(item as Evento);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      await deleteItem(itemToDelete);
      setItemToDelete(null);
    }
  };

  const handleCustomSubmit = async (formData: any) => {
    // Implementar lógica personalizada para envio de formulário com FormData
    const formDataToSend = new FormData();
    formDataToSend.append('year', formData.year);
    formDataToSend.append('app_primary_color', formData.app_primary_color);
    formDataToSend.append('app_font_color', formData.app_font_color);
    if (formData.logo) {
      formDataToSend.append('logo', formData.logo);
    }
    
    await handleSubmit(formDataToSend);
  };

  const transformedData: Record<string, ReactNode>[] = data.map(item => ({
    id: item.id,
    year: item.year,
    app_primary_color: (
      <div className="flex items-center space-x-2">
        <div 
          className="w-6 h-6 rounded border"
          style={{ backgroundColor: item.app_primary_color as string }}
        />
        <span>{item.app_primary_color}</span>
      </div>
    ),
    app_font_color: (
      <div className="flex items-center space-x-2">
        <div 
          className="w-6 h-6 rounded border"
          style={{ backgroundColor: item.app_font_color as string }}
        />
        <span>{item.app_font_color}</span>
      </div>
    ),
    app_logo_url: item.app_logo_url ? (
      <img 
        src={item.app_logo_url as string} 
        alt="Logo" 
        className="w-8 h-8 object-contain"
      />
    ) : "-",
    created_at: item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : "-",
    updated_at: item.updated_at
  }));

  // Transform current item for detail view
  const transformedCurrentItem = currentItem ? {
    id: currentItem.id,
    year: currentItem.year,
    app_primary_color: currentItem.app_primary_color,
    app_font_color: currentItem.app_font_color,
    app_logo_url: currentItem.app_logo_url || "-",
    created_at: currentItem.created_at,
    updated_at: currentItem.updated_at
  } : null;

  // Render based on current view
  if (isDetailView) {
    return (
      <ItemDetail
        title="Evento"
        description="Detalhes do evento da FECITEL"
        data={transformedCurrentItem || {}}
        fields={detailFields}
        loading={loadingItem}
        error={itemError}
      />
    );
  }

  if (isCreateView || isEditView) {
    return (
      <CrudFormPage
        title="Evento"
        description="Gerencie os eventos da FECITEL"
        fields={formFields}
        initialData={editingItem || {}}
        onSubmit={handleCustomSubmit}
        isEditing={!!editingItem}
        loading={loading}
      />
    );
  }

  // Default: List view
  return (
    <>
      <CrudListPage
        title="Eventos"
        description="Gerencie os eventos da FECITEL"
        columns={columns}
        data={transformedData}
        onAdd={openAddForm}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        error={error}
        baseEndpoint="/events"
      />

      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o evento do ano "{itemToDelete?.year}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}; 