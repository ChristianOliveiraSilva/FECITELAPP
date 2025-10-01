import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { ReactNode } from "react";
import { DefaultPage } from "@/components/ui/default-page";

interface Avaliador extends Record<string, unknown> {
  id?: number;
  PIN: string;
  user_id: number;
  created_at?: string;
  updated_at?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    active: boolean;
  };
  categories?: Array<{
    id: number;
    name: string;
  }>;
  assessments?: Array<{
    id: number;
    project_id: number;
    created_at: string;
    project?: {
      id: number;
      title: string;
      year: number;
    };
  }>;
}

const columns = [
  { 
    key: "PIN", 
    label: "PIN", 
    sortable: true, 
    filterable: true, 
    filterType: 'text' as const 
  },
  { 
    key: "user_name", 
    label: "Nome", 
    sortable: true, 
    filterable: true, 
    filterType: 'text' as const 
  },
  { 
    key: "user_email", 
    label: "Email", 
    sortable: true, 
    filterable: true, 
    filterType: 'text' as const 
  },
  { 
    key: "user_active", 
    label: "Ativo", 
    sortable: true, 
    filterable: true, 
    filterType: 'select' as const,
    filterOptions: [
      { value: "true", label: "Sim" },
      { value: "false", label: "Não" }
    ]
  },
  { 
    key: "categories_count", 
    label: "Áreas", 
    sortable: false, 
    filterable: true, 
    filterType: 'number' as const 
  },
  { 
    key: "assessments_count", 
    label: "Avaliações", 
    sortable: false, 
    filterable: true, 
    filterType: 'number' as const 
  },
  { 
    key: "created_at", 
    label: "Criado em", 
    sortable: true, 
    filterable: true, 
    filterType: 'date' as const 
  }
];

const formFields = [
  {
    name: "PIN",
    label: "PIN",
    type: "text" as const,
    required: true,
    placeholder: "Digite o PIN do avaliador"
  },
  {
    name: "user_id",
    label: "Usuário",
    type: "select" as const,
    required: true,
    placeholder: "Selecione o usuário",
    options: [] // Será preenchido dinamicamente
  }
];

const detailFields = [
  { key: "id", label: "ID", type: "number" as const },
  { key: "PIN", label: "PIN", type: "text" as const },
  { key: "user_name", label: "Nome", type: "text" as const },
  { key: "user_email", label: "Email", type: "text" as const },
  { key: "user_active", label: "Ativo", type: "boolean" as const },
  { key: "categories_count", label: "Áreas", type: "array" as const },
  { key: "assessments_count", label: "Avaliações", type: "array" as const },
  { key: "created_at", label: "Criado em", type: "date" as const },
  { key: "updated_at", label: "Atualizado em", type: "date" as const }
];

const handleGerarInstrucoes = async (selectedItems: Record<string, unknown>[]) => {
    try {
      const ids = selectedItems.map(item => item.id).filter(id => id !== undefined);
      if (ids.length === 0) {
        alert('Selecione pelo menos um avaliador');
        return;
      }

      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v3/docs/generate/instrucoes`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ids })
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar documento');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'instrucoes_avaliacao.docx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao gerar documento de instruções:', error);
      alert('Erro ao gerar documento de instruções');
    }
  };

const createActionButtons = (selectedItems: Record<string, unknown>[]) => (
  <div className="flex gap-2">
    <Button
      onClick={() => handleGerarInstrucoes(selectedItems)}
      variant="outline"
      className="flex items-center gap-2"
      size="sm"
    >
      <FileText className="h-4 w-4 mr-2" />
      Instruções
    </Button>
  </div>
);

const transformData = (item: Avaliador): Record<string, ReactNode> => ({
  id: item.id,
  PIN: item.PIN,
  user_id: item.user_id,
  user_name: item.user?.name || "-",
  user_email: item.user?.email || "-",
  user_active: item.user?.active ? "Sim" : "Não",
  categories_count: item.categories?.length || 0,
  assessments_count: item.assessments?.length || 0,
  created_at: item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : "-",
  updated_at: item.updated_at
});

const transformCurrentItem = (item: Avaliador): Record<string, unknown> => ({
  id: item.id,
  PIN: item.PIN,
  user_name: item.user?.name || "-",
  user_email: item.user?.email || "-",
  user_active: item.user?.active || false,
  categories_count: item.categories?.length || 0,
  assessments_count: item.assessments?.length || 0,
  created_at: item.created_at,
  updated_at: item.updated_at
});

interface AvaliadoresPageProps {
  view: 'list' | 'detail' | 'create' | 'edit';
}

export const AvaliadoresPage = ({ view }: AvaliadoresPageProps) => {
  const PageComponent = DefaultPage<Avaliador>;

  return (
    <PageComponent
      endpoint="/evaluators/"
      title={view === 'list' ? "Avaliadores" : "Avaliador"}
      description="Gerencie os avaliadores da FECITEL"
      view={view}
      columns={columns}
      formFields={formFields}
      detailFields={detailFields}
      transformData={transformData}
      transformCurrentItem={transformCurrentItem}
      useFilters={true}
      selectable={true}
      actionButtons={createActionButtons}
      deleteConfirmMessage={(item) => `Tem certeza que deseja excluir o avaliador "${item.user?.name}"? Esta ação não pode ser desfeita.`}
      basePath="/dashboard/avaliadores"
    />
  );
};