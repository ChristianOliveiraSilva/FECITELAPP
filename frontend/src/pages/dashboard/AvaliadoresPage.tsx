import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { CrudForm } from "@/components/ui/crud-form";
import { useApiCrud } from "@/hooks/use-api-crud";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, ClipboardList } from "lucide-react";

interface Avaliador extends Record<string, unknown> {
  id?: number;
  user_id: number;
  PIN: string;
  created_at?: string;
  updated_at?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    active: boolean;
  };
  assessments?: Array<{
    id: number;
    project_id: number;
    created_at: string;
  }>;
  categories?: Array<{
    id: number;
    name: string;
  }>;
}

const columns = [
  { key: "user_name", label: "Nome", sortable: true },
  { key: "user_email", label: "E-mail", sortable: true },
  { key: "PIN", label: "PIN", sortable: true },
  { key: "assessments_count", label: "Avaliações", sortable: false },
  { key: "categories_count", label: "Categorias", sortable: false },
  { key: "created_at", label: "Criado em", sortable: true }
];

const formFields = [
  {
    name: "user_id",
    label: "Usuário",
    type: "select" as const,
    required: true,
    placeholder: "Selecione o usuário",
    options: []
  },
  {
    name: "PIN",
    label: "PIN",
    type: "text" as const,
    required: true,
    placeholder: "Digite o PIN (4 dígitos)"
  }
];

export const AvaliadoresPage = () => {
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
  } = useApiCrud<Avaliador>({ endpoint: "/evaluators" });

  const [itemToDelete, setItemToDelete] = useState<Avaliador | null>(null);

  const handleDelete = (item: Avaliador) => {
    setItemToDelete(item);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      await deleteItem(itemToDelete);
      setItemToDelete(null);
    }
  };

  const handleGerarCertificado = () => {
    console.log("Gerando certificado dos avaliadores...");
  };

  const handleGerarCheckIn = () => {
    console.log("Gerando folha de check-in dos avaliadores...");
  };

  const [selectedAvaliadores, setSelectedAvaliadores] = useState<Avaliador[]>([]);

  const handleSelectionChange = (selectedItems: Avaliador[]) => {
    setSelectedAvaliadores(selectedItems);
  };

  const handleGerarCertificadoSelecionados = () => {
    console.log("Gerando certificado para:", selectedAvaliadores.length, "avaliadores selecionados");
  };

  const handleGerarCheckInSelecionados = () => {
    console.log("Gerando check-in para:", selectedAvaliadores.length, "avaliadores selecionados");
  };

  const transformedData = data.map(item => ({
    ...item,
    user_name: item.user?.name || "-",
    user_email: item.user?.email || "-",
    assessments_count: item.assessments?.length || 0,
    categories_count: item.categories?.length || 0,
    created_at: item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : "-"
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ifms-green-dark">Avaliadores</h1>
        <p className="text-muted-foreground">
          Gerencie os avaliadores do sistema FECITEL
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
          title="Lista de Avaliadores"
          columns={columns}
          data={transformedData}
          searchPlaceholder="Buscar por nome, email, PIN..."
          onAdd={openAddForm}
          onEdit={openEditForm}
          onDelete={handleDelete}
          loading={loading}
          selectable={true}
          onSelectionChange={handleSelectionChange}
          pageSize={15}
          pageSizeOptions={[10, 15, 25, 50, 100]}
          actionButtons={
            <>
              <Button 
                onClick={handleGerarCertificadoSelecionados}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
              >
                <FileText className="h-4 w-4" />
                Certificado
              </Button>
              <Button 
                onClick={handleGerarCheckInSelecionados}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
              >
                <ClipboardList className="h-4 w-4" />
                Check-in
              </Button>
            </>
          }
        />
      ) : (
        <CrudForm
          title="Avaliador"
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
              Tem certeza que deseja excluir o avaliador "{itemToDelete?.user?.name}"? Esta ação não pode ser desfeita.
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