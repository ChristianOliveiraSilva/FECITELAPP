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

interface Escola extends Record<string, unknown> {
  id?: number;
  name: string;
  created_at?: string;
  updated_at?: string;
  students?: Array<{
    id: number;
    name: string;
    school_grade: number;
    year: number;
  }>;
}

const columns = [
  { 
    key: "name", 
    label: "Nome da Escola", 
    sortable: true, 
    filterable: true, 
    filterType: 'text' as const 
  },
  { 
    key: "students_count", 
    label: "Estudantes", 
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
    label: "Nome da Escola",
    type: "text" as const,
    required: true,
    placeholder: "Digite o nome da escola"
  }
];

const detailFields = [
  { key: "id", label: "ID", type: "number" as const },
  { key: "name", label: "Nome da Escola", type: "text" as const },
  { key: "students_count", label: "Estudantes", type: "array" as const },
  { key: "created_at", label: "Criado em", type: "date" as const },
  { key: "updated_at", label: "Atualizado em", type: "date" as const }
];

export const EscolasPage = () => {
  const params = useParams();
  const location = useLocation();
  const [currentItem, setCurrentItem] = useState<Escola | null>(null);
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
  } = useApiCrud<Escola>({ endpoint: "/schools" });

  const [itemToDelete, setItemToDelete] = useState<Escola | null>(null);

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
      const response = await fetch(`/schools/${id}`);
      if (!response.ok) {
        throw new Error('Escola não encontrada');
      }
      const result = await response.json();
      setCurrentItem(result.data);
    } catch (err) {
      setItemError(err instanceof Error ? err.message : 'Erro ao carregar escola');
    } finally {
      setLoadingItem(false);
    }
  };

  const handleEdit = (item: Record<string, ReactNode>) => {
    openEditForm(item as Escola);
  };

  const handleDelete = (item: Record<string, ReactNode>) => {
    setItemToDelete(item as Escola);
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
    students_count: item.students?.length || 0,
    created_at: item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : "-",
    updated_at: item.updated_at
  }));

  // Transform current item for detail view
  const transformedCurrentItem = currentItem ? {
    id: currentItem.id,
    name: currentItem.name,
    students_count: currentItem.students?.length || 0,
    created_at: currentItem.created_at,
    updated_at: currentItem.updated_at
  } : null;

  // Render based on current view
  if (isDetailView) {
    return (
      <ItemDetail
        title="Escola"
        description="Detalhes da escola participante da FECITEL"
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
        title="Escola"
        description="Gerencie as escolas participantes da FECITEL"
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
        title="Escolas"
        description="Gerencie as escolas participantes da FECITEL"
        columns={columns}
        data={transformedData}
        onAdd={openAddForm}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        error={error}
        baseEndpoint="/schools"
      />

      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a escola "{itemToDelete?.name}"? Esta ação não pode ser desfeita.
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