import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { CrudForm } from "@/components/ui/crud-form";
import { useApiCrud } from "@/hooks/use-api-crud";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface Projeto extends Record<string, unknown> {
  id?: number;
  title: string;
  description?: string;
  year: number;
  category_id: number;
  projectType: number;
  external_id?: string;
  created_at?: string;
  updated_at?: string;
  category?: {
    id: number;
    name: string;
  };
  students?: Array<{
    id: number;
    name: string;
    school_grade: string;
  }>;
}

const columns = [
  { key: "title", label: "Título", sortable: true },
  { key: "year", label: "Ano", sortable: true },
  { key: "category_name", label: "Categoria", sortable: true },
  { key: "projectType", label: "Tipo", sortable: true },
  { key: "students_count", label: "Estudantes", sortable: false },
  { key: "created_at", label: "Criado em", sortable: true }
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
    placeholder: "Digite o ano (ex: 2024)"
  },
  {
    name: "category_id",
    label: "Categoria",
    type: "select" as const,
    required: true,
    placeholder: "Selecione a categoria",
    options: [] // Will be populated dynamically
  },
  {
    name: "projectType",
    label: "Tipo de Projeto",
    type: "select" as const,
    required: true,
    options: [
      { value: 1, label: "Científico" },
      { value: 2, label: "Tecnológico" }
    ]
  },
  {
    name: "external_id",
    label: "ID Externo",
    type: "text" as const,
    required: false,
    placeholder: "Digite o ID externo (opcional)"
  }
];

export const ProjetosPage = () => {
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
  } = useApiCrud<Projeto>({ endpoint: "/projects" });

  const [itemToDelete, setItemToDelete] = useState<Projeto | null>(null);

  const handleDelete = (item: Projeto) => {
    setItemToDelete(item);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      await deleteItem(itemToDelete);
      setItemToDelete(null);
    }
  };

  // Transform data for display
  const transformedData = data.map(item => ({
    ...item,
    category_name: item.category?.name || "-",
    students_count: item.students?.length || 0,
    projectType: item.projectType === 1 ? "Científico" : "Tecnológico",
    created_at: item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : "-"
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ifms-green-dark">Projetos</h1>
        <p className="text-muted-foreground">
          Gerencie os projetos inscritos na FECITEL
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {loading && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Carregando...</span>
        </div>
      )}
      
      {!isFormOpen ? (
        <DataTable
          title="Lista de Projetos"
          columns={columns}
          data={transformedData}
          searchPlaceholder="Buscar por título, categoria..."
          onAdd={openAddForm}
          onEdit={openEditForm}
          onDelete={handleDelete}
          loading={loading}
        />
      ) : (
        <CrudForm
          title="Projeto"
          fields={formFields}
          initialData={editingItem || {}}
          onSubmit={handleSubmit}
          onCancel={closeForm}
          isEditing={!!editingItem}
          loading={loading}
        />
      )}

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
    </div>
  );
};