import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { CrudForm } from "@/components/ui/crud-form";
import { useCrud } from "@/hooks/use-crud";
import { mockPremiacoes } from "@/data/mockData";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Premiacao extends Record<string, unknown> {
  id?: string;
  nome: string;
  grau_escolaridade: string;
  total_colocacoes: number;
  usar_graus_escolaridade: string;
  usar_areas: string;
}

const columns = [
  { key: "nome", label: "Nome", sortable: true },
  { key: "grau_escolaridade", label: "Grau de Escolaridade", sortable: true },
  { key: "total_colocacoes", label: "Total de colocações", sortable: true },
  { key: "usar_graus_escolaridade", label: "Usar Graus de escolaridade?", sortable: true },
  { key: "usar_areas", label: "Usar Áreas?", sortable: true }
];

const formFields = [
  {
    name: "nome",
    label: "Nome da Premiação",
    type: "text" as const,
    required: true,
    placeholder: "Digite o nome da premiação"
  },
  {
    name: "grau_escolaridade",
    label: "Grau de Escolaridade",
    type: "select" as const,
    required: true,
    options: [
      { value: "Ensino Fundamental", label: "Ensino Fundamental" },
      { value: "Ensino Médio", label: "Ensino Médio" },
      { value: "Ensino Superior", label: "Ensino Superior" },
      { value: "Todos", label: "Todos" }
    ]
  },
  {
    name: "total_colocacoes",
    label: "Total de Colocações",
    type: "number" as const,
    required: true,
    placeholder: "Digite o número total de colocações"
  },
  {
    name: "usar_graus_escolaridade",
    label: "Usar Graus de Escolaridade?",
    type: "select" as const,
    required: true,
    options: [
      { value: "Sim", label: "Sim" },
      { value: "Não", label: "Não" }
    ]
  },
  {
    name: "usar_areas",
    label: "Usar Áreas?",
    type: "select" as const,
    required: true,
    options: [
      { value: "Sim", label: "Sim" },
      { value: "Não", label: "Não" }
    ]
  }
];

export const PremiacoesPage = () => {
  const {
    data,
    isFormOpen,
    editingItem,
    openAddForm,
    openEditForm,
    closeForm,
    handleSubmit,
    deleteItem
  } = useCrud<Premiacao>({ initialData: mockPremiacoes });

  const [itemToDelete, setItemToDelete] = useState<Premiacao | null>(null);

  const handleDelete = (item: Premiacao) => {
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
        <h1 className="text-3xl font-bold text-ifms-green-dark">Premiações</h1>
        <p className="text-muted-foreground">
          Gerencie as premiações da FECITEL
        </p>
      </div>
      
      {!isFormOpen ? (
        <DataTable
          title="Lista de Premiações"
          columns={columns}
          data={data}
          searchPlaceholder="Buscar por nome, grau de escolaridade..."
          onAdd={openAddForm}
          onEdit={openEditForm}
          onDelete={handleDelete}
        />
      ) : (
        <CrudForm
          title="Premiação"
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
              Tem certeza que deseja excluir a premiação "{itemToDelete?.nome}"? Esta ação não pode ser desfeita.
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