import { DataTable } from "@/components/ui/data-table";
import { mockPremiacoes } from "@/data/mockData";

const columns = [
  { key: "nome", label: "Nome", sortable: true },
  { key: "grau_escolaridade", label: "Grau de Escolaridade", sortable: true },
  { key: "total_colocacoes", label: "Total de colocações", sortable: true },
  { key: "usar_graus_escolaridade", label: "Usar Graus de escolaridade?", sortable: true },
  { key: "usar_areas", label: "Usar Áreas?", sortable: true }
];

export const PremiacoesPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ifms-green-dark">Premiações</h1>
        <p className="text-muted-foreground">
          Gerencie as premiações da FECITEL
        </p>
      </div>
      
      <DataTable
        title="Lista de Premiações"
        columns={columns}
        data={mockPremiacoes}
        searchPlaceholder="Buscar por nome, grau de escolaridade..."
        onAdd={() => console.log("Adicionar premiação")}
        onEdit={(item) => console.log("Editar", item)}
        onDelete={(item) => console.log("Excluir", item)}
      />
    </div>
  );
};