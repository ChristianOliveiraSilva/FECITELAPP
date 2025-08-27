import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  Users
} from "lucide-react";
import { cardsService, CardsData } from "@/services/cards";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [dashboardData, setDashboardData] = useState<CardsData>({
    total_projetos: 0,
    trabalhos_para_avaliar: 0,
    trabalhos_avaliados: 0,
    avaliadores_ativos: 0,
    progresso_geral: 0,
    status_avaliacoes: {
      faltam_1_avaliacao: 0,
      faltam_2_avaliacoes: 0,
      faltam_3_avaliacoes: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCardsData = async () => {
      try {
        setLoading(true);
        const data = await cardsService.getCardsData();
        setDashboardData(data);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao carregar dados do dashboard",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCardsData();
  }, [toast]);

  const handleCardClick = (type: 'all_projects' | 'evaluators' | 'pending' | 'evaluated' | 'missing_1' | 'missing_2' | 'missing_3') => {
    if (type === 'all_projects') {
      navigate('/dashboard/projetos');
    } else if (type === 'evaluators') {
      navigate('/dashboard/usuarios?role=avaliador');
    } else {
      navigate(`/dashboard/projetos?status=${type}`);
    }
  };

  const cards = [
    {
      title: "Total de Projetos",
      value: dashboardData.total_projetos,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Projetos inscritos na FECITEL",
      clickable: true,
      type: 'all_projects' as const
    },
    {
      title: "Trabalhos para Avaliar",
      value: dashboardData.trabalhos_para_avaliar,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Projetos sem nenhuma avaliação",
      clickable: true,
      type: 'pending' as const
    },
    {
      title: "Trabalhos Avaliados",
      value: dashboardData.trabalhos_avaliados,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Projetos com ao menos 1 avaliação concluída",
      clickable: true,
      type: 'evaluated' as const
    },
    {
      title: "Avaliadores Ativos",
      value: dashboardData.avaliadores_ativos,
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      description: "Participando da avaliação",
      clickable: true,
      type: 'evaluators' as const
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

      {loading ? (
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
                    <div className="animate-pulse bg-gray-200 h-8 rounded"></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card 
                key={index} 
                className={`hover:shadow-lg transition-shadow ${card.clickable ? 'cursor-pointer hover:scale-105' : ''}`}
                onClick={card.clickable ? () => handleCardClick(card.type!) : undefined}
              >
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
      )}

      {/* Seção de resumo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-ifms-green-dark">
              Resumo do Progresso das Avaliações dos Projetos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Progresso Geral</span>
                <span className="text-sm font-medium">
                  {dashboardData.progresso_geral}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-ifms-green h-2 rounded-full transition-all duration-300"
                  style={{ width: `${dashboardData.progresso_geral}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Avaliados:</span>
                  <span className="ml-2 font-medium text-green-600">{dashboardData.trabalhos_avaliados}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Pendentes:</span>
                  <span className="ml-2 font-medium text-orange-600">{dashboardData.trabalhos_para_avaliar}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground"><small>Este progresso não considera a finalização das 3 avaliações do projeto, mas sim se ele foi avaliado pelo menos uma vez</small></span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-ifms-green-dark">
              Status dos Projetos avaliados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div 
                className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                onClick={() => handleCardClick('missing_1')}
              >
                <span className="text-sm">Projetos que faltam 1 avaliação para conclusão</span>
                <span className="text-sm font-medium text-yellow-600">{dashboardData.status_avaliacoes.faltam_1_avaliacao}</span>
              </div>
              <div 
                className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                onClick={() => handleCardClick('missing_2')}
              >
                <span className="text-sm">Projetos que faltam 2 avaliações para conclusão</span>
                <span className="text-sm font-medium text-purple-600">{dashboardData.status_avaliacoes.faltam_2_avaliacoes}</span>
              </div>
              <div 
                className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                onClick={() => handleCardClick('missing_3')}
              >
                <span className="text-sm">Projetos que faltam 3 avaliações para conclusão</span>
                <span className="text-sm font-medium text-red-600">{dashboardData.status_avaliacoes.faltam_3_avaliacoes}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total pendente</span>
                  <span className="text-sm font-bold text-ifms-green-dark">
                    {dashboardData.status_avaliacoes.faltam_1_avaliacao + dashboardData.status_avaliacoes.faltam_2_avaliacoes + dashboardData.status_avaliacoes.faltam_3_avaliacoes} / {dashboardData.total_projetos}
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