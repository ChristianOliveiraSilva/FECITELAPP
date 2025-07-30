import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { CrudForm } from "@/components/ui/crud-form";
import { useCrud } from "@/hooks/use-crud";
import { mockAvaliacoes } from "@/data/mockData";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Avaliacao extends Record<string, unknown> {
  id?: string;
  avaliador: string;
  projeto_id: string;
  projeto: string;
  possui_respostas: string;
}

const columns = [
  { key: "avaliador", label: "Avaliador", sortable: true },
  { key: "projeto_id", label: "ID do Projeto", sortable: true },
  { key: "projeto", label: "Projeto", sortable: true },
  { key: "possui_respostas", label: "Possui Respostas", sortable: true }
];

const formFields = [
  {
    name: "avaliador",
    label: "Avaliador",
    type: "text" as const,
    required: true,
    placeholder: "Digite o nome do avaliador"
  },
  {
    name: "projeto_id",
    label: "ID do Projeto",
    type: "text" as const,
    required: true,
    placeholder: "Digite o ID do projeto"
  },
  {
    name: "projeto",
    label: "Projeto",
    type: "text" as const,
    required: true,
    placeholder: "Digite o nome do projeto"
  },
  {
    name: "possui_respostas",
    label: "Possui Respostas",
    type: "select" as const,
    required: true,
    options: [
      { value: "Sim", label: "Sim" },
      { value: "Não", label: "Não" }
    ]
  }
];

export const AvaliacoesPage = () => {
  const {
    data,
    isFormOpen,
    editingItem,
    openAddForm,
    openEditForm,
    closeForm,
    handleSubmit,
    deleteItem
  } = useCrud<Avaliacao>({ initialData: mockAvaliacoes });

  const [itemToDelete, setItemToDelete] = useState<Avaliacao | null>(null);

  const handleDelete = (item: Avaliacao) => {
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
        <h1 className="text-3xl font-bold text-ifms-green-dark">Avaliações</h1>
        <p className="text-muted-foreground">
          Gerencie as avaliações dos projetos da FECITEL
        </p>
      </div>
      
      {!isFormOpen ? (
        <DataTable
          title="Lista de Avaliações"
          columns={columns}
          data={data}
          searchPlaceholder="Buscar por avaliador, projeto..."
          onAdd={openAddForm}
          onEdit={openEditForm}
          onDelete={handleDelete}
        />
      ) : (
        <CrudForm
          title="Avaliação"
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
              Tem certeza que deseja excluir a avaliação do projeto "{itemToDelete?.projeto}"? Esta ação não pode ser desfeita.
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