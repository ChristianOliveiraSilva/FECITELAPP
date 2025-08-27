import { Button } from "@/components/ui/button";
import { CrudForm } from "@/components/ui/crud-form";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CrudFormPageProps {
  title: string;
  description?: string;
  fields: any[];
  initialData?: Record<string, any>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isEditing?: boolean;
  loading?: boolean;
}

export const CrudFormPage = ({
  title,
  description,
  fields,
  initialData = {},
  onSubmit,
  onCancel,
  isEditing = false,
  loading = false
}: CrudFormPageProps) => {
  const navigate = useNavigate();

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" onClick={handleCancel} className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold text-ifms-green-dark">
          {isEditing ? `Editar ${title}` : `Criar ${title}`}
        </h1>
        {description && (
          <p className="text-muted-foreground mt-2">{description}</p>
        )}
      </div>

      {/* Form */}
      <CrudForm
        title={title}
        fields={fields}
        initialData={initialData}
        onSubmit={onSubmit}
        onCancel={handleCancel}
        isEditing={isEditing}
        loading={loading}
      />
    </div>
  );
};
