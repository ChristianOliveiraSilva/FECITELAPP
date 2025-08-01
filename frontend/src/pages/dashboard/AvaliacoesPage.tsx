import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { CrudForm } from "@/components/ui/crud-form";
import { useApiCrud } from "@/hooks/use-api-crud";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

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
  };
  responses?: Array<{
    id: number;
    question_id: number;
    response: string;
    score: number;
  }>;
}

const columns = [
  { key: "evaluator_name", label: "Avaliador", sortable: true },
  { key: "project_title", label: "Projeto", sortable: true },
  { key: "project_year", label: "Ano", sortable: true },
  { key: "has_responses", label: "Possui Respostas", sortable: true },
  { key: "created_at", label: "Criado em", sortable: true }
];

const formFields = [
  {
    name: "evaluator_id",
    label: "Avaliador",
    type: "select" as const,
    required: true,
    placeholder: "Selecione o avaliador",
    options: []
  },
  {
    name: "project_id",
    label: "Projeto",
    type: "select" as const,
    required: true,
    placeholder: "Selecione o projeto",
    options: []
  }
];

export const AvaliacoesPage = () => {
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

  const handleDelete = (item: Avaliacao) => {
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
    evaluator_name: item.evaluator?.PIN || `Avaliador ${item.evaluator_id}`,
    project_title: item.project?.title || `Projeto ${item.project_id}`,
    project_year: item.project?.year || "-",
    has_responses: item.responses && item.responses.length > 0 ? "Sim" : "Não",
    created_at: item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : "-"
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ifms-green-dark">Avaliações</h1>
        <p className="text-muted-foreground">
          Gerencie as avaliações dos projetos da FECITEL
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
          title="Lista de Avaliações"
          columns={columns}
          data={transformedData}
          searchPlaceholder="Buscar por avaliador, projeto..."
          onAdd={openAddForm}
          onEdit={openEditForm}
          onDelete={handleDelete}
          loading={loading}
        />
      ) : (
        <CrudForm
          title="Avaliação"
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
    </div>
  );
};