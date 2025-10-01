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
    type?: 'text' | 'date' | 'number' | 'boolean' | 'array' | 'object' | 'image';
    format?: (value: unknown) => string;
    attributeType?: string;
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

          if (typeof value[0] === 'object' && value[0] !== null && 'name' in value[0]) {
            return value.map((item: { name: string }) => item.name).join(', ');
          }

          if (typeof value[0] === 'string') {
            return value.join(', ');
          }
          
          return value.length;
        }
        return 0;
      case 'object':
        return typeof value === 'object' ? JSON.stringify(value) : value;
      case 'image':
        return value ? <img src={`${import.meta.env.VITE_API_URL}${value as string}`} alt="Imagem" className="w-8 h-8 object-contain" /> : "-";
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

  // Separa campos normais de campos do tipo array
  const regularFields = fields.filter(field => field.type !== 'array');
  const arrayFields = fields.filter(field => field.type === 'array');

  const renderArrayCard = (field: ItemDetailProps['fields'][0]) => {
    const value = data[field.key];
    
    if (!Array.isArray(value) || value.length === 0) {
      return (
        <Card key={field.key}>
          <CardHeader>
            <CardTitle>{field.label}</CardTitle>
            <CardDescription>Nenhum item encontrado</CardDescription>
          </CardHeader>
        </Card>
      );
    }

    // Função para obter o valor do campo especificado
    const getFieldValue = (item: any, attributePath: string) => {
      if (!attributePath) return item.name || item.title || JSON.stringify(item);
      
      return attributePath.split('.').reduce((obj, key) => {
        return obj && obj[key] !== undefined ? obj[key] : null;
      }, item);
    };

    // Se os itens do array são objetos
    if (typeof value[0] === 'object' && value[0] !== null) {
      return (
        <Card key={field.key}>
          <CardHeader>
            <CardTitle>{field.label}</CardTitle>
            <CardDescription>{value.length} {value.length === 1 ? 'item' : 'itens'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {value.map((item: any, index: number) => {
              const displayValue = getFieldValue(item, field.attributeType || 'name');
              return (
                <div key={index}>
                  <div className="flex items-center justify-between py-2">
                    <span className="font-medium text-sm text-muted-foreground">
                      {index + 1}.
                    </span>
                    <div className="text-right">
                      <span className="text-sm">{displayValue || 'N/A'}</span>
                    </div>
                  </div>
                  {index < value.length - 1 && <Separator />}
                </div>
              );
            })}
          </CardContent>
        </Card>
      );
    }

    // Se os itens são strings
    if (typeof value[0] === 'string') {
      return (
        <Card key={field.key}>
          <CardHeader>
            <CardTitle>{field.label}</CardTitle>
            <CardDescription>{value.length} {value.length === 1 ? 'item' : 'itens'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {value.map((item: string, index: number) => (
              <div key={index}>
                <div className="flex items-center justify-between py-2">
                  <span className="font-medium text-sm text-muted-foreground">
                    {index + 1}.
                  </span>
                  <div className="text-right">
                    <span className="text-sm">{item}</span>
                  </div>
                </div>
                {index < value.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      );
    }

    // Fallback para outros tipos de arrays
    return (
      <Card key={field.key}>
        <CardHeader>
          <CardTitle>{field.label}</CardTitle>
          <CardDescription>{value.length} {value.length === 1 ? 'item' : 'itens'}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{JSON.stringify(value)}</p>
        </CardContent>
      </Card>
    );
  };

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

      {/* Content - Card Principal */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes</CardTitle>
          <CardDescription>Informações completas do item</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {regularFields.map((field, index) => {
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
                {index < regularFields.length - 1 && <Separator />}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Cards de Arrays */}
      {arrayFields.map(field => renderArrayCard(field))}

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
