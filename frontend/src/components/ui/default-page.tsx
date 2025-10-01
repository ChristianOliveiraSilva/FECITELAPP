import { useParams, useNavigate } from "react-router-dom";
import { useApiCrudWithFilters } from "@/hooks/use-api-crud-with-filters";
import { useApiCrud } from "@/hooks/use-api-crud";
import { apiService } from "@/lib/api";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ReactNode, useState, useEffect, useCallback } from "react";
import { ItemDetail } from "@/components/ui/item-detail";
import { CrudFormPage } from "@/components/ui/crud-form-page";
import { CrudListPage } from "@/components/ui/crud-list-page";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'number' | 'date' | 'select';
  filterOptions?: Array<{ value: string; label: string }>;
}

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select' | 'multiselect' | 'textarea' | 'color' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  accept?: string;
  generateButton?: boolean;
  generateEndpoint?: string;
}

interface DetailField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'array';
}

interface DefaultPageProps<T extends Record<string, unknown>> {
  // Configurações básicas
  endpoint: string;
  title: string;
  description: string;
  view: 'list' | 'detail' | 'create' | 'edit';
  
  // Configurações de tabela/lista
  columns: Column[];
  
  // Configurações de formulário
  formFields: FormField[];
  
  // Configurações de detalhes
  detailFields: DetailField[];
  
  // Funções de transformação
  transformData: (item: T) => Record<string, ReactNode>;
  transformCurrentItem: (item: T) => Record<string, unknown>;
  
  // Customizações opcionais
  useFilters?: boolean;
  selectable?: boolean;
  actionButtons?: (selectedItems: Record<string, unknown>[]) => ReactNode;
  deleteConfirmMessage?: (item: T) => string;
  onCustomSubmit?: (formData: Record<string, unknown>, view: 'create' | 'edit', params: Record<string, string | undefined>) => Promise<void>;
  
  // Caminhos de navegação
  basePath: string; // Ex: '/dashboard/usuarios'
}

export function DefaultPage<T extends Record<string, unknown>>({
  endpoint,
  title,
  description,
  view,
  columns,
  formFields,
  detailFields,
  transformData,
  transformCurrentItem,
  useFilters = true,
  selectable = false,
  actionButtons,
  deleteConfirmMessage,
  onCustomSubmit,
  basePath
}: DefaultPageProps<T>) {
  const params = useParams();
  const navigate = useNavigate();
  const [currentItem, setCurrentItem] = useState<T | null>(null);
  const [loadingItem, setLoadingItem] = useState(false);
  const [itemError, setItemError] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);

  // Use conditional hook based on useFilters prop
  const crudWithFilters = useApiCrudWithFilters<T>({ endpoint });
  const crudWithoutFilters = useApiCrud<T>({ endpoint });
  const crudHook = useFilters ? crudWithFilters : crudWithoutFilters;

  const {
    data,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
  } = crudHook;

  const totalItems = 'totalItems' in crudHook ? crudHook.totalItems : undefined;
  const currentPage = 'currentPage' in crudHook ? crudHook.currentPage : undefined;
  const handleFiltersChange = 'handleFiltersChange' in crudHook ? crudHook.handleFiltersChange : undefined;

  const fetchItem = useCallback(async (id: number) => {
    setLoadingItem(true);
    setItemError(null);
    try {
      const response = await apiService.getById<T>(endpoint, id);
      if (response.status) {
        setCurrentItem(response.data);
      } else {
        throw new Error(response.message || 'Item não encontrado');
      }
    } catch (err) {
      setItemError(err instanceof Error ? err.message : 'Erro ao carregar item');
    } finally {
      setLoadingItem(false);
    }
  }, [endpoint]);

  // Fetch single item when viewing details or editing
  useEffect(() => {
    if ((view === 'detail' || view === 'edit') && params.id) {
      fetchItem(parseInt(params.id));
    }
  }, [params.id, view, fetchItem]);

  const handleAdd = () => {
    navigate(`${basePath}/create`);
  };

  const handleView = (item: Record<string, ReactNode>) => {
    navigate(`${basePath}/${item.id}`);
  };

  const handleEdit = (item: Record<string, ReactNode>) => {
    navigate(`${basePath}/${item.id}/edit`);
  };

  const handleDelete = (item: Record<string, ReactNode>) => {
    setItemToDelete(item as T);
  };

  const confirmDelete = async () => {
    if (itemToDelete?.id) {
      await deleteItem(itemToDelete.id as string | number);
      setItemToDelete(null);
    }
  };

  const handleSubmit = async (formData: Record<string, unknown>) => {
    if (onCustomSubmit) {
      await onCustomSubmit(formData, view as 'create' | 'edit', params);
      navigate(basePath);
      return;
    }

    if (view === 'edit' && params.id) {
      await updateItem(params.id, formData as T);
      navigate(basePath);
    } else if (view === 'create') {
      await addItem(formData as T);
      navigate(basePath);
    }
  };

  const transformedData: Record<string, ReactNode>[] = data.map(transformData);

  const transformedCurrentItemData = currentItem ? transformCurrentItem(currentItem) : null;

  // Get delete confirmation message
  const getDeleteMessage = () => {
    if (deleteConfirmMessage && itemToDelete) {
      return deleteConfirmMessage(itemToDelete);
    }
    return `Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.`;
  };

  // Render based on current view
  if (view === 'detail') {
    return (
      <ItemDetail
        title={title}
        description={description}
        data={transformedCurrentItemData || {}}
        fields={detailFields}
        loading={loadingItem}
        error={itemError}
      />
    );
  }

  if (view === 'create' || view === 'edit') {
    return (
      <CrudFormPage
        title={title}
        description={description}
        fields={formFields}
        initialData={view === 'edit' ? currentItem || {} : {}}
        onSubmit={handleSubmit}
        isEditing={view === 'edit'}
        loading={loading || loadingItem}
      />
    );
  }

  // Default: List view
  return (
    <>
      <CrudListPage
        title={title}
        description={description}
        columns={columns}
        data={transformedData}
        actionButtons={actionButtons}
        onAdd={handleAdd}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        selectable={selectable}
        loading={loading}
        error={error}
        baseEndpoint={endpoint}
        onFiltersChange={handleFiltersChange}
        totalItems={totalItems}
        currentPage={currentPage}
        enableApiFiltering={useFilters}
      />

      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {getDeleteMessage()}
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
}

