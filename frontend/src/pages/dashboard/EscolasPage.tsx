import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { CrudForm } from "@/components/ui/crud-form";
import { useCrud } from "@/hooks/use-crud";
import { mockEscolas } from "@/data/mockData";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Escola extends Record<string, unknown> {
  id?: string;
  nome: string;
  cidade: string;
  estado: string;
}

const columns = [
  { key: "nome", label: "Nome da Escola", sortable: true },
  { key: "cidade", label: "Cidade", sortable: true },
  { key: "estado", label: "Estado", sortable: true }
];

const formFields = [
  {
    name: "nome",
    label: "Nome da Escola",
    type: "text" as const,
    required: true,
    placeholder: "Digite o nome da escola"
  },
  {
    name: "cidade",
    label: "Cidade",
    type: "text" as const,
    required: true,
    placeholder: "Digite a cidade"
  },
  {
    name: "estado",
    label: "Estado",
    type: "text" as const,
    required: true,
    placeholder: "Digite o estado (ex: MS)"
  }
];

export const EscolasPage = () => {
  const {
    data,
    isFormOpen,
    editingItem,
    openAddForm,
    openEditForm,
    closeForm,
    handleSubmit,
    deleteItem
  } = useCrud<Escola>({ initialData: mockEscolas });

  const [itemToDelete, setItemToDelete] = useState<Escola | null>(null);

  const handleDelete = (item: Escola) => {
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
        <h1 className="text-3xl font-bold text-ifms-green-dark">Escolas</h1>
        <p className="text-muted-foreground">
          Gerencie as escolas participantes da FECITEL
        </p>
      </div>
      
      {!isFormOpen ? (
        <DataTable
          title="Lista de Escolas"
          columns={columns}
          data={data}
          searchPlaceholder="Buscar por nome, cidade..."
          onAdd={openAddForm}
          onEdit={openEditForm}
          onDelete={handleDelete}
        />
      ) : (
        <CrudForm
          title="Escola"
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
              Tem certeza que deseja excluir a escola "{itemToDelete?.nome}"? Esta ação não pode ser desfeita.
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