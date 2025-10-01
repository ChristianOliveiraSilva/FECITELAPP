import { ReactNode } from "react";
import { DefaultPage } from "@/components/ui/default-page";

interface Avaliacao extends Record<string, unknown> {
  id?: number;
  evaluator_id: number;
  project_id: number;
  created_at?: string;
  updated_at?: string;
  has_response?: boolean;
  note?: number;
  evaluator?: {
    id: number;
    PIN: string;
    user_id: number;
  };
  project?: {
    id: number;
    title: string;
    year: number;
    category_id: number;
    category?: {
      id: number;
      name: string;
    };
  };
  responses?: Array<{
    id: number;
    question_id: number;
    response: string;
    score: number;
  }>;
}

const columns = [
  { 
    key: "pin", 
    label: "Avaliador", 
    sortable: true, 
    filterable: true, 
    filterType: 'text' as const 
  },
  { 
    key: "project_title", 
    label: "Projeto", 
    sortable: true, 
    filterable: true, 
    filterType: 'text' as const 
  },
  { 
    key: "project_year", 
    label: "Ano", 
    sortable: true, 
    filterable: false, 
    filterType: 'number' as const 
  },
  { 
    key: "has_response", 
    label: "Respondido", 
    sortable: true, 
    filterable: true, 
    filterType: 'select' as const,
    filterOptions: [
      { value: "true", label: "Sim" },
      { value: "false", label: "Não" }
    ]
  },
  { 
    key: "note", 
    label: "Nota", 
    sortable: true, 
    filterable: false, 
    filterType: 'number' as const 
  }
];

const formFields = [
  {
    name: "evaluator_id",
    label: "Avaliador",
    type: "select" as const,
    required: true,
    placeholder: "Selecione o avaliador",
    optionsEndpoint: "/evaluators/",
    optionsEndpointAttribute: 'PIN',
  },
  {
    name: "project_id",
    label: "Projeto",
    type: "select" as const,
    required: true,
    placeholder: "Selecione o projeto",
    optionsEndpoint: "/projects/",
    optionsEndpointAttribute: 'title',
  }
];

const detailFields = [
  { key: "pin", label: "Avaliador", type: "text" as const },
  { key: "project_title", label: "Projeto", type: "text" as const },
  { key: "project_year", label: "Ano", type: "number" as const },
  { key: "has_response", label: "Respondido", type: "boolean" as const },
  { key: "note", label: "Nota Geral", type: "number" as const },
  { key: "responses", label: "Nota por Resposta", type: "array" as const }
];

const transformData = (item: Avaliacao): Record<string, ReactNode> => ({
  id: item.id,
  evaluator_id: item.evaluator_id,
  project_id: item.project_id,
  pin: item.evaluator?.PIN,
  project_title: item.project?.title || `Projeto ${item.project_id}`,
  project_year: item.project?.year || "-",
  has_response: item.has_response ? "Sim" : "Não",
  note: item.note?.toFixed(2) || "0.00",
  created_at: item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : "-",
  updated_at: item.updated_at
});

const transformCurrentItem = (item: Avaliacao): Record<string, unknown> => ({
  id: item.id,
  evaluator_id: item.evaluator_id,
  project_id: item.project_id,
  pin: item.evaluator?.PIN,
  project_title: item.project?.title || `Projeto ${item.project_id}`,
  project_year: item.project?.year || "-",
  has_response: item.has_response || false,
  note: item.note?.toFixed(2) || "0.00",
  responses: item.responses || [],
  created_at: item.created_at,
  updated_at: item.updated_at
});

interface AvaliacoesPageProps {
  view: 'list' | 'detail' | 'create' | 'edit';
}

export const AvaliacoesPage = ({ view }: AvaliacoesPageProps) => {
  const PageComponent = DefaultPage<Avaliacao>;
  
  return (
    <PageComponent
      endpoint="/assessments/"
      title={view === 'list' ? "Avaliações" : "Avaliação"}
      description="Gerencie as avaliações dos projetos da FECITEL"
      view={view}
      columns={columns}
      formFields={formFields}
      detailFields={detailFields}
      transformData={transformData}
      transformCurrentItem={transformCurrentItem}
      deleteConfirmMessage={(item) => `Tem certeza que deseja excluir a avaliação do projeto "${item.project?.title}"? Esta ação não pode ser desfeita.`}
      basePath="/dashboard/avaliacoes"
    />
  );
};
