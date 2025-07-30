import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { CrudForm } from "@/components/ui/crud-form";
import { useCrud } from "@/hooks/use-crud";
import { mockAreas } from "@/data/mockData";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Area extends Record<string, unknown> {
  id?: string;
  nome: string;
}

const columns = [
  { key: "nome", label: "Nome", sortable: true }
];

const formFields = [
  {
    name: "nome",
    label: "Nome da Área",
    type: "text" as const,
    required: true,
    placeholder: "Digite o nome da área de conhecimento"
  }
];

export const AreasPage = () => {
  const {
    data,
    isFormOpen,
    editingItem,
    openAddForm,
    openEditForm,
    closeForm,
    handleSubmit,
    deleteItem
  } = useCrud<Area>({ initialData: mockAreas });

  const [itemToDelete, setItemToDelete] = useState<Area | null>(null);

  const handleDelete = (item: Area) => {
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
        <h1 className="text-3xl font-bold text-ifms-green-dark">Áreas</h1>
        <p className="text-muted-foreground">
          Gerencie as áreas de conhecimento dos projetos
        </p>
      </div>
      
      {!isFormOpen ? (
        <DataTable
          title="Lista de Áreas"
          columns={columns}
          data={data}
          searchPlaceholder="Buscar por nome da área..."
          onAdd={openAddForm}
          onEdit={openEditForm}
          onDelete={handleDelete}
        />
      ) : (
        <CrudForm
          title="Área"
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
              Tem certeza que deseja excluir a área "{itemToDelete?.nome}"? Esta ação não pode ser desfeita.
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