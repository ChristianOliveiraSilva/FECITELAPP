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

interface Avaliador extends Record<string, unknown> {
  id?: number;
  PIN: string;
  user_id: number;
  created_at?: string;
  updated_at?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    active: boolean;
  };
  categories?: Array<{
    id: number;
    name: string;
  }>;
  assessments?: Array<{
    id: number;
    project_id: number;
    created_at: string;
    project?: {
      id: number;
      title: string;
      year: number;
    };
  }>;
}

const columns = [
  { 
    key: "PIN", 
    label: "PIN", 
    sortable: true, 
    filterable: true, 
    filterType: 'text' as const 
  },
  { 
    key: "user_name", 
    label: "Nome", 
    sortable: true, 
    filterable: true, 
    filterType: 'text' as const 
  },
  { 
    key: "user_email", 
    label: "Email", 
    sortable: true, 
    filterable: true, 
    filterType: 'text' as const 
  },
  { 
    key: "user_active", 
    label: "Ativo", 
    sortable: true, 
    filterable: true, 
    filterType: 'select' as const,
    filterOptions: [
      { value: "true", label: "Sim" },
      { value: "false", label: "Não" }
    ]
  },
  { 
    key: "categories_count", 
    label: "Áreas", 
    sortable: false, 
    filterable: true, 
    filterType: 'number' as const 
  },
  { 
    key: "assessments_count", 
    label: "Avaliações", 
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
    name: "PIN",
    label: "PIN",
    type: "text" as const,
    required: true,
    placeholder: "Digite o PIN do avaliador"
  },
  {
    name: "user_id",
    label: "Usuário",
    type: "select" as const,
    required: true,
    placeholder: "Selecione o usuário",
    options: [] // Será preenchido dinamicamente
  }
];

const detailFields = [
  { key: "id", label: "ID", type: "number" as const },
  { key: "PIN", label: "PIN", type: "text" as const },
  { key: "user_name", label: "Nome", type: "text" as const },
  { key: "user_email", label: "Email", type: "text" as const },
  { key: "user_active", label: "Ativo", type: "boolean" as const },
  { key: "categories_count", label: "Áreas", type: "array" as const },
  { key: "assessments_count", label: "Avaliações", type: "array" as const },
  { key: "created_at", label: "Criado em", type: "date" as const },
  { key: "updated_at", label: "Atualizado em", type: "date" as const }
];

interface AvaliadoresPageProps {
  view: 'list' | 'detail' | 'create' | 'edit';
}

export const AvaliadoresPage = ({ view }: AvaliadoresPageProps) => {
  const params = useParams();
  const navigate = useNavigate();
  const [currentItem, setCurrentItem] = useState<Avaliador | null>(null);
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
  } = useApiCrud<Avaliador>({ endpoint: "/evaluators" });

  const [itemToDelete, setItemToDelete] = useState<Avaliador | null>(null);

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
      const response = await apiService.getById<Avaliador>('/evaluators', id);
      if (response.status) {
        setCurrentItem(response.data);
      } else {
        throw new Error(response.message || 'Avaliador não encontrado');
      }
    } catch (err) {
      setItemError(err instanceof Error ? err.message : 'Erro ao carregar avaliador');
    } finally {
      setLoadingItem(false);
    }
  };

  const handleAdd = () => {
    navigate('/dashboard/avaliadores/create');
  };

  const handleEdit = (item: Record<string, ReactNode>) => {
    navigate(`/dashboard/avaliadores/${item.id}/edit`);
  };

  const handleDelete = (item: Record<string, ReactNode>) => {
    setItemToDelete(item as Avaliador);
  };

  const confirmDelete = async () => {
    if (itemToDelete?.id) {
      await deleteItem(itemToDelete.id as string | number);
      setItemToDelete(null);
    }
  };

  const handleSubmit = async (formData: Avaliador) => {
    if (view === 'edit' && params.id) {
      await updateItem(params.id, formData);
      navigate('/dashboard/avaliadores');
    } else if (view === 'create') {
      await addItem(formData);
      navigate('/dashboard/avaliadores');
    }
  };

  const transformedData: Record<string, ReactNode>[] = data.map(item => ({
    id: item.id,
    PIN: item.PIN,
    user_id: item.user_id,
    user_name: item.user?.name || "-",
    user_email: item.user?.email || "-",
    user_active: item.user?.active ? "Sim" : "Não",
    categories_count: item.categories?.length || 0,
    assessments_count: item.assessments?.length || 0,
    created_at: item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : "-",
    updated_at: item.updated_at
  }));

  // Transform current item for detail view
  const transformedCurrentItem = currentItem ? {
    id: currentItem.id,
    PIN: currentItem.PIN,
    user_name: currentItem.user?.name || "-",
    user_email: currentItem.user?.email || "-",
    user_active: currentItem.user?.active || false,
    categories_count: currentItem.categories?.length || 0,
    assessments_count: currentItem.assessments?.length || 0,
    created_at: currentItem.created_at,
    updated_at: currentItem.updated_at
  } : null;

  // Render based on current view
  if (view === 'detail') {
    return (
      <ItemDetail
        title="Avaliador"
        description="Detalhes do avaliador da FECITEL"
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
        title="Avaliador"
        description="Gerencie os avaliadores da FECITEL"
        fields={formFields}
        initialData={view === 'edit' && params.id ? getOriginalItem(params.id) || {} : {}}
        onSubmit={handleSubmit}
        isEditing={view === 'edit'}
        loading={loading}
      />
    );
  }

  // Default: List view
  return (
    <>
      <CrudListPage
        title="Avaliadores"
        description="Gerencie os avaliadores da FECITEL"
        columns={columns}
        data={transformedData}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        error={error}
        baseEndpoint="/evaluators"
      />

      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o avaliador "{itemToDelete?.user?.name}"? Esta ação não pode ser desfeita.
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