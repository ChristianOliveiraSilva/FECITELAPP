import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus } from "lucide-react";
import { ReactNode } from "react";

interface CrudListPageProps {
  title: string;
  description?: string;
  columns: Array<{
    key: string;
    label: string;
    sortable?: boolean;
    filterable?: boolean;
    filterType?: 'text' | 'select' | 'date' | 'number';
    filterOptions?: { value: string; label: string }[];
  }>;
  data: Record<string, ReactNode>[];

  onAdd: () => void;
  onView: (item: Record<string, ReactNode>) => void;
  onEdit: (item: Record<string, ReactNode>) => void;
  onDelete: (item: Record<string, ReactNode>) => void;
  loading?: boolean;
  error?: string;
  baseEndpoint?: string;
}

export const CrudListPage = ({
  title,
  description,
  columns,
  data,
  onAdd,
  onView,
  onEdit,
  onDelete,
  loading = false,
  error,
  baseEndpoint
}: CrudListPageProps) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ifms-green-dark">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-2">{description}</p>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Carregando...</span>
        </div>
      )}
      
      {/* Data Table */}
      <DataTable
        title={`Lista de ${title}`}
        columns={columns}
        data={data}
        onAdd={onAdd}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        loading={loading}
        baseEndpoint={baseEndpoint}
      />
    </div>
  );
};
