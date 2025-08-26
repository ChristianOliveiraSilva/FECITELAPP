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

interface Avaliacao extends Record<string, unknown> {
  id?: number;
  evaluator_id: number;
  project_id: number;
  created_at?: string;
  updated_at?: string;
  evaluator?: {
    id: number;
    PIN: string;
    user_id: number;
  };
  project?: {
    id: number;
    title: string;
    year: number;
    category_id: number;
    category?: {
      id: number;
      name: string;
    };
  };
  responses?: Array<{
    id: number;
    question_id: number;
    response: string;
    score: number;
  }>;
}

const columns = [
  { 
    key: "evaluator_name", 
    label: "Avaliador", 
    sortable: true, 
    filterable: true, 
    filterType: 'text' as const 
  },
  { 
    key: "project_title", 
    label: "Projeto", 
    sortable: true, 
    filterable: true, 
    filterType: 'text' as const 
  },
  { 
    key: "project_year", 
    label: "Ano", 
    sortable: true, 
    filterable: true, 
    filterType: 'number' as const 
  },
  { 
    key: "project_category", 
    label: "Categoria", 
    sortable: true, 
    filterable: true, 
    filterType: 'text' as const 
  },
  { 
    key: "has_response", 
    label: "Respondido", 
    sortable: true, 
    filterable: true, 
    filterType: 'select' as const,
    filterOptions: [
      { value: "true", label: "Sim" },
      { value: "false", label: "Não" }
    ]
  },
  { 
    key: "note", 
    label: "Nota", 
    sortable: true, 
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
    name: "evaluator_id",
    label: "Avaliador",
    type: "select" as const,
    required: true,
    placeholder: "Selecione o avaliador",
    options: [] // Será preenchido dinamicamente
  },
  {
    name: "project_id",
    label: "Projeto",
    type: "select" as const,
    required: true,
    placeholder: "Selecione o projeto",
    options: [] // Será preenchido dinamicamente
  }
];

const detailFields = [
  { key: "id", label: "ID", type: "number" as const },
  { key: "evaluator_name", label: "Avaliador", type: "text" as const },
  { key: "project_title", label: "Projeto", type: "text" as const },
  { key: "project_year", label: "Ano", type: "number" as const },
  { key: "project_category", label: "Categoria", type: "text" as const },
  { key: "has_response", label: "Respondido", type: "boolean" as const },
  { key: "note", label: "Nota Média", type: "number" as const },
  { key: "responses_count", label: "Respostas", type: "array" as const },
  { key: "created_at", label: "Criado em", type: "date" as const },
  { key: "updated_at", label: "Atualizado em", type: "date" as const }
];

export const AvaliacoesPage = () => {
  const params = useParams();
  const location = useLocation();
  const [currentItem, setCurrentItem] = useState<Avaliacao | null>(null);
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
  } = useApiCrud<Avaliacao>({ endpoint: "/assessments" });

  const [itemToDelete, setItemToDelete] = useState<Avaliacao | null>(null);

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
      const response = await fetch(`/assessments/${id}`);
      if (!response.ok) {
        throw new Error('Avaliação não encontrada');
      }
      const result = await response.json();
      setCurrentItem(result.data);
    } catch (err) {
      setItemError(err instanceof Error ? err.message : 'Erro ao carregar avaliação');
    } finally {
      setLoadingItem(false);
    }
  };

  const handleEdit = (item: Record<string, ReactNode>) => {
    openEditForm(item as Avaliacao);
  };

  const handleDelete = (item: Record<string, ReactNode>) => {
    setItemToDelete(item as Avaliacao);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      await deleteItem(itemToDelete);
      setItemToDelete(null);
    }
  };

  const transformedData: Record<string, ReactNode>[] = data.map(item => ({
    id: item.id,
    evaluator_id: item.evaluator_id,
    project_id: item.project_id,
    evaluator_name: item.evaluator?.PIN || `Avaliador ${item.evaluator_id}`,
    project_title: item.project?.title || `Projeto ${item.project_id}`,
    project_year: item.project?.year || "-",
    project_category: item.project?.category?.name || "-",
    has_response: item.responses && item.responses.length > 0 ? "Sim" : "Não",
    note: item.responses && item.responses.length > 0 ? 
      (item.responses.reduce((sum, r) => sum + (r.score || 0), 0) / item.responses.length).toFixed(2) : "0.00",
    created_at: item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : "-",
    updated_at: item.updated_at
  }));

  // Transform current item for detail view
  const transformedCurrentItem = currentItem ? {
    id: currentItem.id,
    evaluator_name: currentItem.evaluator?.PIN || `Avaliador ${currentItem.evaluator_id}`,
    project_title: currentItem.project?.title || `Projeto ${currentItem.project_id}`,
    project_year: currentItem.project?.year || "-",
    project_category: currentItem.project?.category?.name || "-",
    has_response: currentItem.responses && currentItem.responses.length > 0 ? "Sim" : "Não",
    note: currentItem.responses && currentItem.responses.length > 0 ? 
      (currentItem.responses.reduce((sum, r) => sum + (r.score || 0), 0) / currentItem.responses.length).toFixed(2) : "0.00",
    responses_count: currentItem.responses?.length || 0,
    created_at: currentItem.created_at,
    updated_at: currentItem.updated_at
  } : null;

  // Render based on current view
  if (isDetailView) {
    return (
      <ItemDetail
        title="Avaliação"
        description="Detalhes da avaliação do projeto"
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
        title="Avaliação"
        description="Gerencie as avaliações dos projetos da FECITEL"
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
        title="Avaliações"
        description="Gerencie as avaliações dos projetos da FECITEL"
        columns={columns}
        data={transformedData}
        searchPlaceholder="Buscar por projeto, avaliador..."
        onAdd={openAddForm}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        error={error}
        baseEndpoint="/assessments"
      />

      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a avaliação do projeto "{itemToDelete?.project?.title}"? Esta ação não pode ser desfeita.
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