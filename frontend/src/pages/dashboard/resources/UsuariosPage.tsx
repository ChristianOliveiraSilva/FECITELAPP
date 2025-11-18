import { ReactNode } from "react";
import { DefaultPage } from "@/components/ui/default-page";

interface Usuario extends Record<string, unknown> {
  id?: number;
  name: string;
  email: string;
  active: boolean;
  email_verified_at?: string;
  remember_token?: string;
  created_at?: string;
  updated_at?: string;
  evaluator?: {
    id: number;
    PIN: string;
    created_at: string;
  };
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
    key: "active", 
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
    key: "evaluator_pin", 
    label: "PIN Avaliador", 
    sortable: false, 
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
    placeholder: "Digite o nome completo"
  },
  {
    name: "email",
    label: "Email",
    type: "email" as const,
    required: true,
    placeholder: "Digite o email"
  },
  {
    name: "active",
    label: "Ativo",
    type: "select" as const,
    required: true,
    placeholder: "Selecione o status",
    options: [
      { value: "true", label: "Sim" },
      { value: "false", label: "Não" }
    ]
  },
  {
    name: "password",
    label: "Senha",
    type: "password" as const,
    required: true,
    placeholder: "Digite a senha"
  }
];

const detailFields = [
  { key: "name", label: "Nome", type: "text" as const },
  { key: "email", label: "Email", type: "text" as const },
  { key: "active", label: "Ativo", type: "boolean" as const },
  { key: "evaluator_pin", label: "PIN Avaliador", type: "text" as const }
];

const transformData = (item: Usuario): Record<string, ReactNode> => ({
  id: item.id,
  name: item.name,
  email: item.email,
  active: item.active ? "Sim" : "Não",
  evaluator_pin: item.evaluator?.PIN || "-"
});

const transformCurrentItem = (item: Usuario): Record<string, unknown> => ({
  id: item.id,
  name: item.name,
  email: item.email,
  active: item.active,
  evaluator_pin: item.evaluator?.PIN || "-"
});

interface UsuariosPageProps {
  view: 'list' | 'detail' | 'create' | 'edit';
}

export const UsuariosPage = ({ view }: UsuariosPageProps) => {
  const PageComponent = DefaultPage<Usuario>;
  
  return (
    <PageComponent
      endpoint="/users/"
      title={view === 'list' ? "Usuários do Sistema" : "Usuário"}
      description="Gerencie os usuários do sistema saipru"
      view={view}
      columns={columns}
      formFields={formFields}
      detailFields={detailFields}
      transformData={transformData}
      transformCurrentItem={transformCurrentItem}
      deleteConfirmMessage={(item) => `Tem certeza que deseja excluir o usuário "${item.name}"? Esta ação não pode ser desfeita.`}
      basePath="/dashboard/usuarios"
    />
  );
};