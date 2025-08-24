import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { CrudForm } from "@/components/ui/crud-form";
import { useApiCrud } from "@/hooks/use-api-crud";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";

interface Escola extends Record<string, unknown> {
  id?: number;
  name: string;
  created_at?: string;
  updated_at?: string;
  students?: Array<{
    id: number;
    name: string;
    school_grade: string;
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

export const EscolasPage = () => {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ifms-green-dark">Escolas</h1>
        <p className="text-muted-foreground">
          Gerencie as escolas participantes da FECITEL
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
          title="Lista de Escolas"
          columns={columns}
          data={transformedData}
          searchPlaceholder="Buscar por nome da escola..."
          onAdd={openAddForm}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
          baseEndpoint="/schools"
        />
      ) : (
        <CrudForm
          title="Escola"
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
    </div>
  );
};