import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  LogOut, 
  BarChart3, 
  Users, 
  FolderOpen, 
  UserCheck, 
  GraduationCap, 
  School, 
  Settings, 
  Trophy,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
}

const menuItems = [
  { id: "avaliacoes", label: "Avaliações", icon: BarChart3 },
  { id: "areas", label: "Áreas", icon: FolderOpen },
  { id: "projetos", label: "Projetos", icon: FolderOpen },
  { id: "avaliadores", label: "Avaliadores", icon: UserCheck },
  { id: "estudantes", label: "Estudantes", icon: GraduationCap },
  { id: "escolas", label: "Escolas", icon: School },
  { id: "usuarios", label: "Usuários", icon: Users },
  { id: "premiacoes", label: "Premiações", icon: Trophy },
  { id: "perguntas", label: "Perguntas", icon: HelpCircle },
];

export const DashboardLayout = ({ 
  children, 
  currentPage, 
  onPageChange, 
  onLogout 
}: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-ifms-green text-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white hover:bg-ifms-green-dark"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">IFMS FECITEL</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-white hover:bg-ifms-green-dark"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "bg-card border-r transition-all duration-300 flex-shrink-0",
          sidebarOpen ? "w-64" : "w-16"
        )}>
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    currentPage === item.id && "bg-ifms-green hover:bg-ifms-green-dark",
                    !sidebarOpen && "px-2"
                  )}
                  onClick={() => onPageChange(item.id)}
                >
                  <Icon className="h-4 w-4" />
                  {sidebarOpen && <span className="ml-2">{item.label}</span>}
                </Button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};