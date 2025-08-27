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

interface Premiacao extends Record<string, unknown> {
  id?: number;
  name: string;
  description?: string;
  school_grade: number;
  total_positions: number;
  use_school_grades: boolean;
  use_categories: boolean;
  created_at?: string;
  updated_at?: string;
  questions?: Array<{
    id: number;
    scientific_text: string;
    technological_text: string;
    type: number;
    number_alternatives: number;
  }>;
}

const columns = [
  { 
    key: "name", 
    label: "Nome da Premiação", 
    sortable: true, 
    filterable: true, 
    filterType: 'text' as const 
  },
  { 
    key: "description", 
    label: "Descrição", 
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
    key: "total_positions", 
    label: "Total de Posições", 
    sortable: true, 
    filterable: true, 
    filterType: 'number' as const 
  },
  { 
    key: "use_school_grades", 
    label: "Usa Séries", 
    sortable: true, 
    filterable: true, 
    filterType: 'select' as const,
    filterOptions: [
      { value: "true", label: "Sim" },
      { value: "false", label: "Não" }
    ]
  },
  { 
    key: "use_categories", 
    label: "Usa Categorias", 
    sortable: true, 
    filterable: true, 
    filterType: 'select' as const,
    filterOptions: [
      { value: "true", label: "Sim" },
      { value: "false", label: "Não" }
    ]
  },
  { 
    key: "questions_count", 
    label: "Perguntas", 
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
    label: "Nome da Premiação",
    type: "text" as const,
    required: true,
    placeholder: "Digite o nome da premiação"
  },
  {
    name: "description",
    label: "Descrição",
    type: "textarea" as const,
    required: false,
    placeholder: "Digite a descrição da premiação"
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
    name: "total_positions",
    label: "Total de Posições",
    type: "number" as const,
    required: true,
    placeholder: "Digite o total de posições"
  },
  {
    name: "use_school_grades",
    label: "Usa Séries",
    type: "select" as const,
    required: true,
    placeholder: "Selecione se usa séries",
    options: [
      { value: "true", label: "Sim" },
      { value: "false", label: "Não" }
    ]
  },
  {
    name: "use_categories",
    label: "Usa Categorias",
    type: "select" as const,
    required: true,
    placeholder: "Selecione se usa categorias",
    options: [
      { value: "true", label: "Sim" },
      { value: "false", label: "Não" }
    ]
  }
];

const detailFields = [
  { key: "id", label: "ID", type: "number" as const },
  { key: "name", label: "Nome da Premiação", type: "text" as const },
  { key: "description", label: "Descrição", type: "text" as const },
  { key: "school_grade", label: "Série", type: "text" as const },
  { key: "total_positions", label: "Total de Posições", type: "number" as const },
  { key: "use_school_grades", label: "Usa Séries", type: "boolean" as const },
  { key: "use_categories", label: "Usa Categorias", type: "boolean" as const },
  { key: "questions_count", label: "Perguntas", type: "array" as const },
  { key: "created_at", label: "Criado em", type: "date" as const },
  { key: "updated_at", label: "Atualizado em", type: "date" as const }
];

export const PremiacoesPage = () => {
  const params = useParams();
  const location = useLocation();
  const [currentItem, setCurrentItem] = useState<Premiacao | null>(null);
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
  } = useApiCrud<Premiacao>({ endpoint: "/awards" });

  const [itemToDelete, setItemToDelete] = useState<Premiacao | null>(null);

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
      const response = await fetch(`/awards/${id}`);
      if (!response.ok) {
        throw new Error('Premiação não encontrada');
      }
      const result = await response.json();
      setCurrentItem(result.data);
    } catch (err) {
      setItemError(err instanceof Error ? err.message : 'Erro ao carregar premiação');
    } finally {
      setLoadingItem(false);
    }
  };

  const handleEdit = (item: Record<string, ReactNode>) => {
    openEditForm(item as Premiacao);
  };

  const handleDelete = (item: Record<string, ReactNode>) => {
    setItemToDelete(item as Premiacao);
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
    description: item.description || "-",
    school_grade: item.school_grade === 1 ? "1º ano" : item.school_grade === 2 ? "2º ano" : "3º ano",
    total_positions: item.total_positions,
    use_school_grades: item.use_school_grades ? "Sim" : "Não",
    use_categories: item.use_categories ? "Sim" : "Não",
    questions_count: item.questions?.length || 0,
    created_at: item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : "-",
    updated_at: item.updated_at
  }));

  // Transform current item for detail view
  const transformedCurrentItem = currentItem ? {
    id: currentItem.id,
    name: currentItem.name,
    description: currentItem.description || "-",
    school_grade: currentItem.school_grade === 1 ? "1º ano" : currentItem.school_grade === 2 ? "2º ano" : "3º ano",
    total_positions: currentItem.total_positions,
    use_school_grades: currentItem.use_school_grades,
    use_categories: currentItem.use_categories,
    questions_count: currentItem.questions?.length || 0,
    created_at: currentItem.created_at,
    updated_at: currentItem.updated_at
  } : null;

  // Render based on current view
  if (isDetailView) {
    return (
      <ItemDetail
        title="Premiação"
        description="Detalhes da premiação da FECITEL"
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
        title="Premiação"
        description="Gerencie as premiações da FECITEL"
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
        title="Premiações"
        description="Gerencie as premiações da FECITEL"
        columns={columns}
        data={transformedData}
        onAdd={openAddForm}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        error={error}
        baseEndpoint="/awards"
      />

      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a premiação "{itemToDelete?.name}"? Esta ação não pode ser desfeita.
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