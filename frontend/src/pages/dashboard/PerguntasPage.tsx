import { DataTable } from "@/components/ui/data-table";
import { mockPerguntas } from "@/data/mockData";

const columns = [
  { key: "texto_cientifico", label: "Texto Científico", sortable: false },
  { key: "texto_tecnologico", label: "Texto Tecnológico", sortable: false },
  { key: "tipo", label: "Tipo", sortable: true }
];

export const PerguntasPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ifms-green-dark">Perguntas</h1>
        <p className="text-muted-foreground">
          Gerencie as perguntas de avaliação da FECITEL
        </p>
      </div>
      
      <DataTable
        title="Lista de Perguntas"
        columns={columns}
        data={mockPerguntas}
        searchPlaceholder="Buscar por texto, tipo..."
        onAdd={() => console.log("Adicionar pergunta")}
        onEdit={(item) => console.log("Editar", item)}
        onDelete={(item) => console.log("Excluir", item)}
      />
    </div>
  );
};