import { useState } from "react";
import { ArrowLeft, Trash2, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const ExclusaoConta = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pin.trim()) {
      setError("Por favor, insira seu PIN");
      return;
    }

    if (pin.length < 4) {
      setError("O PIN deve ter pelo menos 4 dígitos");
      return;
    }

    setError("");
    setShowConfirmDialog(true);
  };

  const handleConfirmExclusion = async () => {
    setIsLoading(true);
    setShowConfirmDialog(false);

    try {
      // Aqui você implementaria a chamada para a API de exclusão de conta
      // await deleteAccount(pin);
      
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setShowSuccessDialog(true);
    } catch (error) {
      toast({
        title: "Erro ao excluir conta",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ifms-green-light to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Trash2 className="h-12 w-12 text-red-600 mr-3" />
              <h1 className="text-4xl font-bold text-red-600">
                Exclusão de Conta
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Esta ação é irreversível. Todos os seus dados serão permanentemente removidos.
            </p>
          </div>
        </div>

        {/* Formulário Principal */}
        <div className="max-w-md mx-auto">
          <Card className="border-red-200">
            <CardHeader className="text-center">
              <CardTitle className="text-red-600 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Atenção!
              </CardTitle>
              <CardDescription className="text-red-600">
                Esta ação não pode ser desfeita
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Importante:</strong> Ao excluir sua conta, você perderá permanentemente:
                </AlertDescription>
              </Alert>
              
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                <li>Todas as suas avaliações e comentários</li>
                <li>Histórico de atividades</li>
                <li>Configurações e preferências</li>
                <li>Acesso ao sistema iFecitel</li>
              </ul>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pin" className="text-sm font-medium">
                    Digite seu PIN de segurança
                  </Label>
                  <Input
                    id="pin"
                    type="password"
                    placeholder="Digite seu PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="text-center text-lg tracking-widest"
                    maxLength={8}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Este é o PIN que você usa para acessar o aplicativo
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="destructive"
                  size="lg"
                  className="w-full"
                  disabled={isLoading || !pin.trim()}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir Minha Conta
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="w-full"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modal de Confirmação */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center text-red-600">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Confirmação Final
              </AlertDialogTitle>
              <AlertDialogDescription className="text-left">
                <p className="mb-4">
                  Você está prestes a <strong>excluir permanentemente</strong> sua conta no iFecitel.
                </p>
                <p className="mb-4">
                  <strong>Esta ação não pode ser desfeita.</strong>
                </p>
                <p>
                  Digite <strong>"EXCLUIR"</strong> para confirmar:
                </p>
                <Input
                  type="text"
                  placeholder="Digite EXCLUIR"
                  className="mt-2 text-center font-bold"
                  onChange={(e) => {
                    if (e.target.value === "EXCLUIR") {
                      e.target.classList.add("border-green-500", "bg-green-50");
                    } else {
                      e.target.classList.remove("border-green-500", "bg-green-50");
                    }
                  }}
                />
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmExclusion}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Excluindo...
                  </>
                ) : (
                  "Confirmar Exclusão"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Modal de Sucesso */}
        <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center text-green-600">
                <CheckCircle className="h-5 w-5 mr-2" />
                Conta Excluída com Sucesso
              </AlertDialogTitle>
              <AlertDialogDescription>
                Sua conta foi permanentemente removida do sistema iFecitel. 
                Todos os seus dados foram excluídos conforme solicitado.
                <br /><br />
                Obrigado por ter utilizado nossos serviços.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={handleSuccessClose}>
                Entendi
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ExclusaoConta;
