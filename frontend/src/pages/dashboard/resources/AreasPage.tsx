import { ReactNode } from "react";
import { DefaultPage } from "@/components/ui/default-page";

interface Area extends Record<string, unknown> {
  id?: number;
  name: string;
  main_category_id?: number;
  created_at?: string;
  updated_at?: string;
  main_category?: {
    id: number;
    name: string;
  };
  projects?: Array<{
    id: number;
    title: string;
    year: number;
    projectType: number;
  }>;
  evaluators?: Array<{
    id: number;
    PIN: string;
    user_id: number;
  }>;
  sub_categories?: Array<{
    id: number;
    name: string;
    main_category_id: number;
  }>;
}

const columns = [
  { 
    key: "name", 
    label: "Nome da Área", 
    sortable: true, 
    filterable: true, 
    filterType: 'text' as const 
  },
  { 
    key: "main_category_name", 
    label: "Categoria Principal", 
    sortable: true, 
    filterable: false, 
    filterType: 'text' as const 
  },
  { 
    key: "projects_count", 
    label: "Projetos", 
    sortable: false, 
    filterable: false, 
    filterType: 'number' as const 
  },
  { 
    key: "sub_categories_count", 
    label: "Sub-categorias", 
    sortable: false, 
    filterable: false, 
    filterType: 'number' as const 
  }
];

const formFields = [
  {
    name: "name",
    label: "Nome da Área",
    type: "text" as const,
    required: true,
    placeholder: "Digite o nome da área"
  },
  {
    name: "main_category_id",
    label: "Categoria Pai",
    type: "select" as const,
    required: false,
    placeholder: "Selecione a categoria pai",
    optionsEndpoint: "/categories/"
  }
];

const detailFields = [
  { key: "name", label: "Nome da Área", type: "text" as const },
  { key: "main_category_name", label: "Categoria Principal", type: "text" as const },
  { key: "projects_count", label: "Nº de Projetos", type: "array" as const },
  { key: "sub_categories_count", label: "Nº de Sub-categorias", type: "array" as const },
  { key: "sub_categories", label: "Sub-categorias", type: "array" as const }
];

const transformData = (item: Area): Record<string, ReactNode> => ({
  id: item.id,
  name: item.name,
  main_category_name: item.main_category?.name || "-",
  projects_count: item.projects?.length || 0,
  sub_categories_count: item.sub_categories?.length || 0,
  created_at: item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : "-",
  updated_at: item.updated_at
});

const transformCurrentItem = (item: Area): Record<string, unknown> => ({
  id: item.id,
  name: item.name,
  main_category_id: item.main_category_id,
  main_category_name: item.main_category?.name || "-",
  projects_count: item.projects?.length || 0,
  sub_categories_count: item.sub_categories?.length || 0,
  sub_categories: item.sub_categories || [],
  created_at: item.created_at,
  updated_at: item.updated_at
});

interface AreasPageProps {
  view: 'list' | 'detail' | 'create' | 'edit';
}

export const AreasPage = ({ view }: AreasPageProps) => {
  const PageComponent = DefaultPage<Area>;
  
  return (
    <PageComponent
      endpoint="/categories/"
      title={view === 'list' ? "Áreas" : "Área"}
      description="Gerencie as áreas de projetos da FECITEL"
      view={view}
      columns={columns}
      formFields={formFields}
      detailFields={detailFields}
      transformData={transformData}
      transformCurrentItem={transformCurrentItem}
      deleteConfirmMessage={(item) => `Tem certeza que deseja excluir a área "${item.name}"? Esta ação não pode ser desfeita.`}
      basePath="/dashboard/areas"
    />
  );
};
