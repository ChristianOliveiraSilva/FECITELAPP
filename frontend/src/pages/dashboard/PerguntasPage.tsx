import { useParams, useNavigate } from "react-router-dom";
import { DataTable } from "@/components/ui/data-table";
import { CrudForm } from "@/components/ui/crud-form";
import { useApiCrud } from "@/hooks/use-api-crud";
import { apiService } from "@/lib/api";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { ReactNode, useState, useEffect } from "react";
import { ItemDetail } from "@/components/ui/item-detail";
import { CrudFormPage } from "@/components/ui/crud-form-page";
import { CrudListPage } from "@/components/ui/crud-list-page";

interface Pergunta extends Record<string, unknown> {
  id?: number;
  scientific_text: string;
  technological_text: string;
  type: number;
  number_alternatives: number;
  year: number;
  created_at?: string;
  updated_at?: string;
  responses?: Array<{
    id: number;
    assessment_id: number;
    response: string;
    score: number;
  }>;
  awards?: Array<{
    id: number;
    name: string;
    description: string;
  }>;
}

const columns = [
  { 
    key: "scientific_text", 
    label: "Texto Científico", 
    sortable: true, 
    filterable: true, 
    filterType: 'text' as const 
  },
  { 
    key: "technological_text", 
    label: "Texto Tecnológico", 
    sortable: true, 
    filterable: true, 
    filterType: 'text' as const 
  },
  { 
    key: "type", 
    label: "Tipo", 
    sortable: true, 
    filterable: true, 
    filterType: 'select' as const,
    filterOptions: [
      { value: "1", label: "Científico" },
      { value: "2", label: "Tecnológico" }
    ]
  },
  { 
    key: "number_alternatives", 
    label: "Alternativas", 
    sortable: true, 
    filterable: true, 
    filterType: 'number' as const 
  },
  { 
    key: "year", 
    label: "Ano", 
    sortable: true, 
    filterable: true, 
    filterType: 'number' as const 
  },
  { 
    key: "responses_count", 
    label: "Respostas", 
    sortable: false, 
    filterable: true, 
    filterType: 'number' as const 
  },
  { 
    key: "awards_count", 
    label: "Premiações", 
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
    name: "scientific_text",
    label: "Texto Científico",
    type: "textarea" as const,
    required: true,
    placeholder: "Digite o texto da pergunta científica"
  },
  {
    name: "technological_text",
    label: "Texto Tecnológico",
    type: "textarea" as const,
    required: true,
    placeholder: "Digite o texto da pergunta tecnológica"
  },
  {
    name: "type",
    label: "Tipo",
    type: "select" as const,
    required: true,
    placeholder: "Selecione o tipo",
    options: [
      { value: "1", label: "Científico" },
      { value: "2", label: "Tecnológico" }
    ]
  },
  {
    name: "number_alternatives",
    label: "Número de Alternativas",
    type: "number" as const,
    required: true,
    placeholder: "Digite o número de alternativas"
  },
  {
    name: "year",
    label: "Ano",
    type: "number" as const,
    required: true,
    placeholder: "Digite o ano"
  }
];

const detailFields = [
  { key: "id", label: "ID", type: "number" as const },
  { key: "scientific_text", label: "Texto Científico", type: "text" as const },
  { key: "technological_text", label: "Texto Tecnológico", type: "text" as const },
  { key: "type", label: "Tipo", type: "text" as const },
  { key: "number_alternatives", label: "Número de Alternativas", type: "number" as const },
  { key: "year", label: "Ano", type: "number" as const },
  { key: "responses_count", label: "Respostas", type: "array" as const },
  { key: "awards_count", label: "Premiações", type: "array" as const },
  { key: "created_at", label: "Criado em", type: "date" as const },
  { key: "updated_at", label: "Atualizado em", type: "date" as const }
];

interface PerguntasPageProps {
  view: 'list' | 'detail' | 'create' | 'edit';
}

export const PerguntasPage = ({ view }: PerguntasPageProps) => {
  const params = useParams();
  const navigate = useNavigate();
  const [currentItem, setCurrentItem] = useState<Pergunta | null>(null);
  const [loadingItem, setLoadingItem] = useState(false);
  const [itemError, setItemError] = useState<string | null>(null);

  const {
    data,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    getOriginalItem
  } = useApiCrud<Pergunta>({ endpoint: "/questions" });

  const [itemToDelete, setItemToDelete] = useState<Pergunta | null>(null);

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
      const response = await apiService.getById<Pergunta>('/questions', id);
      if (response.status) {
        setCurrentItem(response.data);
      } else {
        throw new Error(response.message || 'Pergunta não encontrada');
      }
    } catch (err) {
      setItemError(err instanceof Error ? err.message : 'Erro ao carregar pergunta');
    } finally {
      setLoadingItem(false);
    }
  };

  const handleAdd = () => {
    navigate('/dashboard/perguntas/create');
  };

  const handleView = (item: Record<string, ReactNode>) => {
    navigate(`/dashboard/perguntas/${item.id}`);
  };

  const handleEdit = (item: Record<string, ReactNode>) => {
    navigate(`/dashboard/perguntas/${item.id}/edit`);
  };

  const handleDelete = (item: Record<string, ReactNode>) => {
    setItemToDelete(item as Pergunta);
  };

  const confirmDelete = async () => {
    if (itemToDelete?.id) {
      await deleteItem(itemToDelete.id as string | number);
      setItemToDelete(null);
    }
  };

  const handleSubmit = async (formData: Pergunta) => {
    if (view === 'edit' && params.id) {
      await updateItem(params.id, formData);
      navigate('/dashboard/perguntas');
    } else if (view === 'create') {
      await addItem(formData);
      navigate('/dashboard/perguntas');
    }
  };

  const transformedData: Record<string, ReactNode>[] = data.map(item => ({
    id: item.id,
    scientific_text: item.scientific_text,
    technological_text: item.technological_text,
    type: item.type === 1 ? "Científico" : "Tecnológico",
    number_alternatives: item.number_alternatives,
    year: item.year,
    responses_count: item.responses?.length || 0,
    awards_count: item.awards?.length || 0,
    created_at: item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : "-",
    updated_at: item.updated_at
  }));

  // Transform current item for detail view
  const transformedCurrentItem = currentItem ? {
    id: currentItem.id,
    scientific_text: currentItem.scientific_text,
    technological_text: currentItem.technological_text,
    type: currentItem.type === 1 ? "Científico" : "Tecnológico",
    number_alternatives: currentItem.number_alternatives,
    year: currentItem.year,
    responses_count: currentItem.responses?.length || 0,
    awards_count: currentItem.awards?.length || 0,
    created_at: currentItem.created_at,
    updated_at: currentItem.updated_at
  } : null;

  // Render based on current view
  if (view === 'detail') {
    return (
      <ItemDetail
        title="Pergunta"
        description="Detalhes da pergunta de avaliação da FECITEL"
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
        title="Pergunta"
        description="Gerencie as perguntas de avaliação da FECITEL"
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
        title="Perguntas"
        description="Gerencie as perguntas de avaliação da FECITEL"
        columns={columns}
        data={transformedData}
        onAdd={handleAdd}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        error={error}
        baseEndpoint="/questions"
      />

      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta pergunta? Esta ação não pode ser desfeita.
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