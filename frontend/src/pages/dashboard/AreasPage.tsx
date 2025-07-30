import { DataTable } from "@/components/ui/data-table";
import { mockAreas } from "@/data/mockData";

const columns = [
  { key: "nome", label: "Nome", sortable: true }
];

export const AreasPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ifms-green-dark">Áreas</h1>
        <p className="text-muted-foreground">
          Gerencie as áreas de conhecimento dos projetos
        </p>
      </div>
      
      <DataTable
        title="Lista de Áreas"
        columns={columns}
        data={mockAreas}
        searchPlaceholder="Buscar por nome da área..."
        onAdd={() => console.log("Adicionar área")}
        onEdit={(item) => console.log("Editar", item)}
        onDelete={(item) => console.log("Excluir", item)}
      />
    </div>
  );
};