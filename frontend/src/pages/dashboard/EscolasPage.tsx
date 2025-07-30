import { DataTable } from "@/components/ui/data-table";
import { mockEscolas } from "@/data/mockData";

const columns = [
  { key: "nome", label: "Nome da Escola", sortable: true },
  { key: "cidade", label: "Cidade", sortable: true },
  { key: "estado", label: "Estado", sortable: true }
];

export const EscolasPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ifms-green-dark">Escolas</h1>
        <p className="text-muted-foreground">
          Gerencie as escolas participantes da FECITEL
        </p>
      </div>
      
      <DataTable
        title="Lista de Escolas"
        columns={columns}
        data={mockEscolas}
        searchPlaceholder="Buscar por nome, cidade..."
        onAdd={() => console.log("Adicionar escola")}
        onEdit={(item) => console.log("Editar", item)}
        onDelete={(item) => console.log("Excluir", item)}
      />
    </div>
  );
};