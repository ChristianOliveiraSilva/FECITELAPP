import { DataTable } from "@/components/ui/data-table";
import { mockUsuarios } from "@/data/mockData";

const columns = [
  { key: "nome", label: "Nome", sortable: true },
  { key: "email", label: "E-mail", sortable: true },
  { key: "ativo", label: "Ativo", sortable: true }
];

export const UsuariosPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ifms-green-dark">Usuários do Sistema</h1>
        <p className="text-muted-foreground">
          Gerencie os usuários do sistema FECITEL
        </p>
      </div>
      
      <DataTable
        title="Lista de Usuários"
        columns={columns}
        data={mockUsuarios}
        searchPlaceholder="Buscar por nome, email..."
        onAdd={() => console.log("Adicionar usuário")}
        onEdit={(item) => console.log("Editar", item)}
        onDelete={(item) => console.log("Excluir", item)}
      />
    </div>
  );
};