import { ReactNode, useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  FileText,
  Calendar,
  Settings,
  ClipboardList,
  Upload
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const menuGroups = [
  {
    id: "home",
    items: [
      { id: "home", label: "Painel de Controle", icon: Home, path: "/dashboard/home" }
    ]
  },
  {
    id: "recursos",
    title: "Recursos",
    items: [
      { id: "avaliacoes", label: "Avaliações", icon: BarChart3, path: "/dashboard/avaliacoes" },
      { id: "areas", label: "Áreas", icon: FolderOpen, path: "/dashboard/areas" },
      { id: "projetos", label: "Projetos", icon: FolderOpen, path: "/dashboard/projetos" },
      { id: "perguntas", label: "Perguntas", icon: HelpCircle, path: "/dashboard/perguntas" },
      { id: "avaliadores", label: "Avaliadores", icon: UserCheck, path: "/dashboard/avaliadores" },
      { id: "estudantes", label: "Estudantes", icon: GraduationCap, path: "/dashboard/estudantes" },
      { id: "orientadores", label: "Orientadores", icon: ClipboardList, path: "/dashboard/orientadores" },
      { id: "escolas", label: "Escolas", icon: School, path: "/dashboard/escolas" },
      { id: "eventos", label: "Eventos", icon: Calendar, path: "/dashboard/eventos" },
      { id: "usuarios", label: "Usuários", icon: Users, path: "/dashboard/usuarios" },
      { id: "premiacoes", label: "Premiações", icon: Trophy, path: "/dashboard/premiacoes" },
    ]
  },
  {
    id: "configuracoes",
    title: "Configurações do sistema",
    items: [
      { id: "documentos", label: "Documentos", icon: FileText, path: "/dashboard/documentos" },
      { id: "importar-dados-gerais", label: "Importar dados gerais", icon: Upload, path: "/dashboard/importar-dados-gerais" },
      { id: "password-reset-config", label: "Reset Senha", icon: Settings, path: "/dashboard/password-reset-config" },
    ]
  }
];

export const DashboardWrapper = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [year, setYear] = useState(() => {
    return localStorage.getItem('year') || new Date().getFullYear().toString();
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, logout } = useAuth();

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = 2024; year <= currentYear; year++) {
      years.push(year.toString());
    }
    return years;
  };

  const handleYearChange = (newYear: string) => {
    setYear(newYear);
    localStorage.setItem('year', newYear);
    window.location.reload();
  };

  const getCurrentPage = () => {
    const path = location.pathname;
    for (const group of menuGroups) {
      const menuItem = group.items.find(item => item.path === path);
      if (menuItem) {
        return menuItem.id;
      }
    }
    return "home";
  };

  const handlePageChange = (pageId: string) => {
    for (const group of menuGroups) {
      const menuItem = group.items.find(item => item.id === pageId);
      if (menuItem) {
        navigate(menuItem.path);
        break;
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado do sistema",
      });
    } catch (error) {
      toast({
        title: "Erro no logout",
        description: "Erro ao fazer logout",
        variant: "destructive",
      });
    }
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
              className="text-white"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">IFMS FECITEL</h1>
            {user && (
              <span className="text-sm opacity-90">
                Olá, {user.name}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <Select value={year} onValueChange={handleYearChange}>
              <SelectTrigger className="w-20 h-8 bg-white/10 border-white/20 text-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {generateYears().map((yearOption) => (
                  <SelectItem key={yearOption} value={yearOption}>
                    {yearOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "bg-card border-r transition-all duration-300 flex-shrink-0",
          sidebarOpen ? "w-64" : "w-16"
        )}>
          <nav className="p-4 space-y-4">
            {menuGroups.map((group) => (
              <div key={group.id} className="space-y-2">
                {/* Título do grupo (apenas quando sidebar está aberta) */}
                {group.title && sidebarOpen && (
                  <div className="px-2 py-1">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {group.title}
                    </h3>
                  </div>
                )}
                
                {/* Itens do grupo */}
                <div className="space-y-1">
                  {group.items.map((item) => {
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
                </div>
                
                {/* Separador entre grupos (exceto para o último grupo) */}
                {group.id !== menuGroups[menuGroups.length - 1].id && sidebarOpen && (
                  <div className="border-t border-border/50 my-2" />
                )}
              </div>
            ))}
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