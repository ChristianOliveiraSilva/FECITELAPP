import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { CrudForm } from "@/components/ui/crud-form";
import { useCrud } from "@/hooks/use-crud";
import { mockProjetos } from "@/data/mockData";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Projeto extends Record<string, unknown> {
  id?: string;
  id_projeto: string;
  titulo: string;
  ano: string;
  estudantes: string;
  area: string;
  tipo_projeto: string;
}

const columns = [
  { key: "id_projeto", label: "ID do projeto", sortable: true },
  { key: "titulo", label: "Título", sortable: true },
  { key: "ano", label: "Ano", sortable: true },
  { key: "estudantes", label: "Estudantes", sortable: false },
  { key: "area", label: "Área", sortable: true },
  { key: "tipo_projeto", label: "Tipo de projeto", sortable: true }
];

const formFields = [
  {
    name: "id_projeto",
    label: "ID do Projeto",
    type: "text" as const,
    required: true,
    placeholder: "Digite o ID do projeto"
  },
  {
    name: "titulo",
    label: "Título do Projeto",
    type: "text" as const,
    required: true,
    placeholder: "Digite o título do projeto"
  },
  {
    name: "ano",
    label: "Ano",
    type: "text" as const,
    required: true,
    placeholder: "Digite o ano (ex: 2024)"
  },
  {
    name: "estudantes",
    label: "Estudantes",
    type: "text" as const,
    required: true,
    placeholder: "Digite os nomes dos estudantes (separados por vírgula)"
  },
  {
    name: "area",
    label: "Área",
    type: "text" as const,
    required: true,
    placeholder: "Digite a área do projeto"
  },
  {
    name: "tipo_projeto",
    label: "Tipo de Projeto",
    type: "select" as const,
    required: true,
    options: [
      { value: "Científico", label: "Científico" },
      { value: "Tecnológico", label: "Tecnológico" }
    ]
  }
];

export const ProjetosPage = () => {
  const {
    data,
    isFormOpen,
    editingItem,
    openAddForm,
    openEditForm,
    closeForm,
    handleSubmit,
    deleteItem
  } = useCrud<Projeto>({ initialData: mockProjetos });

  const [itemToDelete, setItemToDelete] = useState<Projeto | null>(null);

  const handleDelete = (item: Projeto) => {
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
        <h1 className="text-3xl font-bold text-ifms-green-dark">Projetos</h1>
        <p className="text-muted-foreground">
          Gerencie os projetos inscritos na FECITEL
        </p>
      </div>
      
      {!isFormOpen ? (
        <DataTable
          title="Lista de Projetos"
          columns={columns}
          data={data}
          searchPlaceholder="Buscar por título, estudante, área..."
          onAdd={openAddForm}
          onEdit={openEditForm}
          onDelete={handleDelete}
        />
      ) : (
        <CrudForm
          title="Projeto"
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
              Tem certeza que deseja excluir o projeto "{itemToDelete?.titulo}"? Esta ação não pode ser desfeita.
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