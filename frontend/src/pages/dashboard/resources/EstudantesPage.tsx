import { ReactNode } from "react";
import { DefaultPage } from "@/components/ui/default-page";

interface Estudante extends Record<string, unknown> {
  id?: number;
  name: string;
  email: string;
  school_grade: number;
  year: number;
  school_id: number;
  created_at?: string;
  updated_at?: string;
  school?: {
    id: number;
    name: string;
  };
  projects?: Array<{
    id: number;
    title: string;
    year: number;
    category_id: number;
  }>;
}

const columns = [
  { 
    key: "name", 
    label: "Nome", 
    sortable: true, 
    filterable: true, 
    filterType: 'text' as const 
  },
  { 
    key: "email", 
    label: "Email", 
    sortable: true, 
    filterable: true, 
    filterType: 'text' as const 
  },
  { 
    key: "school_grade", 
    label: "Grau Escolar", 
    sortable: true, 
    filterable: true, 
    filterType: 'select' as const,
    filterOptions: [
      { value: "Ensino Fundamental", label: "Ensino Fundamental" },
      { value: "Ensino Médio", label: "Ensino Médio" }
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
    key: "school_name", 
    label: "Escola", 
    sortable: true, 
    filterable: true, 
    filterType: 'text' as const 
  }
];

const formFields = [
  {
    name: "name",
    label: "Nome",
    type: "text" as const,
    required: true,
    placeholder: "Digite o nome do estudante"
  },
  {
    name: "email",
    label: "Email",
    type: "email" as const,
    required: true,
    placeholder: "Digite o email do estudante"
  },
  {
    name: "school_grade",
    label: "Grau Escolar",
    type: "select" as const,
    required: true,
    placeholder: "Selecione o grau escolar",
    options: [
      { value: "Ensino Fundamental", label: "Ensino Fundamental" },
      { value: "Ensino Médio", label: "Ensino Médio" }
    ]
  },
  {
    name: "year",
    label: "Ano",
    type: "number" as const,
    required: true,
    placeholder: "Digite o ano"
  },
  {
    name: "school_id",
    label: "Escola",
    type: "select" as const,
    required: true,
    placeholder: "Selecione a escola",
    optionsEndpoint: "/schools/"
  }
];

const detailFields = [
  { key: "name", label: "Nome", type: "text" as const },
  { key: "email", label: "Email", type: "text" as const },
  { key: "school_grade", label: "Grau Escolar", type: "text" as const },
  { key: "year", label: "Ano", type: "number" as const },
  { key: "school_name", label: "Escola", type: "text" as const },
  { key: "projects", label: "Projetos", type: "array" as const }
];

const transformData = (item: Estudante): Record<string, ReactNode> => ({
  id: item.id,
  name: item.name,
  email: item.email,
  school_grade: item.school_grade,
  year: item.year,
  school_id: item.school_id,
  school_name: item.school?.name || "-",
  created_at: item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : "-",
  updated_at: item.updated_at
});

const transformCurrentItem = (item: Estudante): Record<string, unknown> => ({
  id: item.id,
  name: item.name,
  email: item.email,
  school_grade: item.school_grade === 1 ? "Ensino Fundamental" : "Ensino Médio",
  year: item.year,
  school_name: item.school?.name || "-",
  projects_count: item.projects?.length || 0,
  created_at: item.created_at,
  updated_at: item.updated_at
});

interface EstudantesPageProps {
  view: 'list' | 'detail' | 'create' | 'edit';
}

export const EstudantesPage = ({ view }: EstudantesPageProps) => {
  const PageComponent = DefaultPage<Estudante>;
  
  return (
    <PageComponent
      endpoint="/students/"
      title={view === 'list' ? "Estudantes" : "Estudante"}
      description="Gerencie os estudantes participantes da FECITEL"
      view={view}
      columns={columns}
      formFields={formFields}
      detailFields={detailFields}
      transformData={transformData}
      transformCurrentItem={transformCurrentItem}
      deleteConfirmMessage={(item) => `Tem certeza que deseja excluir o estudante "${item.name}"? Esta ação não pode ser desfeita.`}
      basePath="/dashboard/estudantes"
    />
  );
};
