import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { CrudForm } from "@/components/ui/crud-form";
import { useCrud } from "@/hooks/use-crud";
import { mockAvaliadores } from "@/data/mockData";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Avaliador extends Record<string, unknown> {
  id?: string;
  nome: string;
  pin: string;
  quantidade_projetos: number;
  area: string;
}

const columns = [
  { key: "nome", label: "Nome", sortable: true },
  { key: "pin", label: "PIN", sortable: false },
  { key: "quantidade_projetos", label: "Quantidade de projetos", sortable: true },
  { key: "area", label: "Área", sortable: true }
];

const formFields = [
  {
    name: "nome",
    label: "Nome do Avaliador",
    type: "text" as const,
    required: true,
    placeholder: "Digite o nome completo do avaliador"
  },
  {
    name: "pin",
    label: "PIN",
    type: "text" as const,
    required: true,
    placeholder: "Digite o PIN de acesso"
  },
  {
    name: "quantidade_projetos",
    label: "Quantidade de Projetos",
    type: "number" as const,
    required: true,
    placeholder: "Digite a quantidade de projetos"
  },
  {
    name: "area",
    label: "Área de Atuação",
    type: "text" as const,
    required: true,
    placeholder: "Digite a área de atuação"
  }
];

export const AvaliadoresPage = () => {
  const {
    data,
    isFormOpen,
    editingItem,
    openAddForm,
    openEditForm,
    closeForm,
    handleSubmit,
    deleteItem
  } = useCrud<Avaliador>({ initialData: mockAvaliadores });

  const [itemToDelete, setItemToDelete] = useState<Avaliador | null>(null);

  const handleDelete = (item: Avaliador) => {
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
        <h1 className="text-3xl font-bold text-ifms-green-dark">Avaliadores</h1>
        <p className="text-muted-foreground">
          Gerencie os avaliadores da FECITEL
        </p>
      </div>
      
      {!isFormOpen ? (
        <DataTable
          title="Lista de Avaliadores"
          columns={columns}
          data={data}
          searchPlaceholder="Buscar por nome, área..."
          onAdd={openAddForm}
          onEdit={openEditForm}
          onDelete={handleDelete}
        />
      ) : (
        <CrudForm
          title="Avaliador"
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
              Tem certeza que deseja excluir o avaliador "{itemToDelete?.nome}"? Esta ação não pode ser desfeita.
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