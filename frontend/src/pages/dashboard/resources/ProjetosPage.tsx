import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { ReactNode } from "react";
import { DefaultPage } from "@/components/ui/default-page";

interface Projeto extends Record<string, unknown> {
  id?: number;
  title: string;
  description?: string;
  year: number;
  category_id: number;
  projectType: number;
  external_id?: string;
  file?: string;
  created_at?: string;
  updated_at?: string;
  category?: {
    id: number;
    name: string;
  };
  students?: Array<{
    id: number;
    name: string;
    school_grade: number;
    year: number;
    school_id: number;
    school?: {
      id: number;
      name: string;
    };
  }>;
  assessments?: Array<{
    id: number;
    evaluator_id: number;
    created_at: string;
  }>;
}

const columns = [
  { 
    key: "title", 
    label: "Título", 
    sortable: true,
    filterable: true,
    filterType: 'text' as const
  },
  { 
    key: "external_id", 
    label: "ID Externo", 
    sortable: true,
    filterable: true,
    filterType: 'text' as const
  },
  { 
    key: "category_name", 
    label: "Categoria", 
    sortable: true,
    filterable: false,
    filterType: 'text' as const
  },
  { 
    key: "project_type", 
    label: "Tipo", 
    sortable: true,
    filterable: true,
    filterType: 'select' as const,
    filterOptions: [
      { value: "1", label: "Tecnológico" },
      { value: "2", label: "Científico" }
    ]
  },
  { 
    key: "year", 
    label: "Ano", 
    sortable: true,
    filterable: false,
    filterType: 'number' as const
  },
  { 
    key: "assessments_count", 
    label: "Nº de Avaliações", 
    sortable: false,
    filterable: true,
    filterType: 'number' as const
  }
];

const formFields = [
  {
    name: "title",
    label: "Título",
    type: "text" as const,
    required: true,
    placeholder: "Digite o título do projeto"
  },
  {
    name: "description",
    label: "Descrição",
    type: "textarea" as const,
    required: false,
    placeholder: "Digite a descrição do projeto"
  },
  {
    name: "year",
    label: "Ano",
    type: "number" as const,
    required: true,
    placeholder: "Digite o ano do projeto"
  },
  {
    name: "category_id",
    label: "Categoria",
    type: "select" as const,
    required: true,
    placeholder: "Selecione a categoria",
    optionsEndpoint: "/categories/"
  },
  {
    name: "projectType",
    label: "Tipo de Projeto",
    type: "select" as const,
    required: true,
    placeholder: "Selecione o tipo",
    options: [
      { value: "1", label: "Tecnológico" },
      { value: "2", label: "Científico" }
    ]
  },
  {
    name: "external_id",
    label: "External ID",
    type: "text" as const,
    required: false,
    placeholder: "Digite o ID externo"
  },
  {
    name: "file",
    label: "File",
    type: "file" as const,
    required: true,
    accept: ".pdf,.doc,.docx"
  }
];

const detailFields = [
  { key: "title", label: "Título", type: "text" as const },
  { key: "description", label: "Descrição", type: "text" as const },
  { key: "year", label: "Ano", type: "number" as const },
  { key: "category_name", label: "Categoria", type: "text" as const },
  { key: "project_type", label: "Tipo de Projeto", type: "text" as const },
  { key: "external_id", label: "External ID", type: "text" as const },
  { key: "file", label: "File", type: "text" as const },
  { key: "assessments", label: "Avaliações", type: "array" as const }
];

const handleGerarParticipacao = async (selectedItems: Record<string, unknown>[]) => {
    try {
      const ids = selectedItems.map(item => item.id).filter(id => id !== undefined);
      if (ids.length === 0) {
        alert('Selecione pelo menos um projeto');
        return;
      }

      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v3/docs/generate/participacao`, {
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
      link.download = 'participacao_feira.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao gerar documento de participação:', error);
      alert('Erro ao gerar documento de participação');
    }
  };

  const handleGerarPremiacao = async (selectedItems: Record<string, unknown>[]) => {
    try {
      const ids = selectedItems.map(item => item.id).filter(id => id !== undefined);
      if (ids.length === 0) {
        alert('Selecione pelo menos um projeto');
        return;
      }

      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v3/docs/generate/premiacao`, {
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
      link.download = 'premiacao.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao gerar documento de premiação:', error);
      alert('Erro ao gerar documento de premiação');
    }
  };

const createActionButtons = (selectedItems: Record<string, unknown>[]) => (
  <div className="flex gap-2">
    <Button
      onClick={() => handleGerarParticipacao(selectedItems)}
      variant="outline"
      className="flex items-center gap-2"
      size="sm"
    >
      <FileText className="h-4 w-4 mr-2" />
      Participação
    </Button>
    <Button
      onClick={() => handleGerarPremiacao(selectedItems)}
      variant="outline"
      className="flex items-center gap-2"
      size="sm"
    >
      <FileText className="h-4 w-4 mr-2" />
      Premiação
    </Button>
  </div>
);

const transformData = (item: Projeto): Record<string, ReactNode> => ({
  id: item.id,
  title: item.title,
  description: item.description,
  year: item.year,
  category_id: item.category_id,
  projectType: item.projectType,
  external_id: item.external_id,
  file: item.file,
  category_name: item.category?.name || "-",
  project_type: item.projectType == 1 ? "Tecnológico" : "Científico",
  assessments_count: item.assessments?.length || 0,
  created_at: item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : "-",
  updated_at: item.updated_at
});

const transformCurrentItem = (item: Projeto): Record<string, unknown> => ({
  id: item.id,
  title: item.title,
  description: item.description || "-",
  year: item.year,
  category_id: item.category_id,
  projectType: item.projectType,
  external_id: item.external_id || "-",
  file: item.file || "-",
  category_name: item.category?.name || "-",
  project_type: item.projectType == 1 ? "Tecnológico" : "Científico",
  assessments: item.assessments || [],
  created_at: item.created_at,
  updated_at: item.updated_at
});

interface ProjetosPageProps {
  view: 'list' | 'detail' | 'create' | 'edit';
}

export const ProjetosPage = ({ view }: ProjetosPageProps) => {
  const PageComponent = DefaultPage<Projeto>;
  
  return (
    <PageComponent
      endpoint="/projects/"
      title={view === 'list' ? "Projetos" : "Projeto"}
      description="Gerencie os projetos inscritos na FECITEL"
      view={view}
      columns={columns}
      formFields={formFields}
      detailFields={detailFields}
      transformData={transformData}
      transformCurrentItem={transformCurrentItem}
      selectable={true}
      actionButtons={createActionButtons}
      deleteConfirmMessage={(item) => `Tem certeza que deseja excluir o projeto "${item.title}"? Esta ação não pode ser desfeita.`}
      basePath="/dashboard/projetos"
    />
  );
};