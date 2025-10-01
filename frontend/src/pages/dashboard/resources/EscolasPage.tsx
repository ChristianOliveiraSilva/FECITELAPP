import { ReactNode } from "react";
import { DefaultPage } from "@/components/ui/default-page";

interface Escola extends Record<string, unknown> {
  id?: number;
  name: string;
  type: string;
  city: string;
  state: string;
  created_at?: string;
  updated_at?: string;
  students?: Array<{
    id: number;
    name: string;
    school_grade: number;
    year: number;
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
    key: "type", 
    label: "Tipo", 
    sortable: true, 
    filterable: true, 
    filterType: 'select' as const,
    filterOptions: [
      { value: "estadual", label: "Estadual" },
      { value: "municipal", label: "Municipal" },
      { value: "federal", label: "Federal" },
      { value: "particular", label: "Particular" }
    ]
  },
  { 
    key: "city", 
    label: "Cidade", 
    sortable: true, 
    filterable: true, 
    filterType: 'text' as const 
  },
  { 
    key: "state", 
    label: "Estado", 
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
    placeholder: "Digite o nome da escola"
  },
  {
    name: "type",
    label: "Tipo",
    type: "select" as const,
    required: true,
    placeholder: "Selecione o tipo de escola",
    options: [
      { value: "estadual", label: "Estadual" },
      { value: "municipal", label: "Municipal" },
      { value: "federal", label: "Federal" }
    ]
  },
  {
    name: "city",
    label: "Cidade",
    type: "text" as const,
    required: true,
    placeholder: "Digite a cidade"
  },
  {
    name: "state",
    label: "Estado",
    type: "text" as const,
    required: true,
    placeholder: "Digite o estado (ex: MS)"
  }
];

const detailFields = [
  { key: "name", label: "Nome", type: "text" as const },
  { key: "type", label: "Tipo", type: "text" as const },
  { key: "city", label: "Cidade", type: "text" as const },
  { key: "state", label: "Estado", type: "text" as const },
  { key: "students", label: "Estudantes", type: "array" as const }
];

const transformData = (item: Escola): Record<string, ReactNode> => ({
  id: item.id,
  name: item.name,
  type: item.type || "-",
  city: item.city || "-",
  state: item.state || "-",
  created_at: item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : "-",
  updated_at: item.updated_at
});

const transformCurrentItem = (item: Escola): Record<string, unknown> => ({
  id: item.id,
  name: item.name,
  type: item.type || "-",
  city: item.city || "-",
  state: item.state || "-",
  students: item.students || [],
  created_at: item.created_at,
  updated_at: item.updated_at
});

interface EscolasPageProps {
  view: 'list' | 'detail' | 'create' | 'edit';
}

export const EscolasPage = ({ view }: EscolasPageProps) => {
  const PageComponent = DefaultPage<Escola>;
  
  return (
    <PageComponent
      endpoint="/schools/"
      title={view === 'list' ? "Escolas" : "Escola"}
      description="Gerencie as escolas participantes da FECITEL"
      view={view}
      columns={columns}
      formFields={formFields}
      detailFields={detailFields}
      transformData={transformData}
      transformCurrentItem={transformCurrentItem}
      deleteConfirmMessage={(item) => `Tem certeza que deseja excluir a escola "${item.name}"? Esta ação não pode ser desfeita.`}
      basePath="/dashboard/escolas"
    />
  );
};
