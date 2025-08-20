import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { CrudForm } from "@/components/ui/crud-form";
import { useApiCrud } from "@/hooks/use-api-crud";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";

interface Pergunta extends Record<string, unknown> {
  id?: number;
  scientific_text: string;
  technological_text: string;
  type: number;
  number_alternatives: number;
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
    sortable: false, 
    filterable: true, 
    filterType: 'text' as const 
  },
  { 
    key: "technological_text", 
    label: "Texto Tecnológico", 
    sortable: false, 
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
    placeholder: "Digite o texto da pergunta para projetos científicos"
  },
  {
    name: "technological_text",
    label: "Texto Tecnológico",
    type: "textarea" as const,
    required: true,
    placeholder: "Digite o texto da pergunta para projetos tecnológicos"
  },
  {
    name: "type",
    label: "Tipo de Pergunta",
    type: "select" as const,
    required: true,
    options: [
      { value: "1", label: "Múltipla Escolha" },
      { value: "2", label: "Texto" },
    ]
  },
  {
    name: "number_alternatives",
    label: "Número de Alternativas",
    type: "number" as const,
    required: true,
    placeholder: "Digite o número de alternativas"
  }
];

export const PerguntasPage = () => {
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
  } = useApiCrud<Pergunta>({ endpoint: "/questions" });

  const [itemToDelete, setItemToDelete] = useState<Pergunta | null>(null);

  const handleEdit = (item: Record<string, ReactNode>) => {
    openEditForm(item as Pergunta);
  };

  const handleDelete = (item: Record<string, ReactNode>) => {
    setItemToDelete(item as Pergunta);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      await deleteItem(itemToDelete);
      setItemToDelete(null);
    }
  };

  const transformedData: Record<string, ReactNode>[] = data.map(item => ({
    id: item.id,
    scientific_text: item.scientific_text,
    technological_text: item.technological_text,
    type: item.type === 1 ? "Científico" : "Tecnológico",
    number_alternatives: item.number_alternatives,
    responses_count: item.responses?.length || 0,
    awards_count: item.awards?.length || 0,
    created_at: item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : "-",
    updated_at: item.updated_at
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ifms-green-dark">Perguntas</h1>
        <p className="text-muted-foreground">
          Gerencie as perguntas de avaliação da FECITEL
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
          title="Lista de Perguntas"
          columns={columns}
          data={transformedData}
          searchPlaceholder="Buscar por texto da pergunta..."
          onAdd={openAddForm}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
          baseEndpoint="/questions"
        />
      ) : (
        <CrudForm
          title="Pergunta"
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
    </div>
  );
};