import { ReactNode } from "react";
import { DefaultPage } from "@/components/ui/default-page";

interface Evento extends Record<string, unknown> {
  id?: number;
  year: number;
  app_primary_color: string;
  app_font_color: string;
  app_logo_url?: string;
  created_at?: string;
  updated_at?: string;
}

const columns = [
  { 
    key: "year", 
    label: "Ano", 
    sortable: true, 
    filterable: false, 
    filterType: 'number' as const 
  },
  { 
    key: "app_primary_color", 
    label: "Cor Primária", 
    sortable: false, 
    filterable: false 
  },
  { 
    key: "app_font_color", 
    label: "Cor Fonte", 
    sortable: false, 
    filterable: false 
  },
  { 
    key: "app_logo_url", 
    label: "Logo", 
    sortable: false, 
    filterable: false 
  }
];

const formFields = [
  {
    name: "year",
    label: "Ano",
    type: "number" as const,
    required: true,
    placeholder: "Digite o ano do evento"
  },
  {
    name: "app_primary_color",
    label: "Cor Primária",
    type: "color" as const,
    required: true,
    placeholder: "Selecione a cor primária"
  },
  {
    name: "app_font_color",
    label: "Cor Fonte",
    type: "color" as const,
    required: true,
    placeholder: "Selecione a cor da fonte"
  },
  {
    name: "logo",
    label: "Logo",
    type: "file" as const,
    required: true,
    accept: "image/*"
  }
];

const detailFields = [
  { key: "year", label: "Ano", type: "number" as const },
  { key: "app_primary_color", label: "Cor Primária", type: "text" as const },
  { key: "app_font_color", label: "Cor Fonte", type: "text" as const },
  { key: "app_logo_url", label: "Logo", type: "image" as const }
];

const transformData = (item: Evento): Record<string, ReactNode> => ({
  id: item.id,
  year: item.year,
  app_primary_color: (
    <div className="flex items-center space-x-2">
      <div 
        className="w-6 h-6 rounded border"
        style={{ backgroundColor: item.app_primary_color as string }}
      />
      <span>{item.app_primary_color}</span>
    </div>
  ),
  app_font_color: (
    <div className="flex items-center space-x-2">
      <div 
        className="w-6 h-6 rounded border"
        style={{ backgroundColor: item.app_font_color as string }}
      />
      <span>{item.app_font_color}</span>
    </div>
  ),
  app_logo_url: item.app_logo_url ? (
    <img 
      src={`${import.meta.env.VITE_API_URL}${item.app_logo_url as string}`} 
      alt="Logo" 
      className="w-8 h-8 object-contain"
    />
  ) : "-",
  created_at: item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : "-",
  updated_at: item.updated_at
});

const transformCurrentItem = (item: Evento): Record<string, unknown> => ({
  id: item.id,
  year: item.year,
  app_primary_color: item.app_primary_color,
  app_font_color: item.app_font_color,
  app_logo_url: item.app_logo_url || "-",
  created_at: item.created_at,
  updated_at: item.updated_at
});

interface EventosPageProps {
  view: 'list' | 'detail' | 'create' | 'edit';
}

export const EventosPage = ({ view }: EventosPageProps) => {
  const PageComponent = DefaultPage<Evento>;
  
  return (
    <PageComponent
      endpoint="/events/"
      title={view === 'list' ? "Eventos" : "Evento"}
      description="Gerencie os eventos da saipru"
      view={view}
      columns={columns}
      formFields={formFields}
      detailFields={detailFields}
      transformData={transformData}
      transformCurrentItem={transformCurrentItem}
      deleteConfirmMessage={(item) => `Tem certeza que deseja excluir o evento do ano "${item.year}"? Esta ação não pode ser desfeita.`}
      basePath="/dashboard/eventos"
    />
  );
};
