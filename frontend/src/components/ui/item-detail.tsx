import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit, ArrowLeft, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ItemDetailProps {
  title: string;
  description?: string;
  data: Record<string, unknown>;
  fields: Array<{
    key: string;
    label: string;
    type?: 'text' | 'date' | 'number' | 'boolean' | 'array' | 'object';
    format?: (value: unknown) => string;
  }>;
  onEdit?: () => void;
  onDelete?: () => void;
  onBack?: () => void;
  loading?: boolean;
  error?: string;
}

export const ItemDetail = ({
  title,
  description,
  data,
  fields,
  onEdit,
  onDelete,
  onBack,
  loading = false,
  error
}: ItemDetailProps) => {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      navigate('edit');
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    setShowDeleteDialog(false);
  };

  const formatValue = (value: unknown, field: ItemDetailProps['fields'][0]) => {
    if (field.format) {
      return field.format(value);
    }

    if (value === null || value === undefined) {
      return "-";
    }

    switch (field.type) {
      case 'date':
        return new Date(value as string | number | Date).toLocaleDateString('pt-BR');
      case 'boolean':
        return value ? "Sim" : "Não";
      case 'array':
        if (Array.isArray(value)) {
          if (value.length === 0) return "Nenhum";

          if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null && 'name' in value[0]) {
            return value.map((item: any) => item.name).join(', ');
          }

          if (typeof value[0] === 'string') {
            return value.join(', ');
          }
          
          return value.length;
        }
        return 0;
      case 'object':
        return typeof value === 'object' ? JSON.stringify(value) : value;
      default:
        return String(value);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Erro ao carregar dados</h2>
          <p className="text-muted-foreground mt-2">{error}</p>
          <Button onClick={handleBack} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={handleBack} className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-ifms-green-dark">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-2">{description}</p>
          )}
        </div>
        
        <div className="flex gap-2">
          {onEdit && (
            <Button onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes</CardTitle>
          <CardDescription>Informações completas do item</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => {
            const value = data[field.key];
            const formattedValue = formatValue(value, field);
            
            return (
              <div key={field.key}>
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-sm text-muted-foreground">
                    {field.label}
                  </span>
                  <div className="text-right">
                    <span className="text-sm">{formattedValue as React.ReactNode}</span>
                  </div>
                </div>
                {index < fields.length - 1 && <Separator />}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
