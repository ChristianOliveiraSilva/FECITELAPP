import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (email: string, password: string) => {
    // Mock login - aceita qualquer email/senha
    setIsLoggedIn(true);
    toast({
      title: "Login realizado com sucesso!",
      description: `Bem-vindo ao sistema IFMS FECITEL`,
    });
    // Redirecionar para o dashboard
    navigate("/dashboard");
  };

  if (isLoggedIn) {
    return null; // O redirecionamento será feito pelo navigate
  }

  return <LoginForm onLogin={handleLogin} />;
};

export default Index;
