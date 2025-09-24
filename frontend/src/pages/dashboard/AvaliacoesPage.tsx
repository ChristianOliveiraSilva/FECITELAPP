import { useParams, useNavigate } from "react-router-dom";
import { DataTable } from "@/components/ui/data-table";
import { CrudForm } from "@/components/ui/crud-form";
import { useApiCrudWithFilters } from "@/hooks/use-api-crud-with-filters";
import { apiService } from "@/lib/api";
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

interface AvaliacoesPageProps {
  view: 'list' | 'detail' | 'create' | 'edit';
}

export const AvaliacoesPage = ({ view }: AvaliacoesPageProps) => {
  const params = useParams();
  const navigate = useNavigate();
  const [currentItem, setCurrentItem] = useState<Avaliacao | null>(null);
  const [loadingItem, setLoadingItem] = useState(false);
  const [itemError, setItemError] = useState<string | null>(null);

  const {
    data,
    loading,
    error,
    totalItems,
    currentPage,
    pageSize,
    addItem,
    updateItem,
    deleteItem,
    getOriginalItem,
    handleFiltersChange
  } = useApiCrudWithFilters<Avaliacao>({ endpoint: "/assessments" });

  const [itemToDelete, setItemToDelete] = useState<Avaliacao | null>(null);

  // Fetch single item when viewing details or editing
  useEffect(() => {
    if ((view === 'detail' || view === 'edit') && params.id) {
      fetchItem(parseInt(params.id));
    }
  }, [params.id, view]);

  const fetchItem = async (id: number) => {
    setLoadingItem(true);
    setItemError(null);
    try {
      const response = await apiService.getById<Avaliacao>('/assessments', id);
      if (response.status) {
        setCurrentItem(response.data);
      } else {
        throw new Error(response.message || 'Avaliação não encontrada');
      }
    } catch (err) {
      setItemError(err instanceof Error ? err.message : 'Erro ao carregar avaliação');
    } finally {
      setLoadingItem(false);
    }
  };

  const handleAdd = () => {
    navigate('/dashboard/avaliacoes/create');
  };

  const handleView = (item: Record<string, ReactNode>) => {
    navigate(`/dashboard/avaliacoes/${item.id}`);
  };

  const handleEdit = (item: Record<string, ReactNode>) => {
    navigate(`/dashboard/avaliacoes/${item.id}/edit`);
  };

  const handleDelete = (item: Record<string, ReactNode>) => {
    setItemToDelete(item as Avaliacao);
  };

  const confirmDelete = async () => {
    if (itemToDelete?.id) {
      await deleteItem(itemToDelete.id as string | number);
      setItemToDelete(null);
    }
  };

  const handleSubmit = async (formData: Avaliacao) => {
    if (view === 'edit' && params.id) {
      await updateItem(params.id, formData);
      navigate('/dashboard/avaliacoes');
    } else if (view === 'create') {
      await addItem(formData);
      navigate('/dashboard/avaliacoes');
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
  if (view === 'detail') {
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

  if (view === 'create' || view === 'edit') {
    return (
      <CrudFormPage
        title="Avaliação"
        description="Gerencie as avaliações dos projetos da FECITEL"
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
        title="Avaliações"
        description="Gerencie as avaliações dos projetos da FECITEL"
        columns={columns}
        data={transformedData}
        onAdd={handleAdd}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        error={error}
        baseEndpoint="/assessments"
        onFiltersChange={handleFiltersChange}
        totalItems={totalItems}
        currentPage={currentPage}
        enableApiFiltering={true}
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