import { DataTable } from "@/components/ui/data-table";
import { mockProjetos } from "@/data/mockData";

const columns = [
  { key: "id_projeto", label: "ID do projeto", sortable: true },
  { key: "titulo", label: "Título", sortable: true },
  { key: "ano", label: "Ano", sortable: true },
  { key: "estudantes", label: "Estudantes", sortable: false },
  { key: "area", label: "Área", sortable: true },
  { key: "tipo_projeto", label: "Tipo de projeto", sortable: true }
];

export const ProjetosPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ifms-green-dark">Projetos</h1>
        <p className="text-muted-foreground">
          Gerencie os projetos inscritos na FECITEL
        </p>
      </div>
      
      <DataTable
        title="Lista de Projetos"
        columns={columns}
        data={mockProjetos}
        searchPlaceholder="Buscar por título, estudante, área..."
        onAdd={() => console.log("Adicionar projeto")}
        onEdit={(item) => console.log("Editar", item)}
        onDelete={(item) => console.log("Excluir", item)}
      />
    </div>
  );
};