import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { CrudForm } from "@/components/ui/crud-form";
import { useCrud } from "@/hooks/use-crud";
import { mockUsuarios } from "@/data/mockData";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Usuario extends Record<string, unknown> {
  id?: string;
  nome: string;
  email: string;
  ativo: string;
}

const columns = [
  { key: "nome", label: "Nome", sortable: true },
  { key: "email", label: "E-mail", sortable: true },
  { key: "ativo", label: "Ativo", sortable: true }
];

const formFields = [
  {
    name: "nome",
    label: "Nome do Usuário",
    type: "text" as const,
    required: true,
    placeholder: "Digite o nome completo do usuário"
  },
  {
    name: "email",
    label: "E-mail",
    type: "email" as const,
    required: true,
    placeholder: "Digite o e-mail do usuário"
  },
  {
    name: "ativo",
    label: "Status",
    type: "select" as const,
    required: true,
    options: [
      { value: "Sim", label: "Ativo" },
      { value: "Não", label: "Inativo" }
    ]
  }
];

export const UsuariosPage = () => {
  const {
    data,
    isFormOpen,
    editingItem,
    openAddForm,
    openEditForm,
    closeForm,
    handleSubmit,
    deleteItem
  } = useCrud<Usuario>({ initialData: mockUsuarios });

  const [itemToDelete, setItemToDelete] = useState<Usuario | null>(null);

  const handleDelete = (item: Usuario) => {
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
        <h1 className="text-3xl font-bold text-ifms-green-dark">Usuários do Sistema</h1>
        <p className="text-muted-foreground">
          Gerencie os usuários do sistema FECITEL
        </p>
      </div>
      
      {!isFormOpen ? (
        <DataTable
          title="Lista de Usuários"
          columns={columns}
          data={data}
          searchPlaceholder="Buscar por nome, email..."
          onAdd={openAddForm}
          onEdit={openEditForm}
          onDelete={handleDelete}
        />
      ) : (
        <CrudForm
          title="Usuário"
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
              Tem certeza que deseja excluir o usuário "{itemToDelete?.nome}"? Esta ação não pode ser desfeita.
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