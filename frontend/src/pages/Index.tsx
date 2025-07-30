import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AvaliacoesPage } from "@/pages/dashboard/AvaliacoesPage";
import { AreasPage } from "@/pages/dashboard/AreasPage";
import { ProjetosPage } from "@/pages/dashboard/ProjetosPage";
import { AvaliadoresPage } from "@/pages/dashboard/AvaliadoresPage";
import { EstudantesPage } from "@/pages/dashboard/EstudantesPage";
import { EscolasPage } from "@/pages/dashboard/EscolasPage";
import { UsuariosPage } from "@/pages/dashboard/UsuariosPage";
import { PremiacoesPage } from "@/pages/dashboard/PremiacoesPage";
import { PerguntasPage } from "@/pages/dashboard/PerguntasPage";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState("avaliacoes");
  const { toast } = useToast();

  const handleLogin = (email: string, password: string) => {
    // Mock login - aceita qualquer email/senha
    setIsLoggedIn(true);
    toast({
      title: "Login realizado com sucesso!",
      description: `Bem-vindo ao sistema IFMS FECITEL`,
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage("avaliacoes");
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado do sistema",
    });
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "avaliacoes":
        return <AvaliacoesPage />;
      case "areas":
        return <AreasPage />;
      case "projetos":
        return <ProjetosPage />;
      case "avaliadores":
        return <AvaliadoresPage />;
      case "estudantes":
        return <EstudantesPage />;
      case "escolas":
        return <EscolasPage />;
      case "usuarios":
        return <UsuariosPage />;
      case "premiacoes":
        return <PremiacoesPage />;
      case "perguntas":
        return <PerguntasPage />;
      default:
        return <AvaliacoesPage />;
    }
  };

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <DashboardLayout 
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      onLogout={handleLogout}
    >
      {renderCurrentPage()}
    </DashboardLayout>
  );
};

export default Index;
