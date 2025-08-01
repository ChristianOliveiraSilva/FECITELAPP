import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Users,
  Award
} from "lucide-react";

const HomePage = () => {
  // Dados fictícios para o painel de controle
  const dashboardData = {
    totalProjetos: 0,
    totalParaAvaliar: 0,
    totalAvaliados: 0,
    faltam1Avaliacao: 0,
    faltam2Avaliacoes: 0,
    faltam3Avaliacoes: 0,
    avaliadoresAtivos: 0,
    premiosDisponiveis: 0
  };

  const cards = [
    {
      title: "Total de Projetos",
      value: dashboardData.totalProjetos,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Projetos inscritos na FECITEL"
    },
    {
      title: "Trabalhos para Avaliar",
      value: dashboardData.totalParaAvaliar,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Aguardando avaliação"
    },
    {
      title: "Trabalhos Avaliados",
      value: dashboardData.totalAvaliados,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Avaliação concluída"
    },
    {
      title: "Faltam 1 Avaliação",
      value: dashboardData.faltam1Avaliacao,
      icon: AlertCircle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      description: "Próximos da conclusão"
    },
    {
      title: "Faltam 2 Avaliações",
      value: dashboardData.faltam2Avaliacoes,
      icon: BarChart3,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Em processo de avaliação"
    },
    {
      title: "Faltam 3 Avaliações",
      value: dashboardData.faltam3Avaliacoes,
      icon: TrendingUp,
      color: "text-red-600",
      bgColor: "bg-red-50",
      description: "Aguardando início"
    },
    {
      title: "Avaliadores Ativos",
      value: dashboardData.avaliadoresAtivos,
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      description: "Participando da avaliação"
    },
    {
      title: "Prêmios Disponíveis",
      value: dashboardData.premiosDisponiveis,
      icon: Award,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      description: "Categorias de premiação"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ifms-green-dark">Painel de Controle</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema FECITEL - acompanhe os principais indicadores
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-ifms-green-dark">
                  {card.value.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Seção de resumo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-ifms-green-dark">
              Resumo de Avaliações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Progresso Geral</span>
                <span className="text-sm font-medium">
                  {dashboardData.totalProjetos > 0 ? Math.round((dashboardData.totalAvaliados / dashboardData.totalProjetos) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-ifms-green h-2 rounded-full transition-all duration-300"
                  style={{ width: `${dashboardData.totalProjetos > 0 ? (dashboardData.totalAvaliados / dashboardData.totalProjetos) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Avaliados:</span>
                  <span className="ml-2 font-medium text-green-600">{dashboardData.totalAvaliados}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Pendentes:</span>
                  <span className="ml-2 font-medium text-orange-600">{dashboardData.totalParaAvaliar}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-ifms-green-dark">
              Status das Avaliações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Faltam 1 avaliação</span>
                <span className="text-sm font-medium text-yellow-600">{dashboardData.faltam1Avaliacao}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Faltam 2 avaliações</span>
                <span className="text-sm font-medium text-purple-600">{dashboardData.faltam2Avaliacoes}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Faltam 3 avaliações</span>
                <span className="text-sm font-medium text-red-600">{dashboardData.faltam3Avaliacoes}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total pendente</span>
                  <span className="text-sm font-bold text-ifms-green-dark">
                    {dashboardData.faltam1Avaliacao + dashboardData.faltam2Avaliacoes + dashboardData.faltam3Avaliacoes}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage; 