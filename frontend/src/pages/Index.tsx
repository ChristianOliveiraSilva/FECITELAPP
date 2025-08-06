import { useEffect } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading, login } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo!`,
      });
      
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ifms-green-light to-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ifms-green mx-auto"></div>
          <p className="mt-4 text-ifms-green-dark">Carregando...</p>
        </div>
      </div>
    );
  }

  return <LoginForm onLogin={handleLogin} isLoading={false} />;
};

export default Index;
