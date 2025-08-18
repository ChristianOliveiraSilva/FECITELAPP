import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { CrudForm } from "@/components/ui/crud-form";
import { useApiCrud } from "@/hooks/use-api-crud";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface Usuario extends Record<string, unknown> {
  id?: number;
  name: string;
  email: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

const columns = [
  { key: "name", label: "Nome", sortable: true },
  { key: "email", label: "E-mail", sortable: true },
  { key: "active", label: "Ativo", sortable: true },
  { key: "created_at", label: "Criado em", sortable: true }
];

const formFields = [
  {
    name: "name",
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
    name: "password",
    label: "Senha",
    type: "password" as const,
    required: false,
    placeholder: "Digite a senha (deixe em branco para manter a atual)"
  },
  {
    name: "active",
    label: "Status",
    type: "select" as const,
    required: true,
    options: [
      { value: true, label: "Ativo" },
      { value: false, label: "Inativo" }
    ]
  }
];

export const UsuariosPage = () => {
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
  } = useApiCrud<Usuario>({ endpoint: "/users" });

  const [itemToDelete, setItemToDelete] = useState<Usuario | null>(null);

  const handleDelete = (item: Usuario) => {
    setItemToDelete(item);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      await deleteItem(itemToDelete);
      setItemToDelete(null);
    }
  };

  const transformedData = data.map(item => ({
    ...item,
    active: item.active ? "Sim" : "Não",
    created_at: item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : "-"
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ifms-green-dark">Usuários do Sistema</h1>
        <p className="text-muted-foreground">
          Gerencie os usuários do sistema FECITEL
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
          title="Lista de Usuários"
          columns={columns}
          data={transformedData}
          searchPlaceholder="Buscar por nome, email..."
          onAdd={openAddForm}
          onEdit={openEditForm}
          onDelete={handleDelete}
          loading={loading}
        />
      ) : (
        <CrudForm
          title="Usuário"
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
              Tem certeza que deseja excluir o usuário "{itemToDelete?.name}"? Esta ação não pode ser desfeita.
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