import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { CrudForm } from "@/components/ui/crud-form";
import { useApiCrud } from "@/hooks/use-api-crud";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface Categoria extends Record<string, unknown> {
  id?: number;
  name: string;
  created_at?: string;
  updated_at?: string;
  projects?: Array<{
    id: number;
    title: string;
    year: number;
  }>;
  evaluators?: Array<{
    id: number;
    PIN: string;
  }>;
}

const columns = [
  { key: "name", label: "Nome da Categoria", sortable: true },
  { key: "projects_count", label: "Projetos", sortable: false },
  { key: "evaluators_count", label: "Avaliadores", sortable: false },
  { key: "created_at", label: "Criado em", sortable: true }
];

const formFields = [
  {
    name: "name",
    label: "Nome da Categoria",
    type: "text" as const,
    required: true,
    placeholder: "Digite o nome da categoria"
  }
];

export const AreasPage = () => {
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
  } = useApiCrud<Categoria>({ endpoint: "/categories" });

  const [itemToDelete, setItemToDelete] = useState<Categoria | null>(null);

  const handleDelete = (item: Categoria) => {
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
    projects_count: item.projects?.length || 0,
    evaluators_count: item.evaluators?.length || 0,
    created_at: item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : "-"
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ifms-green-dark">Categorias</h1>
        <p className="text-muted-foreground">
          Gerencie as categorias de projetos da FECITEL
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
          title="Lista de Categorias"
          columns={columns}
          data={transformedData}
          searchPlaceholder="Buscar por nome da categoria..."
          onAdd={openAddForm}
          onEdit={openEditForm}
          onDelete={handleDelete}
          loading={loading}
        />
      ) : (
        <CrudForm
          title="Categoria"
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
              Tem certeza que deseja excluir a categoria "{itemToDelete?.name}"? Esta ação não pode ser desfeita.
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