import { ReactNode } from "react";
import { DefaultPage } from "@/components/ui/default-page";

interface Orientador extends Record<string, unknown> {
  id?: number;
  name: string;
  email: string;
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
    placeholder: "Digite o nome do orientador"
  },
  {
    name: "email",
    label: "Email",
    type: "email" as const,
    required: false,
    placeholder: "Digite o email do orientador"
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
  { key: "school_name", label: "Escola", type: "text" as const },
  { key: "projects", label: "Projetos", type: "array" as const }
];

const transformData = (item: Orientador): Record<string, ReactNode> => ({
  id: item.id,
  name: item.name,
  email: item.email || "-",
  year: item.year,
  school_id: item.school_id,
  school_name: item.school?.name || "-",
  created_at: item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : "-",
  updated_at: item.updated_at
});

const transformCurrentItem = (item: Orientador): Record<string, unknown> => ({
  id: item.id,
  name: item.name,
  email: item.email || "-",
  year: item.year,
  school_name: item.school?.name || "-",
  projects: item.projects || [],
  created_at: item.created_at,
  updated_at: item.updated_at
});

interface OrientadoresPageProps {
  view: 'list' | 'detail' | 'create' | 'edit';
}

export const OrientadoresPage = ({ view }: OrientadoresPageProps) => {
  const PageComponent = DefaultPage<Orientador>;
  
  return (
    <PageComponent
      endpoint="/supervisors/"
      title={view === 'list' ? "Orientadores" : "Orientador"}
      description="Gerencie os orientadores participantes da saipru"
      view={view}
      columns={columns}
      formFields={formFields}
      detailFields={detailFields}
      transformData={transformData}
      transformCurrentItem={transformCurrentItem}
      deleteConfirmMessage={(item) => `Tem certeza que deseja excluir o orientador "${item.name}"? Esta ação não pode ser desfeita.`}
      basePath="/dashboard/orientadores"
    />
  );
};
