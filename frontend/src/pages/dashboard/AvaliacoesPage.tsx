import { DataTable } from "@/components/ui/data-table";
import { mockAvaliacoes } from "@/data/mockData";

const columns = [
  { key: "avaliador", label: "Avaliador", sortable: true },
  { key: "projeto_id", label: "ID do Projeto", sortable: true },
  { key: "projeto", label: "Projeto", sortable: true },
  { key: "possui_respostas", label: "Possui Respostas", sortable: true }
];

export const AvaliacoesPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ifms-green-dark">Avaliações</h1>
        <p className="text-muted-foreground">
          Gerencie as avaliações dos projetos da FECITEL
        </p>
      </div>
      
      <DataTable
        title="Lista de Avaliações"
        columns={columns}
        data={mockAvaliacoes}
        searchPlaceholder="Buscar por avaliador, projeto..."
        onAdd={() => console.log("Adicionar avaliação")}
        onEdit={(item) => console.log("Editar", item)}
        onDelete={(item) => console.log("Excluir", item)}
      />
    </div>
  );
};