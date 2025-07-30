import { DataTable } from "@/components/ui/data-table";
import { mockAvaliadores } from "@/data/mockData";

const columns = [
  { key: "nome", label: "Nome", sortable: true },
  { key: "pin", label: "PIN", sortable: false },
  { key: "quantidade_projetos", label: "Quantidade de projetos", sortable: true },
  { key: "area", label: "Área", sortable: true }
];

export const AvaliadoresPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ifms-green-dark">Avaliadores</h1>
        <p className="text-muted-foreground">
          Gerencie os avaliadores da FECITEL
        </p>
      </div>
      
      <DataTable
        title="Lista de Avaliadores"
        columns={columns}
        data={mockAvaliadores}
        searchPlaceholder="Buscar por nome, área..."
        onAdd={() => console.log("Adicionar avaliador")}
        onEdit={(item) => console.log("Editar", item)}
        onDelete={(item) => console.log("Excluir", item)}
      />
    </div>
  );
};