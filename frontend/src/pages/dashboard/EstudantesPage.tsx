import { DataTable } from "@/components/ui/data-table";
import { mockEstudantes } from "@/data/mockData";

const columns = [
  { key: "nome", label: "Nome", sortable: true },
  { key: "email", label: "E-mail", sortable: true },
  { key: "grau_escolaridade", label: "Grau de escolaridade", sortable: true },
  { key: "escola", label: "Escola", sortable: true }
];

export const EstudantesPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ifms-green-dark">Estudantes</h1>
        <p className="text-muted-foreground">
          Gerencie os estudantes participantes da FECITEL
        </p>
      </div>
      
      <DataTable
        title="Lista de Estudantes"
        columns={columns}
        data={mockEstudantes}
        searchPlaceholder="Buscar por nome, email, escola..."
        onAdd={() => console.log("Adicionar estudante")}
        onEdit={(item) => console.log("Editar", item)}
        onDelete={(item) => console.log("Excluir", item)}
      />
    </div>
  );
};