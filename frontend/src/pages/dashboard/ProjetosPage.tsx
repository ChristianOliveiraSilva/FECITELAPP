import { useParams, useNavigate } from "react-router-dom";
import { DataTable } from "@/components/ui/data-table";
import { CrudForm } from "@/components/ui/crud-form";
import { useApiCrudWithFilters } from "@/hooks/use-api-crud-with-filters";
import { apiService } from "@/lib/api";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, FileText } from "lucide-react";
import { ReactNode, useState, useEffect } from "react";
import { ItemDetail } from "@/components/ui/item-detail";
import { CrudFormPage } from "@/components/ui/crud-form-page";
import { CrudListPage } from "@/components/ui/crud-list-page";

interface Projeto extends Record<string, unknown> {
  id?: number;
  title: string;
  description?: string;
  year: number;
  category_id: number;
  projectType: number;
  external_id?: string;
  file?: string;
  created_at?: string;
  updated_at?: string;
  category?: {
    id: number;
    name: string;
  };
  students?: Array<{
    id: number;
    name: string;
    school_grade: number;
    year: number;
    school_id: number;
    school?: {
      id: number;
      name: string;
    };
  }>;
  assessments?: Array<{
    id: number;
    evaluator_id: number;
    created_at: string;
  }>;
}

const columns = [
  { 
    key: "title", 
    label: "Título", 
    sortable: true,
    filterable: true,
    filterType: 'text' as const
  },
  { 
    key: "external_id", 
    label: "ID Externo", 
    sortable: true,
    filterable: true,
    filterType: 'text' as const
  },
  { 
    key: "category_name", 
    label: "Categoria", 
    sortable: true,
    filterable: true,
    filterType: 'text' as const
  },
  { 
    key: "project_type", 
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
    key: "year", 
    label: "Ano", 
    sortable: true,
    filterable: true,
    filterType: 'number' as const
  },
  { 
    key: "students_count", 
    label: "Estudantes", 
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
    name: "title",
    label: "Título do Projeto",
    type: "text" as const,
    required: true,
    placeholder: "Digite o título do projeto"
  },
  {
    name: "description",
    label: "Descrição",
    type: "textarea" as const,
    required: false,
    placeholder: "Digite a descrição do projeto"
  },
  {
    name: "year",
    label: "Ano",
    type: "number" as const,
    required: true,
    placeholder: "Digite o ano do projeto"
  },
  {
    name: "category_id",
    label: "Categoria",
    type: "select" as const,
    required: true,
    placeholder: "Selecione a categoria",
    options: [] // Será preenchido dinamicamente
  },
  {
    name: "projectType",
    label: "Tipo de Projeto",
    type: "select" as const,
    required: true,
    placeholder: "Selecione o tipo",
    options: [
      { value: "1", label: "Científico" },
      { value: "2", label: "Tecnológico" }
    ]
  },
  {
    name: "external_id",
    label: "ID Externo",
    type: "text" as const,
    required: false,
    placeholder: "Digite o ID externo"
  },
  {
    name: "file",
    label: "Arquivo",
    type: "file" as const,
    required: true,
    accept: ".pdf,.doc,.docx"
  }
];

const detailFields = [
  { key: "id", label: "ID", type: "number" as const },
  { key: "title", label: "Título", type: "text" as const },
  { key: "description", label: "Descrição", type: "text" as const },
  { key: "external_id", label: "ID Externo", type: "text" as const },
  { key: "category_name", label: "Categoria", type: "text" as const },
  { key: "project_type", label: "Tipo", type: "text" as const },
  { key: "year", label: "Ano", type: "number" as const },
  { key: "students_count", label: "Estudantes", type: "array" as const },
  { key: "assessments_count", label: "Avaliações", type: "array" as const },
  { key: "file", label: "Arquivo", type: "text" as const },
  { key: "created_at", label: "Criado em", type: "date" as const },
  { key: "updated_at", label: "Atualizado em", type: "date" as const }
];

interface ProjetosPageProps {
  view: 'list' | 'detail' | 'create' | 'edit';
}

export const ProjetosPage = ({ view }: ProjetosPageProps) => {
  const params = useParams();
  const navigate = useNavigate();
  const [currentItem, setCurrentItem] = useState<Projeto | null>(null);
  const [loadingItem, setLoadingItem] = useState(false);
  const [itemError, setItemError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Projeto[]>([]);

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
  } = useApiCrudWithFilters<Projeto>({ endpoint: "/projects" });

  const [itemToDelete, setItemToDelete] = useState<Projeto | null>(null);

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
      const response = await apiService.getById<Projeto>('/projects', id);
      if (response.status) {
        setCurrentItem(response.data);
      } else {
        throw new Error(response.message || 'Projeto não encontrado');
      }
    } catch (err) {
      setItemError(err instanceof Error ? err.message : 'Erro ao carregar projeto');
    } finally {
      setLoadingItem(false);
    }
  };

  const handleAdd = () => {
    navigate('/dashboard/projetos/create');
  };

  const handleView = (item: Record<string, ReactNode>) => {
    navigate(`/dashboard/projetos/${item.id}`);
  };

  const handleEdit = (item: Record<string, ReactNode>) => {
    navigate(`/dashboard/projetos/${item.id}/edit`);
  };

  const handleDelete = (item: Record<string, ReactNode>) => {
    setItemToDelete(item as Projeto);
  };

  const confirmDelete = async () => {
    if (itemToDelete?.id) {
      await deleteItem(itemToDelete.id as string | number);
      setItemToDelete(null);
    }
  };

  const handleSubmit = async (formData: Projeto) => {
    if (view === 'edit' && params.id) {
      await updateItem(params.id, formData);
      navigate('/dashboard/projetos');
    } else if (view === 'create') {
      await addItem(formData);
      navigate('/dashboard/projetos');
    }
  };

  const handleSelectionChange = (selected: Record<string, ReactNode>[]) => {
    setSelectedItems(selected as Projeto[]);
  };

  const handleGerarFichasBannerSelecionados = () => {
    // Implementar geração de fichas de banner
    console.log('Gerar fichas para:', selectedItems);
  };

  const transformedData: Record<string, ReactNode>[] = data.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    year: item.year,
    category_id: item.category_id,
    projectType: item.projectType,
    external_id: item.external_id,
    file: item.file,
    category_name: item.category?.name || "-",
    project_type: item.projectType === 1 ? "Científico" : "Tecnológico",
    students_count: item.students?.length || 0,
    assessments_count: item.assessments?.length || 0,
    created_at: item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : "-",
    updated_at: item.updated_at
  }));

  // Transform current item for detail view
  const transformedCurrentItem = currentItem ? {
    id: currentItem.id,
    title: currentItem.title,
    description: currentItem.description || "-",
    external_id: currentItem.external_id || "-",
    category_name: currentItem.category?.name || "-",
    project_type: currentItem.projectType === 1 ? "Científico" : "Tecnológico",
    year: currentItem.year,
    students_count: currentItem.students?.length || 0,
    assessments_count: currentItem.assessments?.length || 0,
    file: currentItem.file || "-",
    created_at: currentItem.created_at,
    updated_at: currentItem.updated_at
  } : null;

  // Render based on current view
  if (view === 'detail') {
    return (
      <ItemDetail
        title="Projeto"
        description="Detalhes do projeto inscrito na FECITEL"
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
        title="Projeto"
        description="Gerencie os projetos inscritos na FECITEL"
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
        title="Projetos"
        description="Gerencie os projetos inscritos na FECITEL"
        columns={columns}
        data={transformedData}
        onAdd={handleAdd}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
        error={error}
        baseEndpoint="/projects"
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
              Tem certeza que deseja excluir o projeto "{itemToDelete?.title}"? Esta ação não pode ser desfeita.
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