import { ReactNode, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
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
  Trophy,
  HelpCircle,
  Home,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  { id: "home", label: "Painel de Controle", icon: Home, path: "/dashboard/home" },
  { id: "avaliacoes", label: "Avaliações", icon: BarChart3, path: "/dashboard/avaliacoes" },
  { id: "areas", label: "Áreas", icon: FolderOpen, path: "/dashboard/areas" },
  { id: "projetos", label: "Projetos", icon: FolderOpen, path: "/dashboard/projetos" },
  { id: "avaliadores", label: "Avaliadores", icon: UserCheck, path: "/dashboard/avaliadores" },
  { id: "estudantes", label: "Estudantes", icon: GraduationCap, path: "/dashboard/estudantes" },
  { id: "escolas", label: "Escolas", icon: School, path: "/dashboard/escolas" },
  { id: "usuarios", label: "Usuários", icon: Users, path: "/dashboard/usuarios" },
  { id: "premiacoes", label: "Premiações", icon: Trophy, path: "/dashboard/premiacoes" },
  { id: "perguntas", label: "Perguntas", icon: HelpCircle, path: "/dashboard/perguntas" },
  { id: "finalizacao", label: "Finalização", icon: CheckCircle, path: "/dashboard/finalizacao" },
];

export const DashboardWrapper = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const getCurrentPage = () => {
    const path = location.pathname;
    const menuItem = menuItems.find(item => item.path === path);
    return menuItem ? menuItem.id : "home";
  };

  const handlePageChange = (pageId: string) => {
    const menuItem = menuItems.find(item => item.id === pageId);
    if (menuItem) {
      navigate(menuItem.path);
    }
  };

  const handleLogout = () => {
    navigate("/");
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado do sistema",
    });
  };

  const currentPage = getCurrentPage();

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
            onClick={handleLogout}
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
                  onClick={() => handlePageChange(item.id)}
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
          <Outlet />
        </main>
      </div>
    </div>
  );
}; 