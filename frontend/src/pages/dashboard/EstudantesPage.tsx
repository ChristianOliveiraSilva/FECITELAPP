import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { CrudForm } from "@/components/ui/crud-form";
import { useApiCrud } from "@/hooks/use-api-crud";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";

interface Estudante extends Record<string, unknown> {
  id?: number;
  name: string;
  email?: string;
  school_grade: string;
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
      { value: "1º ano", label: "1º ano" },
      { value: "2º ano", label: "2º ano" },
      { value: "3º ano", label: "3º ano" },
      { value: "4º ano", label: "4º ano" },
      { value: "5º ano", label: "5º ano" },
      { value: "6º ano", label: "6º ano" },
      { value: "7º ano", label: "7º ano" },
      { value: "8º ano", label: "8º ano" },
      { value: "9º ano", label: "9º ano" },
      { value: "1º ano EM", label: "1º ano EM" },
      { value: "2º ano EM", label: "2º ano EM" },
      { value: "3º ano EM", label: "3º ano EM" }
    ]
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
    placeholder: "Digite o nome completo do estudante"
  },
  {
    name: "email",
    label: "E-mail",
    type: "email" as const,
    required: false,
    placeholder: "Digite o e-mail do estudante (opcional)"
  },
  {
    name: "school_grade",
    label: "Grau de Escolaridade",
    type: "select" as const,
    required: true,
    options: [
      { value: "Ensino Fundamental", label: "Ensino Fundamental" },
      { value: "Ensino Médio", label: "Ensino Médio" }
    ]
  },
  {
    name: "school_id",
    label: "Escola",
    type: "select" as const,
    required: true,
    placeholder: "Selecione a escola",
    options: []
  }
];

export const EstudantesPage = () => {
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
    email: item.email || "-",
    school_grade: item.school_grade,
    school_id: item.school_id,
    school_name: item.school?.name || "-",
    projects_count: item.projects?.length || 0,
    created_at: item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : "-",
    updated_at: item.updated_at
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ifms-green-dark">Estudantes</h1>
        <p className="text-muted-foreground">
          Gerencie os estudantes participantes da FECITEL
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
          title="Lista de Estudantes"
          columns={columns}
          data={transformedData}
          searchPlaceholder="Buscar por nome, escola..."
          onAdd={openAddForm}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
          baseEndpoint="/students"
        />
      ) : (
        <CrudForm
          title="Estudante"
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
    </div>
  );
};