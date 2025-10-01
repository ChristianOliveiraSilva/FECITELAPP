import { ReactNode } from "react";
import { DefaultPage } from "@/components/ui/default-page";

interface Premiacao extends Record<string, unknown> {
  id?: number;
  name: string;
  description?: string;
  school_grade: number;
  total_positions: number;
  use_school_grades: boolean;
  use_categories: boolean;
  created_at?: string;
  updated_at?: string;
  questions?: Array<{
    id: number;
    scientific_text: string;
    technological_text: string;
    type: number;
    number_alternatives: number;
  }>;
}

const columns = [
  { 
    key: "name", 
    label: "Nome da Premiação", 
    sortable: true, 
    filterable: true, 
    filterType: 'text' as const 
  },
  { 
    key: "description", 
    label: "Descrição", 
    sortable: true, 
    filterable: true, 
    filterType: 'text' as const 
  },
  { 
    key: "school_grade", 
    label: "Série", 
    sortable: true, 
    filterable: true, 
    filterType: 'select' as const,
    filterOptions: [
      { value: "1", label: "1º ano" },
      { value: "2", label: "2º ano" },
      { value: "3", label: "3º ano" }
    ]
  },
  { 
    key: "total_positions", 
    label: "Total de Posições", 
    sortable: true, 
    filterable: true, 
    filterType: 'number' as const 
  },
  { 
    key: "use_school_grades", 
    label: "Usa Séries", 
    sortable: true, 
    filterable: true, 
    filterType: 'select' as const,
    filterOptions: [
      { value: "true", label: "Sim" },
      { value: "false", label: "Não" }
    ]
  },
  { 
    key: "use_categories", 
    label: "Usa Categorias", 
    sortable: true, 
    filterable: true, 
    filterType: 'select' as const,
    filterOptions: [
      { value: "true", label: "Sim" },
      { value: "false", label: "Não" }
    ]
  },
  { 
    key: "questions_count", 
    label: "Perguntas", 
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
    name: "name",
    label: "Nome da Premiação",
    type: "text" as const,
    required: true,
    placeholder: "Digite o nome da premiação"
  },
  {
    name: "description",
    label: "Descrição",
    type: "textarea" as const,
    required: false,
    placeholder: "Digite a descrição da premiação"
  },
  {
    name: "school_grade",
    label: "Série",
    type: "select" as const,
    required: true,
    placeholder: "Selecione a série",
    options: [
      { value: "1", label: "1º ano" },
      { value: "2", label: "2º ano" },
      { value: "3", label: "3º ano" }
    ]
  },
  {
    name: "total_positions",
    label: "Total de Posições",
    type: "number" as const,
    required: true,
    placeholder: "Digite o total de posições"
  },
  {
    name: "use_school_grades",
    label: "Usa Séries",
    type: "select" as const,
    required: true,
    placeholder: "Selecione se usa séries",
    options: [
      { value: "true", label: "Sim" },
      { value: "false", label: "Não" }
    ]
  },
  {
    name: "use_categories",
    label: "Usa Categorias",
    type: "select" as const,
    required: true,
    placeholder: "Selecione se usa categorias",
    options: [
      { value: "true", label: "Sim" },
      { value: "false", label: "Não" }
    ]
  }
];

const detailFields = [
  { key: "id", label: "ID", type: "number" as const },
  { key: "name", label: "Nome da Premiação", type: "text" as const },
  { key: "description", label: "Descrição", type: "text" as const },
  { key: "school_grade", label: "Série", type: "text" as const },
  { key: "total_positions", label: "Total de Posições", type: "number" as const },
  { key: "use_school_grades", label: "Usa Séries", type: "boolean" as const },
  { key: "use_categories", label: "Usa Categorias", type: "boolean" as const },
  { key: "questions_count", label: "Perguntas", type: "array" as const },
  { key: "created_at", label: "Criado em", type: "date" as const },
  { key: "updated_at", label: "Atualizado em", type: "date" as const }
];

const transformData = (item: Premiacao): Record<string, ReactNode> => ({
  id: item.id,
  name: item.name,
  description: item.description || "-",
  school_grade: item.school_grade === 1 ? "1º ano" : item.school_grade === 2 ? "2º ano" : "3º ano",
  total_positions: item.total_positions,
  use_school_grades: item.use_school_grades ? "Sim" : "Não",
  use_categories: item.use_categories ? "Sim" : "Não",
  questions_count: item.questions?.length || 0,
  created_at: item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : "-",
  updated_at: item.updated_at
});

const transformCurrentItem = (item: Premiacao): Record<string, unknown> => ({
  id: item.id,
  name: item.name,
  description: item.description || "-",
  school_grade: item.school_grade === 1 ? "1º ano" : item.school_grade === 2 ? "2º ano" : "3º ano",
  total_positions: item.total_positions,
  use_school_grades: item.use_school_grades,
  use_categories: item.use_categories,
  questions_count: item.questions?.length || 0,
  created_at: item.created_at,
  updated_at: item.updated_at
});

interface PremiacoesPageProps {
  view: 'list' | 'detail' | 'create' | 'edit';
}

export const PremiacoesPage = ({ view }: PremiacoesPageProps) => {
  const PageComponent = DefaultPage<Premiacao>;
  
  return (
    <PageComponent
      endpoint="/awards/"
      title={view === 'list' ? "Premiações" : "Premiação"}
      description="Gerencie as premiações da FECITEL"
      view={view}
      columns={columns}
      formFields={formFields}
      detailFields={detailFields}
      transformData={transformData}
      transformCurrentItem={transformCurrentItem}
      deleteConfirmMessage={(item) => `Tem certeza que deseja excluir a premiação "${item.name}"? Esta ação não pode ser desfeita.`}
      basePath="/dashboard/premiacoes"
    />
  );
};