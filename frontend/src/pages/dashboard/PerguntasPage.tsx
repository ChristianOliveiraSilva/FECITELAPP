import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { CrudForm } from "@/components/ui/crud-form";
import { useCrud } from "@/hooks/use-crud";
import { mockPerguntas } from "@/data/mockData";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Pergunta extends Record<string, unknown> {
  id?: string;
  texto_cientifico: string;
  texto_tecnologico: string;
  tipo: string;
}

const columns = [
  { key: "texto_cientifico", label: "Texto Científico", sortable: false },
  { key: "texto_tecnologico", label: "Texto Tecnológico", sortable: false },
  { key: "tipo", label: "Tipo", sortable: true }
];

const formFields = [
  {
    name: "texto_cientifico",
    label: "Texto Científico",
    type: "textarea" as const,
    required: true,
    placeholder: "Digite o texto da pergunta para projetos científicos"
  },
  {
    name: "texto_tecnologico",
    label: "Texto Tecnológico",
    type: "textarea" as const,
    required: true,
    placeholder: "Digite o texto da pergunta para projetos tecnológicos"
  },
  {
    name: "tipo",
    label: "Tipo de Pergunta",
    type: "select" as const,
    required: true,
    options: [
      { value: "Qualitativa", label: "Qualitativa" },
      { value: "Quantitativa", label: "Quantitativa" },
      { value: "Mista", label: "Mista" }
    ]
  }
];

export const PerguntasPage = () => {
  const {
    data,
    isFormOpen,
    editingItem,
    openAddForm,
    openEditForm,
    closeForm,
    handleSubmit,
    deleteItem
  } = useCrud<Pergunta>({ initialData: mockPerguntas });

  const [itemToDelete, setItemToDelete] = useState<Pergunta | null>(null);

  const handleDelete = (item: Pergunta) => {
    setItemToDelete(item);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteItem(itemToDelete);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ifms-green-dark">Perguntas</h1>
        <p className="text-muted-foreground">
          Gerencie as perguntas de avaliação da FECITEL
        </p>
      </div>
      
      {!isFormOpen ? (
        <DataTable
          title="Lista de Perguntas"
          columns={columns}
          data={data}
          searchPlaceholder="Buscar por texto, tipo..."
          onAdd={openAddForm}
          onEdit={openEditForm}
          onDelete={handleDelete}
        />
      ) : (
        <CrudForm
          title="Pergunta"
          fields={formFields}
          initialData={editingItem || {}}
          onSubmit={handleSubmit}
          onCancel={closeForm}
          isEditing={!!editingItem}
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