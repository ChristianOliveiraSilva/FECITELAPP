import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { CrudForm } from "@/components/ui/crud-form";
import { useApiCrud } from "@/hooks/use-api-crud";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface Evento extends Record<string, unknown> {
  id?: number;
  year: number;
  app_primary_color?: string;
  app_font_color?: string;
  app_logo_url?: string;
  created_at?: string;
  updated_at?: string;
}

const columns = [
  { key: "year", label: "Ano", sortable: true },
  { key: "app_primary_color", label: "Cor Primária", sortable: false },
  { key: "app_font_color", label: "Cor da Fonte", sortable: false },
  { key: "created_at", label: "Criado em", sortable: true }
];

const formFields = [
  {
    name: "year",
    label: "Ano do Evento",
    type: "number" as const,
    required: true,
    placeholder: "Digite o ano do evento"
  },
  {
    name: "app_primary_color",
    label: "Cor Primária",
    type: "color" as const,
    required: false,
    placeholder: "#56BA54"
  },
  {
    name: "app_font_color",
    label: "Cor da Fonte",
    type: "color" as const,
    required: false,
    placeholder: "#FFFFFF"
  },
  {
    name: "logo",
    label: "Logo do Evento",
    type: "file" as const,
    required: false,
    accept: "image/*",
    placeholder: "Selecione uma imagem"
  }
];

export const EventosPage = () => {
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
  } = useApiCrud<Evento>({ 
    endpoint: "/events",
    customCreateEndpoint: "/events",
    customUpdateEndpoint: "/events",
    useFormData: true
  });

  const [itemToDelete, setItemToDelete] = useState<Evento | null>(null);

  const handleDelete = (item: Evento) => {
    setItemToDelete(item);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      await deleteItem(itemToDelete);
      setItemToDelete(null);
    }
  };

  const cleanFormData = (data: Record<string, unknown>) => {
    const cleanData: Record<string, unknown> = {};
    
    Object.keys(data).forEach(key => {
      const value = data[key];
      
      if (key.startsWith('_') || typeof value === 'function') {
        return;
      }
      
      if (value instanceof File) {
        cleanData[key] = value;
      }
      else if (value !== null && value !== undefined) {
        try {
          JSON.stringify(value);
          cleanData[key] = value;
        } catch (error) {
          console.warn(`Skipping field ${key} due to circular reference`);
        }
      }
    });
    
    return cleanData;
  };

  const handleCustomSubmit = (data: Record<string, unknown>) => {
    const cleanData = cleanFormData(data);
    handleSubmit(cleanData as Evento);
  };

  const transformedData = data.map(item => ({
    ...item,
    app_primary_color: item.app_primary_color ? (
      <div className="flex items-center gap-2">
        <div 
          className="w-4 h-4 rounded border"
          style={{ backgroundColor: item.app_primary_color as string }}
        />
        <span>{item.app_primary_color}</span>
      </div>
    ) : "-",
    app_font_color: item.app_font_color ? (
      <div className="flex items-center gap-2">
        <div 
          className="w-4 h-4 rounded border"
          style={{ backgroundColor: item.app_font_color as string }}
        />
        <span>{item.app_font_color}</span>
      </div>
    ) : "-",
    created_at: item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : "-"
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ifms-green-dark">Eventos</h1>
        <p className="text-muted-foreground">
          Gerencie os eventos anuais da FECITEL e suas customizações
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
          title="Lista de Eventos"
          columns={columns}
          data={transformedData}
          searchPlaceholder="Buscar por ano do evento..."
          onAdd={openAddForm}
          onEdit={openEditForm}
          onDelete={handleDelete}
          loading={loading}
        />
      ) : (
        <CrudForm
          title="Evento"
          fields={formFields}
          initialData={editingItem || {}}
          onSubmit={handleCustomSubmit}
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
              Tem certeza que deseja excluir o evento do ano "{itemToDelete?.year}"? Esta ação não pode ser desfeita.
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