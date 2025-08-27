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

interface Area extends Record<string, unknown> {
  id?: number;
  name: string;
  main_category_id?: number;
  created_at?: string;
  updated_at?: string;
  main_category?: {
    id: number;
    name: string;
  };
  projects?: Array<{
    id: number;
    title: string;
    year: number;
    projectType: number;
  }>;
  evaluators?: Array<{
    id: number;
    PIN: string;
    user_id: number;
  }>;
  sub_categories?: Array<{
    id: number;
    name: string;
    main_category_id: number;
  }>;
}

const columns = [
  { 
    key: "name", 
    label: "Nome da Área", 
    sortable: true, 
    filterable: true, 
    filterType: 'text' as const 
  },
  { 
    key: "main_category_name", 
    label: "Categoria Principal", 
    sortable: true, 
    filterable: true, 
    filterType: 'text' as const 
  },
  { 
    key: "projects_count", 
    label: "Projetos", 
    sortable: false, 
    filterable: true, 
    filterType: 'number' as const 
  },
  { 
    key: "evaluators_count", 
    label: "Avaliadores", 
    sortable: false, 
    filterable: true, 
    filterType: 'number' as const 
  },
  { 
    key: "sub_categories_count", 
    label: "Sub-categorias", 
    sortable: false, 
    filterable: true, 
    filterType: 'number' as const 
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
    name: "name",
    label: "Nome da Área",
    type: "text" as const,
    required: true,
    placeholder: "Digite o nome da área"
  },
  {
    name: "main_category_id",
    label: "Categoria Principal",
    type: "select" as const,
    required: false,
    placeholder: "Selecione a categoria principal",
    options: [] // Será preenchido dinamicamente
  }
];

const detailFields = [
  { key: "id", label: "ID", type: "number" as const },
  { key: "name", label: "Nome da Área", type: "text" as const },
  { key: "main_category_name", label: "Categoria Principal", type: "text" as const },
  { key: "projects_count", label: "Projetos", type: "array" as const },
  { key: "evaluators_count", label: "Avaliadores", type: "array" as const },
  { key: "sub_categories_count", label: "Sub-categorias", type: "array" as const },
  { key: "created_at", label: "Criado em", type: "date" as const },
  { key: "updated_at", label: "Atualizado em", type: "date" as const }
];

export const AreasPage = () => {
  const params = useParams();
  const location = useLocation();
  const [currentItem, setCurrentItem] = useState<Area | null>(null);
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
  } = useApiCrud<Area>({ endpoint: "/categories" });

  const [itemToDelete, setItemToDelete] = useState<Area | null>(null);

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
      const response = await fetch(`/categories/${id}`);
      if (!response.ok) {
        throw new Error('Área não encontrada');
      }
      const result = await response.json();
      setCurrentItem(result.data);
    } catch (err) {
      setItemError(err instanceof Error ? err.message : 'Erro ao carregar área');
    } finally {
      setLoadingItem(false);
    }
  };

  const handleEdit = (item: Record<string, ReactNode>) => {
    openEditForm(item as Area);
  };

  const handleDelete = (item: Record<string, ReactNode>) => {
    setItemToDelete(item as Area);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      await deleteItem(itemToDelete);
      setItemToDelete(null);
    }
  };

  const transformedData: Record<string, ReactNode>[] = data.map(item => ({
    id: item.id,
    name: item.name,
    main_category_name: item.main_category?.name || "-",
    projects_count: item.projects?.length || 0,
    evaluators_count: item.evaluators?.length || 0,
    sub_categories_count: item.sub_categories?.length || 0,
    created_at: item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : "-",
    updated_at: item.updated_at
  }));

  // Transform current item for detail view
  const transformedCurrentItem = currentItem ? {
    id: currentItem.id,
    name: currentItem.name,
    main_category_name: currentItem.main_category?.name || "-",
    projects_count: currentItem.projects?.length || 0,
    evaluators_count: currentItem.evaluators?.length || 0,
    sub_categories_count: currentItem.sub_categories?.length || 0,
    created_at: currentItem.created_at,
    updated_at: currentItem.updated_at
  } : null;

  // Render based on current view
  if (isDetailView) {
    return (
      <ItemDetail
        title="Área"
        description="Detalhes da área de projetos"
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
        title="Área"
        description="Gerencie as áreas de projetos da FECITEL"
        fields={formFields}
        initialData={editingItem || {}}
        onSubmit={handleSubmit}
        isEditing={!!editingItem}
        loading={loading}
      />
    );
  }

  // Default: List view
  return (
    <>
      <CrudListPage
        title="Áreas"
        description="Gerencie as áreas de projetos da FECITEL"
        columns={columns}
        data={transformedData}
        onAdd={openAddForm}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        error={error}
        baseEndpoint="/categories"
      />

      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a área "{itemToDelete?.name}"? Esta ação não pode ser desfeita.
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