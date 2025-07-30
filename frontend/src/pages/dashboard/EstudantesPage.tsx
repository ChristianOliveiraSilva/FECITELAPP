import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { CrudForm } from "@/components/ui/crud-form";
import { useCrud } from "@/hooks/use-crud";
import { mockEstudantes } from "@/data/mockData";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Estudante extends Record<string, unknown> {
  id?: string;
  nome: string;
  email: string;
  grau_escolaridade: string;
  escola: string;
}

const columns = [
  { key: "nome", label: "Nome", sortable: true },
  { key: "email", label: "E-mail", sortable: true },
  { key: "grau_escolaridade", label: "Grau de escolaridade", sortable: true },
  { key: "escola", label: "Escola", sortable: true }
];

const formFields = [
  {
    name: "nome",
    label: "Nome do Estudante",
    type: "text" as const,
    required: true,
    placeholder: "Digite o nome completo do estudante"
  },
  {
    name: "email",
    label: "E-mail",
    type: "email" as const,
    required: true,
    placeholder: "Digite o e-mail do estudante"
  },
  {
    name: "grau_escolaridade",
    label: "Grau de Escolaridade",
    type: "select" as const,
    required: true,
    options: [
      { value: "Ensino Fundamental", label: "Ensino Fundamental" },
      { value: "Ensino Médio", label: "Ensino Médio" },
      { value: "Ensino Superior", label: "Ensino Superior" }
    ]
  },
  {
    name: "escola",
    label: "Escola",
    type: "text" as const,
    required: true,
    placeholder: "Digite o nome da escola"
  }
];

export const EstudantesPage = () => {
  const {
    data,
    isFormOpen,
    editingItem,
    openAddForm,
    openEditForm,
    closeForm,
    handleSubmit,
    deleteItem
  } = useCrud<Estudante>({ initialData: mockEstudantes });

  const [itemToDelete, setItemToDelete] = useState<Estudante | null>(null);

  const handleDelete = (item: Estudante) => {
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
        <h1 className="text-3xl font-bold text-ifms-green-dark">Estudantes</h1>
        <p className="text-muted-foreground">
          Gerencie os estudantes participantes da FECITEL
        </p>
      </div>
      
      {!isFormOpen ? (
        <DataTable
          title="Lista de Estudantes"
          columns={columns}
          data={data}
          searchPlaceholder="Buscar por nome, email, escola..."
          onAdd={openAddForm}
          onEdit={openEditForm}
          onDelete={handleDelete}
        />
      ) : (
        <CrudForm
          title="Estudante"
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
              Tem certeza que deseja excluir o estudante "{itemToDelete?.nome}"? Esta ação não pode ser desfeita.
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