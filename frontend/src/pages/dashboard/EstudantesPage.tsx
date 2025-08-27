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

interface Estudante extends Record<string, unknown> {
  id?: number;
  name: string;
  email: string;
  school_grade: number;
  year: number;
  school_id: number;
  created_at?: string;
  updated_at?: string;
  school?: {
    id: number;
    name: string;
  };
  projects?: Array<{
    id: number;
    title: string;
    year: number;
    category_id: number;
  }>;
}

const columns = [
  { 
    key: "name", 
    label: "Nome", 
    sortable: true, 
    filterable: true, 
    filterType: 'text' as const 
  },
  { 
    key: "email", 
    label: "Email", 
    sortable: true, 
    filterable: true, 
    filterType: 'text' as const 
  },
  { 
    key: "school_grade", 
    label: "Série", 
    sortable: true, 
    filterable: true, 
    filterType: 'select' as const,
    filterOptions: [
      { value: "1", label: "1º ano" },
      { value: "2", label: "2º ano" },
      { value: "3", label: "3º ano" }
    ]
  },
  { 
    key: "year", 
    label: "Ano", 
    sortable: true, 
    filterable: true, 
    filterType: 'number' as const 
  },
  { 
    key: "school_name", 
    label: "Escola", 
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
    label: "Nome do Estudante",
    type: "text" as const,
    required: true,
    placeholder: "Digite o nome do estudante"
  },
  {
    name: "email",
    label: "Email",
    type: "email" as const,
    required: true,
    placeholder: "Digite o email do estudante"
  },
  {
    name: "school_grade",
    label: "Série",
    type: "select" as const,
    required: true,
    placeholder: "Selecione a série",
    options: [
      { value: "1", label: "1º ano" },
      { value: "2", label: "2º ano" },
      { value: "3", label: "3º ano" }
    ]
  },
  {
    name: "year",
    label: "Ano",
    type: "number" as const,
    required: true,
    placeholder: "Digite o ano"
  },
  {
    name: "school_id",
    label: "Escola",
    type: "select" as const,
    required: true,
    placeholder: "Selecione a escola",
    options: [] // Será preenchido dinamicamente
  }
];

const detailFields = [
  { key: "id", label: "ID", type: "number" as const },
  { key: "name", label: "Nome", type: "text" as const },
  { key: "email", label: "Email", type: "text" as const },
  { key: "school_grade", label: "Série", type: "text" as const },
  { key: "year", label: "Ano", type: "number" as const },
  { key: "school_name", label: "Escola", type: "text" as const },
  { key: "projects_count", label: "Projetos", type: "array" as const },
  { key: "created_at", label: "Criado em", type: "date" as const },
  { key: "updated_at", label: "Atualizado em", type: "date" as const }
];

export const EstudantesPage = () => {
  const params = useParams();
  const location = useLocation();
  const [currentItem, setCurrentItem] = useState<Estudante | null>(null);
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
  } = useApiCrud<Estudante>({ endpoint: "/students" });

  const [itemToDelete, setItemToDelete] = useState<Estudante | null>(null);

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
      const response = await fetch(`/students/${id}`);
      if (!response.ok) {
        throw new Error('Estudante não encontrado');
      }
      const result = await response.json();
      setCurrentItem(result.data);
    } catch (err) {
      setItemError(err instanceof Error ? err.message : 'Erro ao carregar estudante');
    } finally {
      setLoadingItem(false);
    }
  };

  const handleEdit = (item: Record<string, ReactNode>) => {
    openEditForm(item as Estudante);
  };

  const handleDelete = (item: Record<string, ReactNode>) => {
    setItemToDelete(item as Estudante);
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
    email: item.email,
    school_grade: item.school_grade === 1 ? "1º ano" : item.school_grade === 2 ? "2º ano" : "3º ano",
    year: item.year,
    school_id: item.school_id,
    school_name: item.school?.name || "-",
    projects_count: item.projects?.length || 0,
    created_at: item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : "-",
    updated_at: item.updated_at
  }));

  // Transform current item for detail view
  const transformedCurrentItem = currentItem ? {
    id: currentItem.id,
    name: currentItem.name,
    email: currentItem.email,
    school_grade: currentItem.school_grade === 1 ? "1º ano" : currentItem.school_grade === 2 ? "2º ano" : "3º ano",
    year: currentItem.year,
    school_name: currentItem.school?.name || "-",
    projects_count: currentItem.projects?.length || 0,
    created_at: currentItem.created_at,
    updated_at: currentItem.updated_at
  } : null;

  // Render based on current view
  if (isDetailView) {
    return (
      <ItemDetail
        title="Estudante"
        description="Detalhes do estudante participante da FECITEL"
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
        title="Estudante"
        description="Gerencie os estudantes participantes da FECITEL"
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
        title="Estudantes"
        description="Gerencie os estudantes participantes da FECITEL"
        columns={columns}
        data={transformedData}
        onAdd={openAddForm}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        error={error}
        baseEndpoint="/students"
      />

      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o estudante "{itemToDelete?.name}"? Esta ação não pode ser desfeita.
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