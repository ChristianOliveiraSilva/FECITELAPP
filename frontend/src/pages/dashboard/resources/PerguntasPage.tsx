import { ReactNode } from "react";
import { DefaultPage } from "@/components/ui/default-page";

interface Pergunta extends Record<string, unknown> {
  id?: number;
  scientific_text: string;
  technological_text: string;
  type: number;
  number_alternatives: number;
  year: number;
  created_at?: string;
  updated_at?: string;
  responses?: Array<{
    id: number;
    assessment_id: number;
    response: string;
    score: number;
  }>;
  awards?: Array<{
    id: number;
    name: string;
    description: string;
  }>;
}

const columns = [
  { 
    key: "scientific_text", 
    label: "Texto Científico", 
    sortable: true, 
    filterable: true, 
    filterType: 'text' as const 
  },
  { 
    key: "technological_text", 
    label: "Texto Tecnológico", 
    sortable: true, 
    filterable: true, 
    filterType: 'text' as const 
  },
  { 
    key: "type", 
    label: "Tipo", 
    sortable: true, 
    filterable: true, 
    filterType: 'select' as const,
    filterOptions: [
      { value: "1", label: "Científico" },
      { value: "2", label: "Tecnológico" }
    ]
  },
  { 
    key: "number_alternatives", 
    label: "Alternativas", 
    sortable: true, 
    filterable: true, 
    filterType: 'number' as const 
  },
  { 
    key: "year", 
    label: "Ano", 
    sortable: true, 
    filterable: true, 
    filterType: 'number' as const 
  },
  { 
    key: "responses_count", 
    label: "Respostas", 
    sortable: false, 
    filterable: true, 
    filterType: 'number' as const 
  },
  { 
    key: "awards_count", 
    label: "Premiações", 
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
    name: "scientific_text",
    label: "Texto Científico",
    type: "textarea" as const,
    required: true,
    placeholder: "Digite o texto da pergunta científica"
  },
  {
    name: "technological_text",
    label: "Texto Tecnológico",
    type: "textarea" as const,
    required: true,
    placeholder: "Digite o texto da pergunta tecnológica"
  },
  {
    name: "type",
    label: "Tipo",
    type: "select" as const,
    required: true,
    placeholder: "Selecione o tipo",
    options: [
      { value: "1", label: "Científico" },
      { value: "2", label: "Tecnológico" }
    ]
  },
  {
    name: "number_alternatives",
    label: "Número de Alternativas",
    type: "number" as const,
    required: true,
    placeholder: "Digite o número de alternativas"
  },
  {
    name: "year",
    label: "Ano",
    type: "number" as const,
    required: true,
    placeholder: "Digite o ano"
  }
];

const detailFields = [
  { key: "id", label: "ID", type: "number" as const },
  { key: "scientific_text", label: "Texto Científico", type: "text" as const },
  { key: "technological_text", label: "Texto Tecnológico", type: "text" as const },
  { key: "type", label: "Tipo", type: "text" as const },
  { key: "number_alternatives", label: "Número de Alternativas", type: "number" as const },
  { key: "year", label: "Ano", type: "number" as const },
  { key: "responses_count", label: "Respostas", type: "array" as const },
  { key: "awards_count", label: "Premiações", type: "array" as const },
  { key: "created_at", label: "Criado em", type: "date" as const },
  { key: "updated_at", label: "Atualizado em", type: "date" as const }
];

const transformData = (item: Pergunta): Record<string, ReactNode> => ({
  id: item.id,
  scientific_text: item.scientific_text,
  technological_text: item.technological_text,
  type: item.type === 1 ? "Científico" : "Tecnológico",
  number_alternatives: item.number_alternatives,
  year: item.year,
  responses_count: item.responses?.length || 0,
  awards_count: item.awards?.length || 0,
  created_at: item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : "-",
  updated_at: item.updated_at
});

const transformCurrentItem = (item: Pergunta): Record<string, unknown> => ({
  id: item.id,
  scientific_text: item.scientific_text,
  technological_text: item.technological_text,
  type: item.type === 1 ? "Científico" : "Tecnológico",
  number_alternatives: item.number_alternatives,
  year: item.year,
  responses_count: item.responses?.length || 0,
  awards_count: item.awards?.length || 0,
  created_at: item.created_at,
  updated_at: item.updated_at
});

interface PerguntasPageProps {
  view: 'list' | 'detail' | 'create' | 'edit';
}

export const PerguntasPage = ({ view }: PerguntasPageProps) => {
  const PageComponent = DefaultPage<Pergunta>;
  
  return (
    <PageComponent
      endpoint="/questions/"
      title={view === 'list' ? "Perguntas" : "Pergunta"}
      description="Gerencie as perguntas de avaliação da FECITEL"
      view={view}
      columns={columns}
      formFields={formFields}
      detailFields={detailFields}
      transformData={transformData}
      transformCurrentItem={transformCurrentItem}
      useFilters={true}
      deleteConfirmMessage={() => `Tem certeza que deseja excluir esta pergunta? Esta ação não pode ser desfeita.`}
      basePath="/dashboard/perguntas"
    />
  );
};
