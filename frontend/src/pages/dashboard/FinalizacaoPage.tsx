import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Trophy,
  Users,
  FileText,
  Award,
  Settings,
  Play,
  Pause,
  Square
} from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface FinalizacaoStatus {
  id: string;
  etapa: string;
  status: "pendente" | "em_andamento" | "concluido" | "pausado";
  progresso: number;
  descricao: string;
  responsavel: string;
  prazo: string;
}

const etapasFinalizacao: FinalizacaoStatus[] = [
  {
    id: "1",
    etapa: "Encerramento de Inscrições",
    status: "concluido",
    progresso: 100,
    descricao: "Período de inscrições finalizado com sucesso",
    responsavel: "Coordenação Geral",
    prazo: "15/03/2024"
  },
  {
    id: "2",
    etapa: "Processo de Avaliação",
    status: "em_andamento",
    progresso: 75,
    descricao: "Avaliações em andamento - 156 projetos",
    responsavel: "Comissão Avaliadora",
    prazo: "30/04/2024"
  },
  {
    id: "3",
    etapa: "Divulgação dos Resultados",
    status: "pendente",
    progresso: 0,
    descricao: "Aguardando conclusão das avaliações",
    responsavel: "Coordenação Geral",
    prazo: "15/05/2024"
  },
  {
    id: "4",
    etapa: "Cerimônia de Premiação",
    status: "pendente",
    progresso: 0,
    descricao: "Evento de premiação dos vencedores",
    responsavel: "Organização FECITEL",
    prazo: "20/05/2024"
  },
  {
    id: "5",
    etapa: "Relatório Final",
    status: "pendente",
    progresso: 0,
    descricao: "Elaboração do relatório final da edição",
    responsavel: "Coordenação Geral",
    prazo: "30/05/2024"
  }
];

const getStatusIcon = (status: FinalizacaoStatus["status"]) => {
  switch (status) {
    case "concluido":
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case "em_andamento":
      return <Play className="h-5 w-5 text-blue-600" />;
    case "pausado":
      return <Pause className="h-5 w-5 text-yellow-600" />;
    default:
      return <Clock className="h-5 w-5 text-gray-600" />;
  }
};

const getStatusBadge = (status: FinalizacaoStatus["status"]) => {
  const variants = {
    concluido: "bg-green-100 text-green-800",
    em_andamento: "bg-blue-100 text-blue-800",
    pausado: "bg-yellow-100 text-yellow-800",
    pendente: "bg-gray-100 text-gray-800"
  };

  const labels = {
    concluido: "Concluído",
    em_andamento: "Em Andamento",
    pausado: "Pausado",
    pendente: "Pendente"
  };

  return (
    <Badge className={variants[status]}>
      {labels[status]}
    </Badge>
  );
};

export const FinalizacaoPage = () => {
  const [etapas, setEtapas] = useState<FinalizacaoStatus[]>(etapasFinalizacao);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<{
    type: "iniciar" | "pausar" | "concluir";
    etapa: FinalizacaoStatus;
  } | null>(null);

  const handleAction = (etapa: FinalizacaoStatus, action: "iniciar" | "pausar" | "concluir") => {
    setActionToConfirm({ type: action, etapa });
    setShowConfirmDialog(true);
  };

  const confirmAction = () => {
    if (!actionToConfirm) return;

    const { type, etapa } = actionToConfirm;
    setEtapas(prev => prev.map(e => {
      if (e.id === etapa.id) {
        switch (type) {
          case "iniciar":
            return { ...e, status: "em_andamento" as const, progresso: e.progresso === 0 ? 10 : e.progresso };
          case "pausar":
            return { ...e, status: "pausado" as const };
          case "concluir":
            return { ...e, status: "concluido" as const, progresso: 100 };
          default:
            return e;
        }
      }
      return e;
    }));

    setShowConfirmDialog(false);
    setActionToConfirm(null);
  };

  const progressoGeral = etapas.reduce((acc, etapa) => acc + etapa.progresso, 0) / etapas.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ifms-green-dark">Finalização FECITEL</h1>
        <p className="text-muted-foreground">
          Acompanhe e gerencie o processo de finalização da FECITEL
        </p>
      </div>

      {/* Progresso Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Progresso Geral da Finalização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progresso Total</span>
              <span className="text-sm font-bold text-ifms-green-dark">{progressoGeral.toFixed(0)}%</span>
            </div>
            <Progress value={progressoGeral} className="h-3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-green-600">
                  {etapas.filter(e => e.status === "concluido").length}
                </div>
                <div className="text-muted-foreground">Concluídas</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-600">
                  {etapas.filter(e => e.status === "em_andamento").length}
                </div>
                <div className="text-muted-foreground">Em Andamento</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-yellow-600">
                  {etapas.filter(e => e.status === "pausado").length}
                </div>
                <div className="text-muted-foreground">Pausadas</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-600">
                  {etapas.filter(e => e.status === "pendente").length}
                </div>
                <div className="text-muted-foreground">Pendentes</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Etapas de Finalização */}
      <div className="grid gap-4">
        {etapas.map((etapa) => (
          <Card key={etapa.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(etapa.status)}
                  <div>
                    <CardTitle className="text-lg">{etapa.etapa}</CardTitle>
                    <p className="text-sm text-muted-foreground">{etapa.descricao}</p>
                  </div>
                </div>
                {getStatusBadge(etapa.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Progresso: {etapa.progresso}%</span>
                  <span>Prazo: {etapa.prazo}</span>
                </div>
                <Progress value={etapa.progresso} className="h-2" />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Responsável: {etapa.responsavel}</span>
                  <div className="flex gap-2">
                    {etapa.status === "pendente" && (
                      <Button
                        size="sm"
                        onClick={() => handleAction(etapa, "iniciar")}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Iniciar
                      </Button>
                    )}
                    {etapa.status === "em_andamento" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(etapa, "pausar")}
                        >
                          <Pause className="h-4 w-4 mr-1" />
                          Pausar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAction(etapa, "concluir")}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Concluir
                        </Button>
                      </>
                    )}
                    {etapa.status === "pausado" && (
                      <Button
                        size="sm"
                        onClick={() => handleAction(etapa, "iniciar")}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Retomar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Avaliados</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67</div>
            <p className="text-xs text-muted-foreground">
              +12% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliadores Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              Participando ativamente
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prêmios Disponíveis</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Categorias de premiação
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Confirmação */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Ação</AlertDialogTitle>
            <AlertDialogDescription>
              {actionToConfirm && (
                <>
                  Tem certeza que deseja {actionToConfirm.type === "iniciar" ? "iniciar" : 
                    actionToConfirm.type === "pausar" ? "pausar" : "concluir"} a etapa 
                  <strong> "{actionToConfirm.etapa.etapa}"</strong>?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}; 